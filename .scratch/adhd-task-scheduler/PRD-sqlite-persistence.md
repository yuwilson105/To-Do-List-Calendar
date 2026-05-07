Status: ready-for-agent

# PRD: SQLite Persistence — Tasks and Time Blocks

## Problem Statement

Every time the user reloads Kairos, all their Tasks and approved Time Blocks are lost. The app currently holds all state in React memory with no persistence layer. This makes the app unusable as a real productivity tool — any accidental refresh, browser restart, or system reboot wipes the entire task list and schedule.

## Solution

Add a local SQLite database (`kairos.db`) that persists all Tasks and Time Blocks. Every state change (create Task, complete Task, approve Time Block) immediately writes to the database via a Next.js API route. On page load, all Tasks and Time Blocks are fetched from the database and used as the initial React state. The user's data survives page reloads, browser restarts, and system reboots.

See ADR-0001 for the rationale behind write-through persistence via API routes.

## User Stories

1. As a user with ADHD, I want my tasks to still be there when I reload the page, so that I don't lose work I've captured.
2. As a user with ADHD, I want my approved Time Blocks to survive a page reload, so that my schedule doesn't disappear.
3. As a user with ADHD, I want tasks I add via the Quick-Add Bar to be saved immediately, so that I never have to think about saving.
4. As a user with ADHD, I want tasks I complete to stay marked as complete after a reload, so that my progress is preserved.
5. As a user with ADHD, I want the app to load my existing tasks automatically when I open it, so that I can get to work immediately without re-entering anything.
6. As a user with ADHD, I want the Next Action Card to reflect my real persisted tasks on load, so that I see the correct next action from the moment the app opens.
7. As a user with ADHD, I want the progress bar to reflect my real completion history on load, so that I see accurate progress even after a reload.
8. As a user with ADHD, I want the calendar to show my persisted Time Blocks on load, so that my schedule is visible immediately.
9. As a user with ADHD, I want the database to be stored locally on my machine, so that my task data remains private and never leaves my computer.
10. As a user with ADHD, I want the database to be created automatically on first run, so that I don't have to do any setup.

## Implementation Decisions

### ADR reference

All persistence decisions (write-through model, API routes, SQLite + Drizzle, ISO string dates, `kairos.db` at project root) are documented in ADR-0001.

### Database schema

Two tables for this PRD:

**tasks**
- `id` — TEXT, primary key (UUID)
- `title` — TEXT, not null
- `due_date` — TEXT, nullable (ISO 8601 date string, e.g. `"2026-05-06"`)
- `priority` — TEXT, not null (`"low"` | `"medium"` | `"high"`)
- `estimated_duration_minutes` — INTEGER, not null
- `tags` — TEXT, not null (JSON array serialised as string)
- `notes` — TEXT, not null (empty string default)
- `status` — TEXT, not null (`"incomplete"` | `"complete"`)
- `created_at` — TEXT, not null (ISO 8601 datetime)
- `completed_at` — TEXT, nullable (ISO 8601 datetime)

**time_blocks**
- `id` — TEXT, primary key (UUID, generated on insert)
- `task_id` — TEXT, not null (foreign key → tasks.id)
- `start` — TEXT, not null (ISO 8601 datetime)
- `end` — TEXT, not null (ISO 8601 datetime)

### Database connection

A single shared Drizzle + `better-sqlite3` connection is initialised once at module load time and reused across all API route calls. The database file path is `kairos.db` at the project root. The connection module runs Drizzle migrations on startup so the schema is always up to date.

### Store modules

Two deep modules with simple interfaces:

**TaskStore**
- `getAll() → Task[]` — returns all tasks, ordered by `created_at` ascending
- `insert(task: Task) → void` — inserts a new task
- `update(id: string, patch: Partial<Task>) → void` — updates fields on an existing task (used for completion, priority changes, etc.)

**TimeBlockStore**
- `getAll() → TimeBlock[]` — returns all time blocks
- `insert(block: TimeBlock) → void` — inserts a new time block
- `deleteByTaskId(taskId: string) → void` — removes all time blocks for a task (used when a task is deleted)

Both stores accept the canonical `Task` and `TimeBlock` domain types. They handle all serialisation/deserialisation (JSON tags, ISO date strings ↔ JS Date objects) internally so callers never deal with raw SQLite row shapes.

