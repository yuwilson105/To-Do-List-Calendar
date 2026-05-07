Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD-frontend-backend-integration.md`

## What to build

Wire task completion to the Habit Model and progress bar. When the user checks a task's checkbox:

1. Set `task.status = "complete"` and `task.completedAt = new Date()`
2. Call `habitModel.recordCompletion(task.id, now, task.tags, scheduledStart ?? null)` where `scheduledStart` is the task's approved Time Block start time if one exists, otherwise `null`
3. Trigger Next Action Card recalculation
4. Update the progress bar

The progress bar shows `completed / total` where `completed` = tasks with `status === "complete"` and `completedAt` on today's date; `total` = all tasks due today or with a Time Block starting today, plus completed tasks from today.

Completed tasks visually dim (reduced opacity) in the task list. They do not need to reorder for this slice.

## Acceptance criteria

- [ ] Checking a task's checkbox sets its status to complete and records `completedAt`
- [ ] Completing a task calls `habitModel.recordCompletion()` with the correct arguments
- [ ] The progress bar updates immediately after a task is completed
- [ ] Completed tasks appear visually dimmed in the task list
- [ ] The Next Action Card updates immediately after a task is completed
- [ ] All 17 existing tests continue to pass

## Blocked by

- `int-01-promote-variant-d-quick-add-bar`
