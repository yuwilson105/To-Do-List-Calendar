import { eq } from "drizzle-orm";
import type { DbConnection } from "./connection";
import { timeBlocks as timeBlocksTable } from "./schema";
import type { TimeBlock } from "../types";

// ---------------------------------------------------------------------------
// Row ↔ Domain serialisation
// ---------------------------------------------------------------------------

interface TimeBlockRow {
  id: string;
  taskId: string;
  start: string;
  end: string;
}

function rowToTimeBlock(row: TimeBlockRow): TimeBlock {
  return {
    taskId: row.taskId,
    start: new Date(row.start),
    end: new Date(row.end),
  };
}

// ---------------------------------------------------------------------------
// TimeBlockStore
// ---------------------------------------------------------------------------

/**
 * Persists and retrieves Time Blocks from SQLite.
 *
 * All serialisation (ISO strings ↔ Date) is handled internally.
 * Callers work exclusively with the canonical TimeBlock domain type.
 */
export class TimeBlockStore {
  constructor(private readonly db: DbConnection) {}

  /** Returns all time blocks. */
  getAll(): TimeBlock[] {
    const rows = this.db.select().from(timeBlocksTable).all();
    return rows.map(rowToTimeBlock);
  }

  /** Inserts a new time block. Generates a UUID for the row id. */
  insert(block: TimeBlock): void {
    const row: TimeBlockRow = {
      id: crypto.randomUUID(),
      taskId: block.taskId,
      start: block.start.toISOString(),
      end: block.end.toISOString(),
    };
    this.db.insert(timeBlocksTable).values(row).run();
  }

  /** Removes all time blocks associated with the given task. */
  deleteByTaskId(taskId: string): void {
    this.db
      .delete(timeBlocksTable)
      .where(eq(timeBlocksTable.taskId, taskId))
      .run();
  }
}
