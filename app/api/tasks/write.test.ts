import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task } from "@/lib/types";

// ---------------------------------------------------------------------------
// POST /api/tasks
// ---------------------------------------------------------------------------

const insertMock = vi.fn();
const getAllMock = vi.fn();
const updateMock = vi.fn();

vi.mock("@/lib/db/connection", () => ({ getDb: vi.fn() }));

vi.mock("@/lib/db/task-store", () => ({
  TaskStore: vi.fn().mockImplementation(() => ({
    insert: insertMock,
    getAll: getAllMock,
    update: updateMock,
  })),
}));

vi.mock("@/lib/db/time-block-store", () => ({
  TimeBlockStore: vi.fn().mockImplementation(() => ({
    getAll: vi.fn().mockReturnValue([]),
  })),
}));

const baseTask: Task = {
  id: "task-abc",
  title: "New task",
  dueDate: null,
  priority: "medium",
  estimatedDurationMinutes: 30,
  tags: [],
  notes: "",
  status: "incomplete",
  createdAt: new Date("2026-05-06T09:00:00.000Z"),
  completedAt: null,
};

describe("POST /api/tasks", () => {
  beforeEach(() => {
    insertMock.mockReset();
    getAllMock.mockReset();
    updateMock.mockReset();
  });

  it("inserts the task and returns 201 with the created task", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify(baseTask),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json() as Task;

    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledOnce();
    expect(body.id).toBe("task-abc");
    expect(body.title).toBe("New task");
  });

  it("the inserted task is retrievable via getAll after POST", async () => {
    getAllMock.mockReturnValue([baseTask]);
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify(baseTask),
      headers: { "Content-Type": "application/json" },
    });
    await POST(request);

    // Simulate what GET would return after the insert
    const { GET } = await import("./route");
    const getResponse = await GET();
    const getBody = await getResponse.json() as { tasks: Task[] };

    expect(getBody.tasks).toHaveLength(1);
    expect(getBody.tasks[0].id).toBe("task-abc");
  });
});

describe("PATCH /api/tasks/:id", () => {
  beforeEach(() => {
    insertMock.mockReset();
    getAllMock.mockReset();
    updateMock.mockReset();
  });

  it("updates the task and returns the updated task", async () => {
    const completedAt = new Date("2026-05-06T11:00:00.000Z");
    const updatedTask: Task = { ...baseTask, status: "complete", completedAt };
    getAllMock.mockReturnValue([updatedTask]);

    const { PATCH } = await import("./[id]/route");
    const request = new Request("http://localhost/api/tasks/task-abc", {
      method: "PATCH",
      body: JSON.stringify({ status: "complete", completedAt: completedAt.toISOString() }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PATCH(request, { params: { id: "task-abc" } });
    const body = await response.json() as Task;

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith("task-abc", expect.objectContaining({ status: "complete" }));
    expect(body.status).toBe("complete");
  });
});
