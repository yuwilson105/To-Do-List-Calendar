import { describe, it, expect, vi } from "vitest";
import { computeLeadTime, dispatchPendingReminders } from "./reminder-scheduler";
import type { Task } from "./types";
import type { PendingReminder, ReminderStore, Notifier } from "./reminder-scheduler";

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

function makeReminder(overrides: Partial<PendingReminder> = {}): PendingReminder {
  return {
    id: "reminder-1",
    taskId: "task-1",
    scheduledAt: new Date("2026-05-06T09:00:00"),
    channel: "push",
    ...overrides,
  };
}

class InMemoryReminderStore implements ReminderStore {
  private reminders: PendingReminder[];
  dispatched: string[] = [];
  failed: Array<{ id: string; taskId: string; scheduledAt: Date }> = [];

  constructor(reminders: PendingReminder[]) {
    this.reminders = reminders;
  }

  getPendingReminders(_before: Date): PendingReminder[] {
    return this.reminders;
  }

  markDispatched(reminderId: string): void {
    this.dispatched.push(reminderId);
  }

  markFailed(reminderId: string, taskId: string, scheduledAt: Date): void {
    this.failed.push({ id: reminderId, taskId, scheduledAt });
  }
}

describe("computeLeadTime", () => {
  it("medium-priority task gets a 5-minute lead time", () => {
    const task = makeTask({ priority: "medium" });
    expect(computeLeadTime(task)).toBe(5);
  });

  it("low-priority task gets a 5-minute lead time", () => {
    const task = makeTask({ priority: "low" });
    expect(computeLeadTime(task)).toBe(5);
  });

  it("high-priority task gets a 15-minute lead time", () => {
    const task = makeTask({ priority: "high" });
    expect(computeLeadTime(task)).toBe(15);
  });
});

describe("dispatchPendingReminders", () => {
  it("marks a due reminder as dispatched after the notifier succeeds", async () => {
    const reminder = makeReminder();
    const store = new InMemoryReminderStore([reminder]);
    const notifier: Notifier = { send: vi.fn().mockResolvedValue(undefined) };

    await dispatchPendingReminders(new Date(), store, notifier);

    expect(store.dispatched).toContain("reminder-1");
    expect(store.failed).toHaveLength(0);
  });

  it("marks a reminder as failed when the notifier throws", async () => {
    const reminder = makeReminder();
    const store = new InMemoryReminderStore([reminder]);
    const notifier: Notifier = {
      send: vi.fn().mockRejectedValue(new Error("network error")),
    };

    await dispatchPendingReminders(new Date(), store, notifier);

    expect(store.failed).toHaveLength(1);
    expect(store.failed[0].id).toBe("reminder-1");
    expect(store.failed[0].taskId).toBe("task-1");
    expect(store.dispatched).toHaveLength(0);
  });
});
