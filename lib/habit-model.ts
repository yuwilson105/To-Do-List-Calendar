import type { HourlyWeights } from "./types";

export interface HabitCompletion {
  taskId: string;
  completedAt: Date;
  hourOfDay: number;
  tags: string[];
  scheduledStart: Date | null;
}

export interface HabitModelStore {
  insertCompletion(completion: HabitCompletion): void;
  getAllCompletions(): HabitCompletion[];
}

const MIN_COMPLETIONS_FOR_LEARNING = 10;

// Default productivity curve: peak at hours 9, 10, 11 (9am–12pm)
const DEFAULT_WEIGHTS: HourlyWeights = [
  1, 1, 1, 1, 1, 1, 1, 1, // 0–7
  1, 3, 3, 3,              // 8–11 (peak 9–11)
  1, 1, 1, 1, 1, 1, 1, 1, // 12–19
  1, 1, 1, 1,              // 20–23
];

/**
 * Habit Model — encapsulates productivity pattern learning.
 *
 * Uses a pluggable store so tests can inject an in-memory implementation
 * without touching the filesystem.
 */
export class HabitModel {
  constructor(private readonly store: HabitModelStore) {}

  recordCompletion(
    taskId: string,
    completedAt: Date,
    tags: string[],
    scheduledStart: Date | null = null
  ): void {
    this.store.insertCompletion({
      taskId,
      completedAt,
      hourOfDay: completedAt.getHours(),
      tags,
      scheduledStart,
    });
  }

  getProductivityWeights(): HourlyWeights {
    const completions = this.store.getAllCompletions();

    if (completions.length < MIN_COMPLETIONS_FOR_LEARNING) {
      return DEFAULT_WEIGHTS;
    }

    // Count completions per hour bucket
    const counts = Array(24).fill(0) as number[];
    for (const c of completions) {
      counts[c.hourOfDay]++;
    }

    // Normalise: divide by max count so weights are in [0, 1] range,
    // then add 1 so every hour has at least weight 1
    const max = Math.max(...counts, 1);
    const weights = counts.map((c) => 1 + c / max) as number[];
    return weights as unknown as HourlyWeights;
  }

  getProcrastinationDeltaByTag(tag: string): number {
    const completions = this.store
      .getAllCompletions()
      .filter(
        (c) =>
          c.tags.includes(tag) &&
          c.scheduledStart !== null &&
          c.completedAt >= c.scheduledStart
      );

    if (completions.length === 0) return 0;

    const totalDeltaMs = completions.reduce((sum, c) => {
      return sum + (c.completedAt.getTime() - c.scheduledStart!.getTime());
    }, 0);

    return totalDeltaMs / completions.length / (1000 * 60); // minutes
  }
}

/**
 * In-memory store for use in tests.
 */
export class InMemoryHabitStore implements HabitModelStore {
  private completions: HabitCompletion[] = [];

  insertCompletion(completion: HabitCompletion): void {
    this.completions.push(completion);
  }

  getAllCompletions(): HabitCompletion[] {
    return [...this.completions];
  }
}
