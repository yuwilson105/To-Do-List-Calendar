Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD.md`

## What to build

Add the daily progress bar and streak counter to the UI, backed by the Streak & Progress Tracker module.

**Progress bar**: displayed in the task list panel header (or a persistent top bar). Shows "X of Y tasks done today" where X = Tasks with `completed_at` on today's date and Y = incomplete + completed Tasks that are due today or have a Time Block starting today. Updates immediately when a Task is marked complete — no page reload.

**Streak counter**: displayed alongside the progress bar. Shows the number of consecutive calendar days on which the user opened the app and completed at least one Task. Logic: on each app open, compare today's date to `app_state.last_active_date`. If `last_active_date` is yesterday and at least one Task was completed yesterday, increment `app_state.streak` by 1. If `last_active_date` is before yesterday (gap in usage) or no Tasks were completed yesterday, reset `app_state.streak` to 0. Update `last_active_date` to today.

Both values are persisted in the `app_state` table.

## Acceptance criteria

- [ ] Progress bar shows correct completed vs. total task count for today
- [ ] Progress bar updates immediately when a Task is marked complete
- [ ] Streak counter shows the correct consecutive-day count
- [ ] Streak increments when the user opens the app the day after completing at least one Task
- [ ] Streak resets to 0 when the user misses a day or completes no Tasks the previous day
- [ ] Streak and progress values are persisted in `app_state` and survive page reloads

## Blocked by

- `02-quick-add-task-list-and-split-view-layout`
