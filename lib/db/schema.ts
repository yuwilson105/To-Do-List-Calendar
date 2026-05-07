import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  dueDate: text("due_date"), // ISO 8601 date string, nullable
  priority: text("priority").notNull(), // "low" | "medium" | "high"
  estimatedDurationMinutes: integer("estimated_duration_minutes").notNull(),
  tags: text("tags").notNull(), // JSON array serialised as string
  notes: text("notes").notNull(),
  status: text("status").notNull(), // "incomplete" | "complete"
  createdAt: text("created_at").notNull(), // ISO 8601 datetime
  completedAt: text("completed_at"), // ISO 8601 datetime, nullable
});

export const timeBlocks = sqliteTable("time_blocks", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull(),
  start: text("start").notNull(), // ISO 8601 datetime
  end: text("end").notNull(), // ISO 8601 datetime
});
