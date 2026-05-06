import type { Task, HabitModel, TimeRange, TimeBlockCandidate } from "./types";

const WORKING_HOUR_START = 8;  // 8am
const WORKING_HOUR_END = 20;   // 8pm
const SLOT_INTERVAL_MINUTES = 30;
const DAYS_TO_SEARCH = 7;
const MAX_CANDIDATES = 3;

const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 } as const;

function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && a.end > b.start;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Proposes up to 3 Time Block candidates for a Task.
 *
 * Pure function — no database access, no network calls.
 * Enumerates free slots in the next 7 days within working hours (8am–8pm),
 * scores each by due-date urgency + priority + Habit Model hourly weight,
 * and returns the top candidates sorted by score descending.
 */
export function proposeCandidates(
  task: Task,
  occupiedRanges: TimeRange[],
  habitModel: HabitModel,
  now: Date
): TimeBlockCandidate[] {
  const weights = habitModel.getProductivityWeights();
  const durationMs = task.estimatedDurationMinutes * 60 * 1000;
  const priorityScore = PRIORITY_WEIGHT[task.priority];

  const candidates: TimeBlockCandidate[] = [];

  // Walk forward slot-by-slot through the next 7 days
  const searchEnd = addMinutes(now, DAYS_TO_SEARCH * 24 * 60);
  let cursor = new Date(now);

  // Snap cursor to the next slot boundary within working hours
  cursor.setSeconds(0, 0);
  const startMinute = cursor.getMinutes();
  const remainder = startMinute % SLOT_INTERVAL_MINUTES;
  if (remainder !== 0) {
    cursor = addMinutes(cursor, SLOT_INTERVAL_MINUTES - remainder);
  }

  while (cursor < searchEnd) {
    const hour = cursor.getHours();

    // Skip outside working hours — jump to next working day start
    if (hour < WORKING_HOUR_START || hour >= WORKING_HOUR_END) {
      const next = new Date(cursor);
      if (hour >= WORKING_HOUR_END) {
        next.setDate(next.getDate() + 1);
      }
      next.setHours(WORKING_HOUR_START, 0, 0, 0);
      cursor = next;
      continue;
    }

    const slotEnd = new Date(cursor.getTime() + durationMs);

    // Ensure slot ends within working hours
    if (slotEnd.getHours() > WORKING_HOUR_END ||
        (slotEnd.getHours() === WORKING_HOUR_END && slotEnd.getMinutes() > 0)) {
      // Jump to next day
      const next = new Date(cursor);
      next.setDate(next.getDate() + 1);
      next.setHours(WORKING_HOUR_START, 0, 0, 0);
      cursor = next;
      continue;
    }

    const slot: TimeRange = { start: new Date(cursor), end: slotEnd };
    const isFree = !occupiedRanges.some((busy) => overlaps(slot, busy));

    if (isFree) {
      // Urgency score: exponential decay on due date proximity
      let urgencyScore = 0;
      if (task.dueDate !== null) {
        const hoursUntilDue = (task.dueDate.getTime() - cursor.getTime()) / (1000 * 60 * 60);
        urgencyScore = Math.exp(-hoursUntilDue / 24);
      }

      const habitScore = weights[hour];
      const score = urgencyScore + priorityScore + habitScore;

      candidates.push({ start: new Date(cursor), end: slotEnd, score });
    }

    cursor = addMinutes(cursor, SLOT_INTERVAL_MINUTES);
  }

  // Sort by score descending, return top N
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, MAX_CANDIDATES);
}
