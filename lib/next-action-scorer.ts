import type { Task, HabitModel } from "./types";

const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 } as const;

/**
 * Scores a Task for the Next Action Card.
 * Higher score = should be worked on sooner.
 *
 * Formula:
 *   urgency (exponential decay on due date proximity)
 *   + priority weight
 *   + habit model hourly weight for the current hour
 *
 * Completed tasks always score 0.
 */
export function scoreTask(task: Task, habitModel: HabitModel, now: Date): number {
  if (task.status === "complete") return 0;

  const priorityScore = PRIORITY_WEIGHT[task.priority];

  // Urgency: exponential decay — tasks due sooner score higher.
  // No due date = low urgency (score 0).
  let urgencyScore = 0;
  if (task.dueDate !== null) {
    const hoursUntilDue = (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    // Decay constant: half-life of ~24 hours
    urgencyScore = Math.exp(-hoursUntilDue / 24);
  }

  const weights = habitModel.getProductivityWeights();
  const habitScore = weights[now.getHours()];

  return urgencyScore + priorityScore + habitScore;
}
