import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TimeBlock } from "@/lib/types";

const insertMock = vi.fn();

vi.mock("@/lib/db/connection", () => ({ getDb: vi.fn() }));

vi.mock("@/lib/db/time-block-store", () => ({
  TimeBlockStore: vi.fn().mockImplementation(() => ({
    insert: insertMock,
    getAll: vi.fn().mockReturnValue([]),
  })),
}));

describe("POST /api/time-blocks", () => {
  beforeEach(() => {
    insertMock.mockReset();
  });

  it("inserts the time block and returns 201", async () => {
    const { POST } = await import("./route");
    const body = {
      taskId: "task-1",
      start: "2026-05-06T10:00:00.000Z",
      end: "2026-05-06T10:30:00.000Z",
    };

    const request = new Request("http://localhost/api/time-blocks", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const responseBody = await response.json() as TimeBlock;

    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledOnce();
    expect(responseBody.taskId).toBe("task-1");
  });

  it("the inserted block has correctly parsed Date fields", async () => {
    const { POST } = await import("./route");
    const body = {
      taskId: "task-2",
      start: "2026-05-06T14:00:00.000Z",
      end: "2026-05-06T14:30:00.000Z",
    };

    const request = new Request("http://localhost/api/time-blocks", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    await POST(request);

    const insertedBlock = insertMock.mock.calls[0][0] as TimeBlock;
    expect(insertedBlock.start).toBeInstanceOf(Date);
    expect(insertedBlock.end).toBeInstanceOf(Date);
    expect(insertedBlock.start.toISOString()).toBe("2026-05-06T14:00:00.000Z");
  });
});
