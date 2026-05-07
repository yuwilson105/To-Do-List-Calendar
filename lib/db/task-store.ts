import { eq, asc } from "drizzle-orm";
import type { DbConnection } from "./connection";
import { tasks as tasksTable } from "./schema";
import type { Task, Priority, TaskStatus } from "../types";

// ---------------------------------------------------------------------------
// Row ↔ Domain serialisation
// ---------------------------------------------------------------------------

interface TaskRow {
  id: string;
  title: string;
  dueDate: string | null;
  priority: string;
  estimatedDurationMinutes: number;
  tags: string;
  notes: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.dueDate ? new Date(row.dueDate) : null,
    priority: row.priority as Priority,
    estimatedDurationMinutes: row.estimatedDurationMinutes,
    tags: JSON.parse(row.tags) as string[],
    notes: row.notes,
    status: row.status as TaskStatus,
    createdAt: new Date(row.createdAt),
    completedAt: row.completedAt ? new Date(row.completedAt) : null,
  };
}

function taskToRow(task: Task): TaskRow {
  return {
    id: task.id,
    title: task.title,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    priority: task.priority,
    estimatedDurationMinutes: task.estimatedDurationMinutes,
    tags: JSON.stringify(task.tags),
    notes: task.notes,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
  };
}

// ---------------------------------------------------------------------------
// TaskStore
// ---------------------------------------------------------------------------

/**
 * Persists and retrieves Tasks from SQLite.
 *
 * All serialisation (ISO strings ↔ Date, JSON tags) is handled internally.
 * Callers work exclusively with the canonical Task domain type.
 */
export class TaskStore {
  constructor(private readonly db: DbConnection) {}

  /** Returns all tasks ordered by createdAt ascending. */
  getAll(): Task[] {
    const rows = this.db
      .select()
      .from(tasksTable)
      .orderBy(asc(tasksTable.createdAt))
      .all();
    return rows.map(rowToTask);
  }

  /** Inserts a new task. */
  insert(task: Task): void {
    this.db.insert(tasksTable).values(taskToRow(task)).run();
  }

  /**
   * Updates fields on an existing task.
   * Only the provided fields are changed; others are left untouched.
   */
  update(id: string, patch: Partial<Task>): void {
    const partialRow: Partial<TaskRow> = {};

    if (patch.title !== undefined) partialRow.title = patch.title;
    if (patch.dueDate !== undefined)
      partialRow.dueDate = patch.dueDate ? patch.dueDate.toISOString() : null;
    if (patch.priority !== undefined) partialRow.priority = patch.priority;
    if (patch.estimatedDurationMinutes !== undefined)
      partialRow.estimatedDurationMinutes = patch.estimatedDurationMinutes;
    if (patch.tags !== undefined) partialRow.tags = JSON.stringify(patch.tags);
    if (patch.notes !== undefined) partialRow.notes = patch.notes;
    if (patch.status !== undefined) partialRow.status = patch.status;
    if (patch.completedAt !== undefined)
      partialRow.completedAt = patch.completedAt
        ? patch.completedAt.toISOString()
        : null;

    if (Object.keys(partialRow).length === 0) return;

    this.db.update(tasksTable).set(partialRow).where(eq(tasksTable.id, id)).run();
  }
}
