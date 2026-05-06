Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD.md`

## What to build

Bootstrap the Next.js project with Tailwind CSS, Drizzle ORM, and a local SQLite database. Define the full database schema that all subsequent slices depend on. The app should start, serve a placeholder page, and the database should be created and migrated on first run.

The schema covers all entities needed for the MVP:

- **tasks**: id, title, due_date, priority (low/medium/high), estimated_duration_minutes, tags (JSON), notes, status (incomplete/complete), created_at, completed_at
- **time_blocks**: id, task_id (FK → tasks), start_time, end_time, google_calendar_event_id (nullable), status (proposed/approved/rejected)
- **reminders**: id, task_id (FK), time_block_id (FK), scheduled_at, channel (push/email), dispatched_at (nullable), failed (boolean)
- **habit_completions**: id, task_id (FK), completed_at, hour_of_day, tags (JSON), scheduled_start (nullable)
- **app_state**: key (text, primary key), value (text) — used for streak, last_briefing_date, timer config

A single `npm run dev` command should start both the Next.js server and the Node.js cron job process (using `concurrently` or a custom server entry).

## Acceptance criteria

- [ ] `npm run dev` starts the app without errors
- [ ] SQLite database file is created on first run
- [ ] All five tables exist with the correct columns and foreign key constraints after migration
- [ ] Drizzle schema types are exported and usable from application code
- [ ] Tailwind CSS is configured and a utility class renders correctly on the placeholder page
- [ ] The cron job process starts alongside the Next.js server from a single dev command

## Blocked by

None — can start immediately.
