import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/connection";
import { TaskStore } from "@/lib/db/task-store";
import type { Task } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patch = (await request.json()) as Partial<Task>;
    // Rehydrate any Date fields that arrive as ISO strings
    const hydrated: Partial<Task> = {
      ...patch,
      ...(patch.dueDate !== undefined && {
        dueDate: patch.dueDate ? new Date(patch.dueDate as unknown as string) : null,
      }),
      ...(patch.completedAt !== undefined && {
        completedAt: patch.completedAt
          ? new Date(patch.completedAt as unknown as string)
          : null,
      }),
    };

    const store = new TaskStore(getDb());
    store.update(params.id, hydrated);

    // Return the updated task
    const updated = store.getAll().find((t) => t.id === params.id);
    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/tasks/:id]", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
