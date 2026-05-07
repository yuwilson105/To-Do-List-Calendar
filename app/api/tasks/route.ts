import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/connection";
import { TaskStore } from "@/lib/db/task-store";
import { TimeBlockStore } from "@/lib/db/time-block-store";
import type { Task } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();
    const tasks = new TaskStore(db).getAll();
    const timeBlocks = new TimeBlockStore(db).getAll();
    return NextResponse.json({ tasks, timeBlocks });
  } catch (err) {
    console.error("[GET /api/tasks]", err);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const task = (await request.json()) as Task;
    // Rehydrate Date fields that arrive as ISO strings
    const hydrated: Task = {
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate as unknown as string) : null,
      createdAt: new Date(task.createdAt as unknown as string),
      completedAt: task.completedAt ? new Date(task.completedAt as unknown as string) : null,
    };
    new TaskStore(getDb()).insert(hydrated);
    return NextResponse.json(hydrated, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tasks]", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
