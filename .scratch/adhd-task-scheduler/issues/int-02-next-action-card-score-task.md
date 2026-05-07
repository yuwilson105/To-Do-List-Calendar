Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD-frontend-backend-integration.md`

## What to build

Wire the Next Action Card to the real `scoreTask()` function. On every render, call `scoreTask(task, habitModel, now)` for every incomplete Task in the list and surface the highest scorer in the Next Action Card. `now` is `new Date()`.

The Habit Model instance (using `InMemoryHabitStore`) is created once at the root component level and held in a `useRef` so it persists across renders without triggering re-renders.

The Next Action Card recalculates on task creation, task completion, and on a 5-minute `setInterval` (to handle time-of-day weight drift). When no incomplete Tasks exist, the card shows a "nothing pending" message.

The "Start focus session →" button on the card is wired up as a no-op placeholder (Focus Mode is a separate issue).

## Acceptance criteria

- [ ] The Next Action Card shows the highest-scoring incomplete Task as determined by `scoreTask()`
- [ ] A high-priority task due today scores higher than a low-priority task with no due date
- [ ] The card updates immediately when a new Task is added via the Quick-Add Bar
- [ ] The card updates immediately when the currently shown Task is completed
- [ ] When no incomplete Tasks exist, the card shows a "nothing pending" message
- [ ] The Habit Model instance persists across renders (held in a ref, not recreated on each render)
- [ ] All 17 existing tests continue to pass

## Blocked by

- `int-01-promote-variant-d-quick-add-bar`
