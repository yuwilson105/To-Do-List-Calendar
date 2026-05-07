import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { tasks, timeBlocks } from "./schema";

export type DbConnection = ReturnType<typeof drizzle>;

/**
 * Opens a Drizzle connection to the given SQLite file path (or ":memory:").
 * Runs the inline schema creation so the tables always exist.
 *
 * Using inline CREATE TABLE statements (not Drizzle Kit migrations) keeps
 * the setup self-contained and avoids a separate migration folder for tests.
 */
export function openDb(dbPath: string): DbConnection {
  const sqlite = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance on the real DB.
  // Harmless on :memory:.
  sqlite.pragma("journal_mode = WAL");

  const db = drizzle(sqlite, { schema: { tasks, timeBlocks } });

  // Create tables if they don't exist (idempotent)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      due_date TEXT,
      priority TEXT NOT NULL,
      estimated_duration_minutes INTEGER NOT NULL,
      tags TEXT NOT NULL,
      notes TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS time_blocks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      start TEXT NOT NULL,
      end TEXT NOT NULL
    );
  `);

  return db;
}

/** Singleton connection for production use (Next.js API routes). */
let _db: DbConnection | null = null;

export function getDb(): DbConnection {
  if (!_db) {
    const dbPath = path.join(process.cwd(), "kairos.db");
    _db = openDb(dbPath);
  }
  return _db;
}