### API routes

Five endpoints:

- `GET /api/tasks` — returns `{ tasks: Task[], timeBlocks: TimeBlock[] }` (all data in one request to minimise round trips on load)
- `POST /api/tasks` — creates a new Task; body is a `Task` object; returns the created Task
- `PATCH /api/tasks/[id]` — updates a Task; body is `Partial<Task>`; returns the updated Task
- `POST /api/time-blocks` — creates a new Time Block; body is a `TimeBlock` object; returns the created Time Block

### Client-side wiring

On page load (`useEffect` with empty deps), the app calls `GET /api/tasks` and initialises the `tasks` and `timeBlocks` React state arrays from the response. A loading state prevents the UI from rendering stale empty state while the fetch is in flight.

On each state-mutating action:
- Quick-Add Bar submit → `POST /api/tasks` then append to local state
- Task completion → `PATCH /api/tasks/[id]` with `{ status: "complete", completedAt: now }` then update local state
- Time Block approval → `POST /api/time-blocks` then append to local state

Local state is updated optimistically after the API call succeeds. If the API call fails, a non-blocking error toast is shown and the local state is not updated.

### Terminology fix

As resolved in the grill-with-docs session: `TimeRange` in `lib/types.ts` is renamed to `OccupiedRange`. `TimeBlock` (the approved, task-linked type currently in `lib/daily-progress.ts`) is moved to `lib/types.ts` as the canonical domain type. All call sites are updated.

### `.gitignore` update

`kairos.db` is added to `.gitignore` so the database file is never committed.

## Testing Decisions

Good tests verify observable behavior through public interfaces. They do not assert on internal SQL, Drizzle internals, or implementation details. A test that breaks when you rename an internal function but behavior hasn't changed is a bad test.

### TaskStore and TimeBlockStore

Test both stores against a real SQLite database using a temporary file (or `:memory:` if Drizzle supports it with `better-sqlite3`). Each test gets a fresh database. Tests verify the store's public interface:

- `TaskStore.insert` followed by `TaskStore.getAll` returns the inserted task
- `TaskStore.update` with `{ status: "complete", completedAt }` makes the task retrievable as complete
- `TaskStore.getAll` returns tasks ordered by `created_at` ascending
- `TimeBlockStore.insert` followed by `TimeBlockStore.getAll` returns the inserted block
- `TimeBlockStore.deleteByTaskId` removes all blocks for that task

### API routes

Test the API routes using `fetch` against a running Next.js test server, or by calling the route handler functions directly with mock `Request` objects. Tests verify end-to-end behavior:

- `POST /api/tasks` with a valid task body returns 200 and the created task is retrievable via `GET /api/tasks`
- `PATCH /api/tasks/[id]` with `{ status: "complete" }` returns 200 and the task is returned as complete in subsequent `GET /api/tasks`
- `POST /api/time-blocks` with a valid block body returns 200 and the block is retrievable via `GET /api/tasks`

### Prior art

The existing test suite uses Vitest with in-memory stores (see `lib/habit-model.test.ts` for the pattern of injecting a test store). The same pattern applies here — inject a test database connection rather than the production one.

## Out of Scope

- `app_state` table (streak, last briefing date, timer config) — separate issue
- `habit_completions` table — Phase 2
- `reminders` table — Phase 2
- Task deletion (no delete endpoint in this PRD)
- Task editing beyond completion (title, priority, due date editing via UI)
- Google Calendar sync — separate issue
- Database migrations for schema changes after initial creation
- Database backup or export tooling

## Further Notes

- `better-sqlite3` is synchronous — all database operations block the Node.js event loop. For a local single-user app this is acceptable and actually simpler than async alternatives. Do not introduce async wrappers.
- The `kairos.db` file should be added to `.gitignore` immediately — it will contain real user data.
- The `TimeBlock` type currently lives in `lib/daily-progress.ts`. Moving it to `lib/types.ts` as part of this PRD is the right time since the persistence layer needs a single canonical type definition.
- The `OccupiedRange` rename (from `TimeRange`) should happen in the same PR to keep the terminology consistent with `CONTEXT.md`.
