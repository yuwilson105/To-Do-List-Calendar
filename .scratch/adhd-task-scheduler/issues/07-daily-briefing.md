Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD.md`

## What to build

Implement the Daily Briefing — a dismissible overlay shown once per calendar day when the app is opened.

On app load, the server checks `app_state.last_briefing_date`. If it differs from today's date, it computes the briefing payload and updates `last_briefing_date` to today. Subsequent loads on the same day return a signal to skip the briefing and go straight to the split-view layout.

The briefing payload contains:
- Tasks scheduled for today (Time Blocks with `start_time` on today's date)
- Overdue Tasks (incomplete Tasks with `due_date` before today)
- The top result from the Next Action Scorer (the Task to tackle first)

The briefing is rendered as a modal overlay before the split-view layout is shown. Dismissing it (via a button or pressing Escape) closes the overlay and reveals the main layout. When today has no scheduled Tasks and no overdue Tasks, the overlay shows a "your day is clear" message.

## Acceptance criteria

- [ ] Daily Briefing overlay appears on first app load of the day
- [ ] Overlay shows today's scheduled Tasks, overdue Tasks, and the AI's recommended first Task
- [ ] Dismissing the overlay (button or Escape) reveals the split-view layout
- [ ] Subsequent page loads on the same calendar day skip the briefing entirely
- [ ] When no Tasks are scheduled today and none are overdue, a "day is clear" message is shown
- [ ] `app_state.last_briefing_date` is updated on each new-day briefing display

## Blocked by

- `04-ai-scheduler-time-block-propose-approve-flow`
- `05-next-action-card-and-scorer`
