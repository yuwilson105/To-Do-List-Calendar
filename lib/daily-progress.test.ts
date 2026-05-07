import { describe, it, expect } from "vitest";
import { getDailyProgress } from "./daily-progress";
import type { Task } from "./types";

interface TimeBlock {
  taskId: string;
  start: Date;
  end: Date;
}

const TODAY = new Date("2026-05-06T10:00:00");

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
    createdAt: TODAY,
    completedAt: null,
    ...overrides,
  };
}

describe("getDailyProgress", () => {
  it("a task due today (incomplete) counts toward total but not completed", () => {
    const task = makeTask({
      dueDate: new Date("2026-05-06T23:59:59"),
      status: "incomplete",
    });

    const result = getDailyProgress([task], [], TODAY);

    expect(result.total).toBe(1);
    expect(result.completed).toBe(0);
  });

  it("a task with a Time Block starting today counts toward total but not completed", () => {
    const task = makeTask({ id: "task-2", status: "incomplete" });
    const timeBlocks: TimeBlock[] = [
      {
        taskId: "task-2",
        start: new Date("2026-05-06T14:00:00"),
        end: new Date("2026-05-06T14:30:00"),
      },
    ];

    const result = getDailyProgress([task], timeBlocks, TODAY);

    expect(result.total).toBe(1);
    expect(result.completed).toBe(0);
  });

  it("a task with no due date and no Time Block today is excluded from total", () => {
    const task = makeTask({ dueDate: null, status: "incomplete" });

    const result = getDailyProgress([task], [], TODAY);

    expect(result.total).toBe(0);
    expect(result.completed).toBe(0);
  });

  it("a task completed yesterday is excluded entirely", () => {
    const yesterday = new Date("2026-05-05T09:00:00");
    const task = makeTask({
      status: "complete",
      completedAt: yesterday,
      dueDate: null,
    });

    const result = getDailyProgress([task], [], TODAY);

    expect(result.total).toBe(0);
    expect(result.completed).toBe(0);
  });

  it("a task completed today counts as both completed and total", () => {
    const task = makeTask({
      status: "complete",
      completedAt: new Date("2026-05-06T09:00:00"),
    });

    const result = getDailyProgress([task], [], TODAY);

    expect(result.completed).toBe(1);
    expect(result.total).toBe(1);
  });
});
