import { describe, it, expect, beforeEach } from "vitest";
import { openDb } from "./connection";
import { TaskStore } from "./task-store";
import { TimeBlockStore } from "./time-block-store";
import type { Task, TimeBlock } from "../types";

// Each test gets a fresh in-memory database — no file cleanup needed.
function makeStores() {
  const db = openDb(":memory:");
  return {
    taskStore: new TaskStore(db),
    timeBlockStore: new TimeBlockStore(db),
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: "Test task",
    dueDate: null,
    priority: "medium",
    estimatedDurationMinutes: 30,
    tags: [],
    notes: "",
    status: "incomplete",
    createdAt: new Date("2026-05-06T09:00:00.000Z"),
    completedAt: null,
    ...overrides,
  };
}

function makeTimeBlock(taskId: string, overrides: Partial<TimeBlock> = {}): TimeBlock {
  return {
    taskId,
    start: new Date("2026-05-06T10:00:00.000Z"),
    end: new Date("2026-05-06T10:30:00.000Z"),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// TaskStore
// ---------------------------------------------------------------------------

describe("TaskStore", () => {
  it("insert then getAll returns the inserted task with correct fields", () => {
    const { taskStore } = makeStores();
    const task = makeTask({
      title: "Write tests",
      priority: "high",
      tags: ["work", "dev"],
      notes: "important",
      dueDate: new Date("2026-05-10T00:00:00.000Z"),
    });

    taskStore.insert(task);
    const all = taskStore.getAll();

    expect(all).toHaveLength(1);
    const retrieved = all[0];
    expect(retrieved.id).toBe(task.id);
    expect(retrieved.title).toBe("Write tests");
    expect(retrieved.priority).toBe("high");
    expect(retrieved.tags).toEqual(["work", "dev"]);
    expect(retrieved.notes).toBe("important");
    expect(retrieved.status).toBe("incomplete");
    expect(retrieved.dueDate?.toISOString()).toBe("2026-05-10T00:00:00.000Z");
    expect(retrieved.completedAt).toBeNull();
  });

  it("update with { status: complete, completedAt } makes the task retrievable as complete", () => {
    const { taskStore } = makeStores();
    const task = makeTask();
    taskStore.insert(task);

    const completedAt = new Date("2026-05-06T11:00:00.000Z");
    taskStore.update(task.id, { status: "complete", completedAt });

    const all = taskStore.getAll();
    expect(all[0].status).toBe("complete");
    expect(all[0].completedAt?.toISOString()).toBe("2026-05-06T11:00:00.000Z");
  });

  it("getAll returns tasks ordered by createdAt ascending", () => {
    const { taskStore } = makeStores();

    const first = makeTask({ createdAt: new Date("2026-05-06T08:00:00.000Z"), title: "First" });
    const third = makeTask({ createdAt: new Date("2026-05-06T10:00:00.000Z"), title: "Third" });
    const second = makeTask({ createdAt: new Date("2026-05-06T09:00:00.000Z"), title: "Second" });

    // Insert out of order
    taskStore.insert(third);
    taskStore.insert(first);
    taskStore.insert(second);

    const all = taskStore.getAll();
    expect(all.map((t) => t.title)).toEqual(["First", "Second", "Third"]);
  });

  it("update only changes the specified fields, leaving others intact", () => {
    const { taskStore } = makeStores();
    const task = makeTask({ title: "Original title", priority: "low" });
    taskStore.insert(task);

    taskStore.update(task.id, { priority: "high" });

    const all = taskStore.getAll();
    expect(all[0].title).toBe("Original title"); // unchanged
    expect(all[0].priority).toBe("high"); // updated
  });
});

// ---------------------------------------------------------------------------
// TimeBlockStore
// ---------------------------------------------------------------------------

describe("TimeBlockStore", () => {
  it("insert then getAll returns the inserted time block with correct fields", () => {
    const { taskStore, timeBlockStore } = makeStores();
    const task = makeTask();
    taskStore.insert(task);

    const block = makeTimeBlock(task.id);
    timeBlockStore.insert(block);

    const all = timeBlockStore.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].taskId).toBe(task.id);
    expect(all[0].start.toISOString()).toBe("2026-05-06T10:00:00.000Z");
    expect(all[0].end.toISOString()).toBe("2026-05-06T10:30:00.000Z");
  });

  it("deleteByTaskId removes all blocks for that task and leaves others untouched", () => {
    const { taskStore, timeBlockStore } = makeStores();

    const taskA = makeTask({ title: "Task A" });
    const taskB = makeTask({ title: "Task B" });
    taskStore.insert(taskA);
    taskStore.insert(taskB);

    timeBlockStore.insert(makeTimeBlock(taskA.id));
    timeBlockStore.insert(makeTimeBlock(taskA.id, {
      start: new Date("2026-05-06T14:00:00.000Z"),
      end: new Date("2026-05-06T14:30:00.000Z"),
    }));
    timeBlockStore.insert(makeTimeBlock(taskB.id));

    timeBlockStore.deleteByTaskId(taskA.id);

    const remaining = timeBlockStore.getAll();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].taskId).toBe(taskB.id);
  });

  it("getAll returns empty array when no blocks exist", () => {
    const { timeBlockStore } = makeStores();
    expect(timeBlockStore.getAll()).toEqual([]);
  });
});
