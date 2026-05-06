import { describe, it, expect, beforeEach } from "vitest";
import { HabitModel, InMemoryHabitStore } from "./habit-model";

function makeHabitModel() {
  const store = new InMemoryHabitStore();
  const model = new HabitModel(store);
  return { model, store };
}

function completionAt(hour: number, tags: string[] = [], scheduledStart: Date | null = null) {
  const completedAt = new Date(`2026-05-06T${String(hour).padStart(2, "0")}:00:00`);
  return { taskId: "t1", completedAt, hourOfDay: hour, tags, scheduledStart };
}

describe("HabitModel", () => {
  it("recordCompletion makes a completion retrievable via getProductivityWeights", () => {
    const { model } = makeHabitModel();

    // Record 10 completions at hour 15 (3pm) via the public interface
    for (let i = 0; i < 10; i++) {
      model.recordCompletion("task-1", new Date("2026-05-06T15:00:00"), []);
    }

    const weights = model.getProductivityWeights();

    // Hour 15 should now have a higher weight than hour 8 (no completions)
    expect(weights[15]).toBeGreaterThan(weights[8]);
  });

  it("getProcrastinationDeltaByTag returns the correct average delta for a known set of completions", () => {
    const { model, store } = makeHabitModel();

    const scheduledStart1 = new Date("2026-05-06T09:00:00");
    const completedAt1 = new Date("2026-05-06T09:30:00"); // 30 min late

    const scheduledStart2 = new Date("2026-05-06T14:00:00");
    const completedAt2 = new Date("2026-05-06T14:10:00"); // 10 min late

    store.insertCompletion({ taskId: "t1", completedAt: completedAt1, hourOfDay: 9, tags: ["work"], scheduledStart: scheduledStart1 });
    store.insertCompletion({ taskId: "t2", completedAt: completedAt2, hourOfDay: 14, tags: ["work"], scheduledStart: scheduledStart2 });
    // This one has a different tag — should not be included
    store.insertCompletion({ taskId: "t3", completedAt: completedAt1, hourOfDay: 9, tags: ["personal"], scheduledStart: scheduledStart1 });

    const delta = model.getProcrastinationDeltaByTag("work");

    // Average of 30 and 10 = 20 minutes
    expect(delta).toBe(20);
  });

  it("after 10+ completions concentrated at 9–11am, those hours have higher weights than others", () => {
    const { model, store } = makeHabitModel();

    // 10 completions all at 9am
    for (let i = 0; i < 10; i++) {
      store.insertCompletion(completionAt(9));
    }

    const weights = model.getProductivityWeights();

    // Hour 9 should now outweigh hour 14 (2pm, no completions)
    expect(weights[9]).toBeGreaterThan(weights[14]);
  });

  it("getProductivityWeights returns the default curve when fewer than 10 completions exist", () => {
    const { model, store } = makeHabitModel();

    // Add 9 completions — one below the threshold
    for (let i = 0; i < 9; i++) {
      store.insertCompletion(completionAt(14)); // all at 2pm
    }

    const weights = model.getProductivityWeights();

    // Default curve has peak at 9–11 (weight 3), not at 14 (weight 1)
    expect(weights[9]).toBeGreaterThan(weights[14]);
    expect(weights[10]).toBeGreaterThan(weights[14]);
    expect(weights[11]).toBeGreaterThan(weights[14]);
  });
});
