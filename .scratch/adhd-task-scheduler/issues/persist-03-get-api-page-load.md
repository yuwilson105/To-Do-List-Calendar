Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD-sqlite-persistence.md`

## What to build

Add `GET /api/tasks` and wire the app's page load to fetch Tasks and Time Blocks from the database as initial React state.

**API route**: `GET /api/tasks` returns `{ tasks: Task[], timeBlocks: TimeBlock[] }` — all records from both tables in a single request. Uses `TaskStore.getAll()` and `TimeBlockStore.getAll()`.

**Page load wiring**: On mount (`useEffect` with empty deps), the app calls `GET /api/tasks` and sets the `tasks` and `timeBlocks` React state arrays from the response. A loading state (e.g. a subtle spinner or skeleton) prevents the UI from rendering stale empty state while the fetch is in flight.

After this slice: Tasks and Time Blocks added in previous sessions survive page reloads. The Next Action Card, progress bar, and calendar all reflect the persisted state from the moment the app loads.

**Tests**: Call the `GET /api/tasks` route handler directly with a test database containing known Tasks and Time Blocks. Assert the response shape and that all records are returned.

## Acceptance criteria

- [ ] `GET /api/tasks` returns `{ tasks, timeBlocks }` with all records from the database
- [ ] On page load, the app fetches from `GET /api/tasks` and initialises React state from the response
- [ ] A loading indicator is shown while the initial fetch is in flight
- [ ] Tasks added in a previous session are visible in the task list after a page reload
- [ ] Approved Time Blocks from a previous session appear on the calendar after a page reload
- [ ] The Next Action Card reflects persisted tasks on load
- [ ] The progress bar reflects persisted completion state on load
- [ ] Route handler test passes with a seeded test database
- [ ] All 22 existing tests continue to pass

## Blocked by

- `persist-02-schema-stores-tests`
