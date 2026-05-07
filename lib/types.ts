// Domain types for the ADHD Task Scheduler

export type Priority = "low" | "medium" | "high";
export type TaskStatus = "incomplete" | "complete";

export interface Task {
  id: string;
  title: string;
  dueDate: Date | null;
  priority: Priority;
  estimatedDurationMinutes: number;
  tags: string[];
  notes: string;
  status: TaskStatus;
  createdAt: Date;
  completedAt: Date | null;
}

// 24-element array — one weight per hour of the day (index = hour, 0–23)
export type HourlyWeights = readonly [
  number, number, number, number, number, number,
  number, number, number, number, number, number,
  number, number, number, number, number, number,
  number, number, number, number, number, number,
];

export interface HabitModel {
  getProductivityWeights(): HourlyWeights;
}

/** An approved, task-linked scheduled period of focused work. */
export interface TimeBlock {
  taskId: string;
  start: Date;
  end: Date;
}

/** A generic time interval passed to the AI Scheduler representing any period that cannot be scheduled. */
export interface OccupiedRange {
  start: Date;
  end: Date;
}

export interface TimeBlockCandidate {
  start: Date;
  end: Date;
  score: number;
}
