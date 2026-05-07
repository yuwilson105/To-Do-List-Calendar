import type { Task } from "./types";

export interface TimeBlock {
  taskId: string;
  start: Date;
  end: Date;
}

export interface DailyProgress {
  completed: number;
  total: number;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Calculates today's progress for the progress bar.
 *
 * A Task counts toward `total` if:
 *   - It was completed today, OR
 *   - Its dueDate is today, OR
 *   - It has a Time Block starting today
 *
 * A Task counts toward `completed` if:
 *   - Its status is "complete" AND completedAt is today
 *
 * Pure function — no side effects.
 */
export function getDailyProgress(
  tasks: Task[],
  timeBlocks: TimeBlock[],
  today: Date
): DailyProgress {
  let completed = 0;
  let total = 0;

  for (const task of tasks) {
    const completedToday =
      task.status === "complete" &&
      task.completedAt !== null &&
      isSameDay(task.completedAt, today);

    const dueToday =
      task.dueDate !== null && isSameDay(task.dueDate, today);

    const hasBlockToday = timeBlocks.some(
      (tb) => tb.taskId === task.id && isSameDay(tb.start, today)
    );

    if (completedToday || dueToday || hasBlockToday) {
      total++;
      if (completedToday) completed++;
    }
  }

  return { completed, total };
}
