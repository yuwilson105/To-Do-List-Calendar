Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD.md`

## What to build

Add the Next Action Card to the top of the task list panel and implement the Next Action Scorer that drives it.

**Next Action Scorer** (`scoreTask`): a pure function accepting a Task, the current Habit Model (defaulting to the 9–12am peak curve), and the current timestamp. Scoring formula: due-date proximity (exponential decay — tasks due sooner score higher) + priority weight (high=3, medium=2, low=1) + Habit Model hourly weight for the current hour. Only incomplete Tasks are eligible.

**Next Action Card**: always visible at the top of the task list panel. Displays the title and priority of the highest-scoring incomplete Task. Recalculates on task completion, task creation, and on a 5-minute polling interval. When no incomplete Tasks exist, shows a "nothing pending" message. Clicking the card enters Focus Mode for that Task (Focus Mode is built in the next slice — for now, clicking the card can be a no-op placeholder).

**Tests**: unit tests for `scoreTask` covering: high-priority task due today scores higher than low-priority task due next week; score increases as due date approaches; completed tasks are never returned.

## Acceptance criteria

- [ ] Next Action Card is visible at the top of the task list panel at all times
- [ ] Card displays the title and priority of the highest-scoring incomplete Task
- [ ] Score is recalculated when a Task is completed or created
- [ ] Score is recalculated on a 5-minute polling interval
- [ ] When no incomplete Tasks exist, the card shows a "nothing pending" message
- [ ] Clicking the card is wired up (no-op or placeholder for Focus Mode)
- [ ] Unit tests pass for `scoreTask`

## Blocked by

- `02-quick-add-task-list-and-split-view-layout`
