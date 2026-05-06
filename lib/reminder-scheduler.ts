import type { Task, Priority } from "./types";

const LEAD_TIME_MINUTES: Record<Priority, number> = {
  high: 15,
  medium: 5,
  low: 5,
};

export interface PendingReminder {
  id: string;
  taskId: string;
  scheduledAt: Date;
  channel: "push" | "email";
}

export interface ReminderStore {
  getPendingReminders(before: Date): PendingReminder[];
  markDispatched(reminderId: string): void;
  markFailed(reminderId: string, taskId: string, scheduledAt: Date): void;
}

export interface Notifier {
  send(reminder: PendingReminder): Promise<void>;
}

/**
 * Returns the reminder lead time in minutes for a given Task.
 * High priority → 15 minutes. Medium/low → 5 minutes.
 */
export function computeLeadTime(task: Task): number {
  return LEAD_TIME_MINUTES[task.priority];
}

/**
 * Dispatches all pending reminders due before `now`.
 * Marks each reminder as dispatched on success, or failed on error.
 *
 * The notifier is injected so callers can provide a real push/email sender
 * or a test double without mocking internals.
 */
export async function dispatchPendingReminders(
  now: Date,
  store: ReminderStore,
  notifier: Notifier
): Promise<void> {
  const pending = store.getPendingReminders(now);

  for (const reminder of pending) {
    try {
      await notifier.send(reminder);
      store.markDispatched(reminder.id);
    } catch {
      store.markFailed(reminder.id, reminder.taskId, reminder.scheduledAt);
    }
  }
}
