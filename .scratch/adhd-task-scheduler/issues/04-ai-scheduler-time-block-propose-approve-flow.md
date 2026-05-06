Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD.md`

## What to build

Implement the AI Scheduler and the full propose → approve/reject → sync flow end-to-end.

**AI Scheduler** (`proposeCandidates`): a pure function that accepts a Task, a list of occupied time ranges (from local Time Blocks + Google Calendar events), and a Habit Model (defaulting to the 9–12am peak curve). It enumerates free slots in the next 7 days within working hours (8am–8pm), scores each slot by due-date urgency + priority + Habit Model hourly weight, and returns the top 3 candidates.

**UI flow**: each Task row in the task list gets a "Schedule" button. Clicking it calls the AI Scheduler and opens a proposal panel showing the top candidate (with alternatives accessible). The user can approve, reject (cycles to next candidate), or manually pick a time. On approval, the Time Block is saved to `time_blocks` with status `approved` and the Google Calendar sync service creates the corresponding event. The Google Calendar event ID is stored on the `time_blocks` row. Approved Time Blocks appear on the FullCalendar panel. Rescheduling or removing a Time Block updates or deletes the Google Calendar event accordingly.

**Tests**: unit tests for `proposeCandidates` covering: no overlap with occupied ranges, high-priority tasks land in the 9–12 window under default Habit Model, candidates are sorted by score descending, empty result when no free slots exist.

## Acceptance criteria

- [ ] `proposeCandidates` is a pure function with no database or network side effects
- [ ] Proposed Time Blocks never overlap existing Time Blocks or Google Calendar events
- [ ] High-priority tasks are proposed in the 9–12am window when using the default Habit Model
- [ ] Candidates are returned sorted by score descending
- [ ] The proposal panel shows the top candidate with a way to cycle to alternatives
- [ ] Approving a proposal saves the Time Block to `time_blocks` and creates a Google Calendar event
- [ ] The Google Calendar event ID is stored on the `time_blocks` row
- [ ] Approved Time Blocks appear on the FullCalendar panel
- [ ] Rescheduling a Time Block updates the Google Calendar event
- [ ] Removing a Time Block deletes the Google Calendar event
- [ ] Deleting a Task with an approved Time Block deletes the Google Calendar event
- [ ] Unit tests pass for `proposeCandidates`

## Blocked by

- `02-quick-add-task-list-and-split-view-layout`
- `03-google-calendar-oauth-and-startup-reconcile`
