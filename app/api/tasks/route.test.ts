import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task, TimeBlock } from "@/lib/types";

// ---------------------------------------------------------------------------
// We test the GET handler by mocking the db module so the handler uses a
// controlled in-memory store rather than the production kairos.db.
// ---------------------------------------------------------------------------

const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Seeded task",
    dueDate: null,
    priority: "medium",
    estimatedDurationMinutes: 30,
    tags: ["work"],
    notes: "",
    status: "incomplete",
    createdAt: new Date("2026-05-06T09:00:00.000Z"),
    completedAt: null,
  },
];

const mockTimeBlocks: TimeBlock[] = [
  {
    taskId: "task-1",
    start: new Date("2026-05-06T10:00:00.000Z"),
    end: new Date("2026-05-06T10:30:00.000Z"),
  },
];

vi.mock("@/lib/db/connection", () => ({
  getDb: vi.fn(),
}));

vi.mock("@/lib/db/task-store", () => ({
  TaskStore: vi.fn().mockImplementation(() => ({
    getAll: vi.fn().mockReturnValue(mockTasks),
  })),
}));

vi.mock("@/lib/db/time-block-store", () => ({
  TimeBlockStore: vi.fn().mockImplementation(() => ({
    getAll: vi.fn().mockReturnValue(mockTimeBlocks),
  })),
}));

describe("GET /api/tasks", () => {
  it("returns tasks and timeBlocks from the store", async () => {
    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json() as { tasks: Task[]; timeBlocks: TimeBlock[] };

    expect(response.status).toBe(200);
    expect(body.tasks).toHaveLength(1);
    expect(body.tasks[0].id).toBe("task-1");
    expect(body.tasks[0].title).toBe("Seeded task");
    expect(body.timeBlocks).toHaveLength(1);
    expect(body.timeBlocks[0].taskId).toBe("task-1");
  });

  it("returns both tasks and timeBlocks keys even when stores are empty", async () => {
    const { TaskStore } = await import("@/lib/db/task-store");
    const { TimeBlockStore } = await import("@/lib/db/time-block-store");

    vi.mocked(TaskStore).mockImplementationOnce(() => ({
      getAll: vi.fn().mockReturnValue([]),
      insert: vi.fn(),
      update: vi.fn(),
    }));
    vi.mocked(TimeBlockStore).mockImplementationOnce(() => ({
      getAll: vi.fn().mockReturnValue([]),
      insert: vi.fn(),
      deleteByTaskId: vi.fn(),
    }));

    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json() as { tasks: Task[]; timeBlocks: TimeBlock[] };

    expect(body.tasks).toEqual([]);
    expect(body.timeBlocks).toEqual([]);
  });
});
