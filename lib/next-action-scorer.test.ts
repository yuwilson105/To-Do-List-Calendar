import { describe, it, expect } from "vitest";
import { scoreTask } from "./next-action-scorer";
import type { Task, HabitModel, HourlyWeights } from "./types";

// Default Habit Model — flat weights (no time-of-day preference)
const flatHabitModel: HabitModel = {
  getProductivityWeights: () =>
    Array(24).fill(1) as unknown as HourlyWeights,
};

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Test task",
    dueDate: null,
    priority: "medium",
    estimatedDurationMinutes: 30,
    tags: [],
    notes: "",
    status: "incomplete",
    createdAt: new Date(),
    completedAt: null,
    ...overrides,
  };
}

// Habit Model that heavily favours hour 9 (index 9)
const morningHeavyHabitModel: HabitModel = {
  getProductivityWeights: () => {
    const weights = Array(24).fill(1) as number[];
    weights[9] = 10; // 10x weight at 9am
    return weights as unknown as HourlyWeights;
  },
};

describe("scoreTask", () => {
  it("completed task scores 0", () => {
    const now = new Date("2026-05-06T10:00:00");
    const task = makeTask({
      priority: "high",
      dueDate: new Date("2026-05-06T11:00:00"),
      status: "complete",
      completedAt: now,
    });

    expect(scoreTask(task, flatHabitModel, now)).toBe(0);
  });

  it("Habit Model hourly weight for the current hour influences the score", () => {
    const at9am = new Date("2026-05-06T09:00:00");
    const at2pm = new Date("2026-05-06T14:00:00");
    const task = makeTask({ priority: "medium", dueDate: null });

    // Same task, same time — but morningHeavyHabitModel gives 10x weight at 9am
    const scoreAt9amWithHabit = scoreTask(task, morningHeavyHabitModel, at9am);
    const scoreAt9amFlat = scoreTask(task, flatHabitModel, at9am);
    const scoreAt2pmWithHabit = scoreTask(task, morningHeavyHabitModel, at2pm);

    // morningHeavyHabitModel at 9am should score higher than flat at 9am
    expect(scoreAt9amWithHabit).toBeGreaterThan(scoreAt9amFlat);
    // morningHeavyHabitModel at 9am should score higher than morningHeavyHabitModel at 2pm
    expect(scoreAt9amWithHabit).toBeGreaterThan(scoreAt2pmWithHabit);
  });

  it("score increases as due date gets closer (same priority)", () => {
    const now = new Date("2026-05-06T10:00:00");
    const dueIn1Hour = new Date("2026-05-06T11:00:00");
    const dueIn48Hours = new Date("2026-05-08T10:00:00");

    const soonTask = makeTask({ priority: "medium", dueDate: dueIn1Hour });
    const laterTask = makeTask({ priority: "medium", dueDate: dueIn48Hours });

    expect(scoreTask(soonTask, flatHabitModel, now)).toBeGreaterThan(
      scoreTask(laterTask, flatHabitModel, now)
    );
  });

  it("high-priority task due today scores higher than low-priority task due next week", () => {
    const now = new Date("2026-05-06T10:00:00");
    const today = new Date("2026-05-06T23:59:59");
    const nextWeek = new Date("2026-05-13T23:59:59");

    const urgent = makeTask({ priority: "high", dueDate: today });
    const relaxed = makeTask({ priority: "low", dueDate: nextWeek });

    expect(scoreTask(urgent, flatHabitModel, now)).toBeGreaterThan(
      scoreTask(relaxed, flatHabitModel, now)
    );
  });
});
