Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD-sqlite-persistence.md`

## What to build

Set up the SQLite database, define the Drizzle schema, implement the `TaskStore` and `TimeBlockStore` modules, and write tests for both.

**Database setup**: Create a shared Drizzle + `better-sqlite3` connection that initialises `kairos.db` at the project root and runs migrations on startup. Add `kairos.db` to `.gitignore`.

**Schema** (two tables):

`tasks`: id (TEXT PK), title (TEXT), due_date (TEXT nullable), priority (TEXT), estimated_duration_minutes (INTEGER), tags (TEXT — JSON array), notes (TEXT), status (TEXT), created_at (TEXT), completed_at (TEXT nullable)

`time_blocks`: id (TEXT PK), task_id (TEXT FK → tasks.id), start (TEXT), end (TEXT)

All datetime columns store ISO 8601 strings. The store modules handle serialisation/deserialisation (JSON tags, ISO strings ↔ JS Date objects) internally.

**TaskStore** — public interface:
- `getAll() → Task[]` — all tasks ordered by `created_at` ascending
- `insert(task: Task) → void`
- `update(id: string, patch: Partial<Task>) → void`

**TimeBlockStore** — public interface:
- `getAll() → TimeBlock[]`
- `insert(block: TimeBlock) → void`
- `deleteByTaskId(taskId: string) → void`

Both stores accept and return the canonical `Task` and `TimeBlock` types from `lib/types.ts`.

**Tests**: Use a temporary SQLite file (or `:memory:`) per test. Each test gets a fresh database. Test through the store's public interface only — no assertions on raw SQL or Drizzle internals.

Tests to cover:
- `TaskStore.insert` then `getAll` returns the inserted task with correct fields
- `TaskStore.update` with `{ status: "complete", completedAt }` makes the task retrievable as complete
- `TaskStore.getAll` returns tasks ordered by `created_at` ascending
- `TimeBlockStore.insert` then `getAll` returns the inserted block
- `TimeBlockStore.deleteByTaskId` removes all blocks for that task and leaves others untouched

## Acceptance criteria

- [ ] `kairos.db` is created automatically at the project root on first run
- [ ] `kairos.db` is in `.gitignore`
- [ ] `tasks` and `time_blocks` tables exist with the correct columns after migration
- [ ] `TaskStore.getAll()` returns tasks ordered by `created_at` ascending
- [ ] `TaskStore.insert()` persists a Task retrievable by `getAll()`
- [ ] `TaskStore.update()` persists field changes retrievable by `getAll()`
- [ ] `TimeBlockStore.insert()` persists a Time Block retrievable by `getAll()`
- [ ] `TimeBlockStore.deleteByTaskId()` removes only the blocks for that task
- [ ] All store tests pass
- [ ] All 22 existing tests continue to pass

## Blocked by

- `persist-01-terminology-fix`
