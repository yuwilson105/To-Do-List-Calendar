// PROTOTYPE — mock data only, no persistence

export type Priority = "high" | "medium" | "low";

export interface MockTask {
  id: string;
  title: string;
  priority: Priority;
  estimatedDurationMinutes: number;
  dueDate: string | null; // ISO date string
  tags: string[];
  status: "incomplete" | "complete";
  scheduledStart: string | null; // ISO datetime
  scheduledEnd: string | null;
}

export interface MockCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  isTask: boolean;
  color: string;
}

export const MOCK_TASKS: MockTask[] = [
  {
    id: "1",
    title: "Write quarterly report",
    priority: "high",
    estimatedDurationMinutes: 90,
    dueDate: "2026-05-06",
    tags: ["work", "writing"],
    status: "incomplete",
    scheduledStart: "2026-05-06T09:00:00",
    scheduledEnd: "2026-05-06T10:30:00",
  },
  {
    id: "2",
    title: "Review pull requests",
    priority: "high",
    estimatedDurationMinutes: 45,
    dueDate: "2026-05-06",
    tags: ["work", "code"],
    status: "incomplete",
    scheduledStart: "2026-05-06T11:00:00",
    scheduledEnd: "2026-05-06T11:45:00",
  },
  {
    id: "3",
    title: "Call dentist to reschedule",
    priority: "medium",
    estimatedDurationMinutes: 15,
    dueDate: "2026-05-07",
    tags: ["personal"],
    status: "incomplete",
    scheduledStart: null,
    scheduledEnd: null,
  },
  {
    id: "4",
    title: "Read chapter 4 of Deep Work",
    priority: "low",
    estimatedDurationMinutes: 30,
    dueDate: null,
    tags: ["personal", "reading"],
    status: "incomplete",
    scheduledStart: "2026-05-06T14:00:00",
    scheduledEnd: "2026-05-06T14:30:00",
  },
  {
    id: "5",
    title: "Update project roadmap",
    priority: "medium",
    estimatedDurationMinutes: 60,
    dueDate: "2026-05-08",
    tags: ["work"],
    status: "complete",
    scheduledStart: "2026-05-06T08:00:00",
    scheduledEnd: "2026-05-06T09:00:00",
  },
];

export const MOCK_EVENTS: MockCalendarEvent[] = [
  {
    id: "e1",
    title: "Team standup",
    start: "2026-05-06T09:30:00",
    end: "2026-05-06T09:45:00",
    isTask: false,
    color: "#6366f1",
  },
  {
    id: "e2",
    title: "Write quarterly report",
    start: "2026-05-06T09:00:00",
    end: "2026-05-06T10:30:00",
    isTask: true,
    color: "#ef4444",
  },
  {
    id: "e3",
    title: "Review pull requests",
    start: "2026-05-06T11:00:00",
    end: "2026-05-06T11:45:00",
    isTask: true,
    color: "#ef4444",
  },
  {
    id: "e4",
    title: "Lunch",
    start: "2026-05-06T12:00:00",
    end: "2026-05-06T13:00:00",
    isTask: false,
    color: "#6366f1",
  },
  {
    id: "e5",
    title: "Read Deep Work",
    start: "2026-05-06T14:00:00",
    end: "2026-05-06T14:30:00",
    isTask: true,
    color: "#f59e0b",
  },
  {
    id: "e6",
    title: "1:1 with manager",
    start: "2026-05-06T15:00:00",
    end: "2026-05-06T15:30:00",
    isTask: false,
    color: "#6366f1",
  },
];

export const NEXT_ACTION = MOCK_TASKS[0]; // Write quarterly report
export const STREAK = 4;
export const PROGRESS = { completed: 1, total: 4 };
