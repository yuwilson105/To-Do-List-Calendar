Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD-sqlite-persistence.md`

## What to build

Add the three write API routes and wire each client-side mutation to persist immediately.

**API routes**:

- `POST /api/tasks` — inserts a new Task via `TaskStore.insert()`; returns the created Task
- `PATCH /api/tasks/[id]` — updates a Task via `TaskStore.update()`; body is `Partial<Task>`; returns the updated Task
- `POST /api/time-blocks` — inserts a new Time Block via `TimeBlockStore.insert()`; returns the created Time Block

**Client wiring** (optimistic: API call succeeds → update local state; failure → toast, no state change):

- Quick-Add Bar submit → `POST /api/tasks` → append to local `tasks` state
- Task completion checkbox → `PATCH /api/tasks/[id]` with `{ status: "complete", completedAt }` → update local `tasks` state
- Time Block approval (schedule popover) → `POST /api/time-blocks` → append to local `timeBlocks` state

**Tests**: Call each route handler directly with a test database. Assert that:
- `POST /api/tasks` with a valid Task body returns 200 and the task is retrievable via `TaskStore.getAll()`
- `PATCH /api/tasks/[id]` with `{ status: "complete" }` returns 200 and the task is returned as complete in `TaskStore.getAll()`
- `POST /api/time-blocks` with a valid block body returns 200 and the block is retrievable via `TimeBlockStore.getAll()`

## Acceptance criteria

- [ ] Adding a task via the Quick-Add Bar persists it to the database immediately
- [ ] The added task is still present after a page reload
- [ ] Completing a task persists `status: "complete"` and `completedAt` to the database
- [ ] The completed state survives a page reload
- [ ] Approving a Time Block proposal persists the Time Block to the database
- [ ] The approved Time Block appears on the calendar after a page reload
- [ ] API errors show a non-blocking toast and do not update local state
- [ ] All three route handler tests pass
- [ ] All 22 existing tests continue to pass

## Blocked by

- `persist-03-get-api-page-load`
