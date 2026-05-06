import { describe, it, expect } from "vitest";
import { proposeCandidates } from "./ai-scheduler";
import type { Task, HabitModel, HourlyWeights, TimeRange } from "./types";

const flatHabitModel: HabitModel = {
  getProductivityWeights: () => Array(24).fill(1) as unknown as HourlyWeights,
};

// Default Habit Model with peak 9–12 (as per PRD cold-start default)
const defaultHabitModel: HabitModel = {
  getProductivityWeights: () => {
    const weights = Array(24).fill(1) as number[];
    weights[9] = 3;
    weights[10] = 3;
    weights[11] = 3;
    return weights as unknown as HourlyWeights;
  },
};

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Test task",
    dueDate: null,
    priority: "medium",
    estimatedDurationMinutes: 60,
    tags: [],
    notes: "",
    status: "incomplete",
    createdAt: new Date(),
    completedAt: null,
    ...overrides,
  };
}

function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && a.end > b.start;
}

describe("proposeCandidates", () => {
  it("returns empty array when no free slots exist in the next 7 days", () => {
    const now = new Date("2026-05-06T08:00:00");
    const task = makeTask({ estimatedDurationMinutes: 60 });

    // Block every working hour for 7 days
    const occupied: TimeRange[] = [];
    for (let day = 0; day < 8; day++) {
      const start = new Date("2026-05-06T08:00:00");
      start.setDate(start.getDate() + day);
      const end = new Date(start);
      end.setHours(20, 0, 0, 0);
      occupied.push({ start, end });
    }

    const candidates = proposeCandidates(task, occupied, flatHabitModel, now);
    expect(candidates).toHaveLength(0);
  });

  it("candidates are sorted by score descending", () => {
    const now = new Date("2026-05-06T08:00:00");
    const task = makeTask({ estimatedDurationMinutes: 30 });

    const candidates = proposeCandidates(task, [], defaultHabitModel, now);

    expect(candidates.length).toBeGreaterThan(1);
    for (let i = 0; i < candidates.length - 1; i++) {
      expect(candidates[i].score).toBeGreaterThanOrEqual(candidates[i + 1].score);
    }
  });

  it("high-priority task is proposed in the 9–12am window under the default Habit Model", () => {
    // now = Monday 2026-05-06 08:00, no occupied ranges
    const now = new Date("2026-05-06T08:00:00");
    const task = makeTask({ priority: "high", estimatedDurationMinutes: 60 });

    const candidates = proposeCandidates(task, [], defaultHabitModel, now);

    expect(candidates.length).toBeGreaterThan(0);
    // Top candidate should start in the 9–12 window
    const topCandidate = candidates[0];
    expect(topCandidate.start.getHours()).toBeGreaterThanOrEqual(9);
    expect(topCandidate.start.getHours()).toBeLessThan(12);
  });

  it("no proposed candidate overlaps an occupied range", () => {
    // now = Monday 2026-05-06 08:00
    const now = new Date("2026-05-06T08:00:00");
    const task = makeTask({ estimatedDurationMinutes: 60 });

    // Block 9am–11am on the same day
    const occupied: TimeRange[] = [
      {
        start: new Date("2026-05-06T09:00:00"),
        end: new Date("2026-05-06T11:00:00"),
      },
    ];

    const candidates = proposeCandidates(task, occupied, flatHabitModel, now);

    for (const candidate of candidates) {
      const candidateRange: TimeRange = { start: candidate.start, end: candidate.end };
      for (const busy of occupied) {
        expect(overlaps(candidateRange, busy)).toBe(false);
      }
    }
  });
});
