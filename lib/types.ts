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

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface TimeBlockCandidate {
  start: Date;
  end: Date;
  score: number;
}
