Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD.md`

## What to build

Implement Focus Mode and the Pomodoro Timer, and wire the Next Action Card click to enter it.

**Focus Mode**: a full-screen overlay that hides all other UI. Shows only the Task title, Task notes, the Pomodoro Timer, a "Mark complete" button, and an "Exit" button. Entering Focus Mode is triggered by clicking the Next Action Card or a "Focus" button on any Task row.

**Pomodoro Timer** (`usePomodoroTimer` React hook): manages the work → break → work state machine. Config: `workMinutes` (default 25) and `breakMinutes` (default 5), persisted to the `app_state` table so settings survive page reloads. Displays remaining time in MM:SS format. When the work interval ends, shows a break prompt and starts the break countdown automatically. When the break interval ends, prompts to begin the next work interval. Timer settings are editable from within Focus Mode.

**Mark complete**: clicking "Mark complete" records `completed_at` on the Task, exits Focus Mode, and returns to the split-view layout. **Exit**: clicking "Exit" leaves the Task incomplete and returns to the split-view layout.

## Acceptance criteria

- [ ] Clicking the Next Action Card enters Focus Mode for the selected Task
- [ ] Focus Mode hides all UI except Task title, notes, Pomodoro Timer, "Mark complete", and "Exit"
- [ ] Timer displays remaining time in MM:SS format
- [ ] Work and break interval durations are configurable and default to 25/5 minutes
- [ ] Timer config is persisted to `app_state` and survives page reloads
- [ ] When the work interval ends, a break prompt appears and the break countdown starts automatically
- [ ] When the break interval ends, a prompt to start the next work interval appears
- [ ] "Mark complete" records `completed_at`, exits Focus Mode, and returns to split-view
- [ ] "Exit" exits Focus Mode without modifying the Task

## Blocked by

- `05-next-action-card-and-scorer`
