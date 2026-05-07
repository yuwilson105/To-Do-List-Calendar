Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD-frontend-backend-integration.md`

## What to build

Wire the "+ Schedule" button on each unscheduled incomplete Task row to `proposeCandidates()`, showing an inline popover with the top candidate for approval.

Clicking "+ Schedule":
1. Computes `occupiedRanges` from the current Time Blocks array (all approved blocks) plus the static external calendar events
2. Calls `proposeCandidates(task, occupiedRanges, habitModel, new Date())`
3. Opens an inline popover directly below the task row showing: formatted date, start time, end time, and duration of the top candidate
4. Only one popover is open at a time — opening a new one closes any existing one

**Approve**: adds the candidate to the Time Blocks array as `{ taskId, start, end }`, closes the popover. The task row now shows the scheduled time instead of "+ Schedule".

**Try another**: cycles to the next candidate (index + 1). If no more candidates exist, shows "No more suggestions — pick a time manually".

**Dismiss**: clicking outside the popover or pressing Escape closes it without scheduling.

The AI Scheduler must not propose times that overlap existing Time Blocks or external events.

## Acceptance criteria

- [ ] Unscheduled incomplete Tasks show a "+ Schedule" button
- [ ] Clicking "+ Schedule" opens an inline popover below the task row with a proposed time
- [ ] The proposal shows date, start time, end time, and duration
- [ ] Approving a proposal adds the Time Block to the in-memory array and updates the task row to show the scheduled time
- [ ] "Try another" cycles to the next candidate; shows "No more suggestions" when exhausted
- [ ] Clicking outside or pressing Escape closes the popover without scheduling
- [ ] Only one popover is open at a time
- [ ] Proposed Time Blocks never overlap existing Time Blocks or external events
- [ ] All 17 existing tests continue to pass

## Blocked by

- `int-01-promote-variant-d-quick-add-bar`
- `int-02-next-action-card-score-task`
