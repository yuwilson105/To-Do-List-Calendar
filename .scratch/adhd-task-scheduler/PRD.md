Status: ready-for-agent

# PRD: ADHD Task Scheduler

## Problem Statement

Managing tasks and a calendar is cognitively expensive for people with ADHD. Existing to-do apps require too many decisions at capture time, don't integrate with real schedules, and offer no help with the hardest parts: knowing what to start, when to start it, and actually starting it. The result is inconsistent use, missed deadlines, and the guilt spiral that follows. Time blindness — the inability to intuitively sense how much time has passed or how long something will take — compounds every one of these problems.

## Solution

A local-first, single-user web app that combines a frictionless task list with a Google Calendar-integrated AI scheduler, designed from the ground up for ADHD brains. The app removes friction at every step: tasks are captured in one keystroke, the AI proposes when to do them (working around your real calendar), and a focused daily view tells you exactly what to do next. A configurable Pomodoro timer, daily briefing, progress bar, and streak counter provide the structure and positive reinforcement that make consistent use possible.

## User Stories

1. As a user with ADHD, I want to add a task by typing its title and pressing Enter, so that I can capture ideas before I lose them without breaking my flow.
2. As a user with ADHD, I want the Quick-Add Bar to always be visible regardless of which view I'm in, so that task capture is never more than one click away.
3. As a user with ADHD, I want new tasks to have sensible defaults (medium priority, 30-minute duration), so that I don't have to make decisions at capture time.
4. As a user with ADHD, I want to expand a task later to add a due date, priority, estimated duration, tags, and notes, so that I can enrich tasks when I have the mental bandwidth.
5. As a user with ADHD, I want to see my task list and calendar side by side, so that I can understand my workload and schedule at a glance without switching views.
6. As a user with ADHD, I want the app to tell me what to work on right now via a Next Action Card, so that I don't experience decision paralysis when starting a work session.
7. As a user with ADHD, I want clicking the Next Action Card to immediately enter Focus Mode, so that task initiation requires zero additional decisions.
8. As a user with ADHD, I want Focus Mode to hide everything except the current task and a timer, so that I'm not distracted by the rest of the UI while working.
9. As a user with ADHD, I want a configurable Pomodoro timer in Focus Mode with custom work and break intervals, so that I can time-box my work in a way that suits my attention span.
10. As a user with ADHD, I want the timer to display remaining time in MM:SS format, so that I always know how much time is left in the current interval.
11. As a user with ADHD, I want the app to prompt me when a work interval ends and automatically start the break countdown, so that I don't have to manage the timer manually.
12. As a user with ADHD, I want to mark a task complete from within Focus Mode, so that I get the satisfaction of completion without leaving the focused context.
13. As a user with ADHD, I want a Daily Briefing when I open the app, so that I can orient myself quickly without scanning the full task list and calendar.
14. As a user with ADHD, I want the Daily Briefing to show today's scheduled tasks, overdue tasks, and the AI's recommendation for what to tackle first, so that I start each day with a clear plan.
15. As a user with ADHD, I want the Daily Briefing to appear only once per calendar day, so that it helps me orient without becoming an obstacle on subsequent visits.
16. As a user with ADHD, I want a daily progress bar showing tasks completed versus tasks due today, so that I get immediate positive feedback as I work through my list.
17. As a user with ADHD, I want a streak counter showing consecutive days of app use and task completion, so that I'm motivated to maintain consistent daily habits.
18. As a user with ADHD, I want the AI Scheduler to propose a specific time block for each task, so that I don't have to spend mental energy deciding when to schedule things.
19. As a user with ADHD, I want the AI Scheduler to avoid scheduling tasks during times already occupied by Google Calendar events, so that proposed time blocks are always realistic.
20. As a user with ADHD, I want the AI Scheduler to prefer my high-productivity hours for high-priority tasks, so that my most demanding work gets scheduled when I'm at my best.
21. As a user with ADHD, I want to approve or reject each proposed time block before it's committed, so that I stay in control of my schedule.
22. As a user with ADHD, I want the AI Scheduler to offer an alternative proposal when I reject one, so that I don't have to figure out a new time myself.
23. As a user with ADHD, I want approved time blocks to appear on my Google Calendar automatically, so that my task schedule is visible alongside my other commitments.
24. As a user with ADHD, I want the app to update or delete Google Calendar events when I reschedule or remove a time block, so that my calendar stays in sync without manual effort.
25. As a user with ADHD, I want the app to reconcile with Google Calendar on startup, so that any changes made externally are reflected in the app.
26. As a user with ADHD, I want the app to work fully offline for task management and local scheduling, so that a lost internet connection doesn't break my workflow.
27. As a user with ADHD, I want sync errors to appear as non-blocking notifications, so that a Google Calendar API failure doesn't interrupt what I'm doing.
28. As a user with ADHD, I want all my data stored locally on my machine, so that my task history and productivity patterns remain private.
29. As a user with ADHD, I want the calendar to support day, week, and month views, so that I can plan at different time horizons.
30. As a user with ADHD, I want to switch calendar views without a page reload, so that navigation feels instant and doesn't break my concentration.
31. As a user with ADHD, I want the app to learn what time of day I'm most productive based on when I actually complete tasks, so that scheduling suggestions improve over time.
32. As a user with ADHD, I want the app to track which types of tasks I tend to procrastinate on, so that the scheduler can account for my avoidance patterns.
33. As a user with ADHD, I want the habit learning to start with sensible defaults (peak productivity 9–12am) and refine as data accumulates, so that the app is useful from day one.
34. As a user with ADHD, I want to receive browser push notifications before scheduled time blocks, so that I don't miss them due to time blindness.
35. As a user with ADHD, I want email reminders as a fallback for push notifications, so that I'm covered even if I've closed the browser.
36. As a user with ADHD, I want reminder lead times to be calculated automatically based on task priority, so that high-priority tasks get more advance warning.
37. As a user with ADHD, I want to disable reminders globally or per task, so that I can reduce noise when needed.
38. As a user with ADHD, I want to delete a task and have its Google Calendar event removed automatically, so that my calendar doesn't accumulate stale entries.

## Implementation Decisions

### Architecture

- **Framework**: Next.js (full-stack). API routes handle scheduling logic, Google Calendar sync, and reminder dispatch. The frontend is a React SPA within the Next.js app.
- **Database**: SQLite via Drizzle ORM. All Task, Time Block, Habit Model, Streak, and Reminder data lives in a local SQLite file. No cloud database.
- **Deployment**: Local only. The app runs as a local Next.js dev server. No Vercel or cloud hosting.
- **Background jobs**: A Node.js cron job (using `node-cron`) runs alongside the Next.js server to dispatch Reminders at a minimum one-minute polling interval.
- **Styling**: Tailwind CSS.
- **Calendar UI**: FullCalendar (React wrapper) for day, week, and month views.

### Database Schema (key tables)

- **tasks**: id, title, due_date, priority (low/medium/high), estimated_duration_minutes, tags (JSON array), notes, status (incomplete/complete), created_at, completed_at
- **time_blocks**: id, task_id (FK), start_time, end_time, google_calendar_event_id, status (proposed/approved/rejected)
- **habit_completions**: id, task_id (FK), completed_at, hour_of_day, tags (JSON array), scheduled_start (nullable, for procrastination delta)
- **reminders**: id, task_id (FK), time_block_id (FK), scheduled_at, channel (push/email), dispatched_at (nullable), failed (boolean)
- **app_state**: key, value (used for streak, last_briefing_date, timer config)

### Module: AI Scheduler

Accepts a Task and a list of occupied time ranges (from local Time Blocks + Google Calendar events). Returns a ranked list of proposed Time Block candidates.

Scoring logic:
1. Enumerate free slots in the next 7 days (respecting working hours 8am–8pm by default)
2. Score each slot: due-date urgency weight + priority weight + Habit Model productivity weight for that hour
3. Return the top 3 candidates for user selection

The AI Scheduler is a pure function: `proposeCandidates(task, occupiedRanges, habitModel) → TimeBlockCandidate[]`. No side effects — it does not write to the database or call Google Calendar.

### Module: Next Action Scorer

A pure function: `scoreTask(task, habitModel, now) → number`.

Scoring formula (all weights configurable):
- Due date proximity: exponential decay — tasks due sooner score higher
- Priority: high = 3, medium = 2, low = 1
- Habit Model time-of-day weight for the current hour

The Next Action Card calls this for every incomplete Task and surfaces the highest scorer. Recalculates on task completion, task creation, and on a 5-minute polling interval.

### Module: Habit Model

Encapsulates all read/write access to the `habit_completions` table.

Public interface:
- `recordCompletion(taskId, completedAt, tags, scheduledStart?)` — writes a completion event
- `getProductivityWeights() → HourlyWeights` — returns a 24-element array of relative productivity weights, one per hour. Falls back to a default curve (peak 9–12) until 10+ completions exist.
- `getProcrastinationDeltaByTag(tag) → minutes` — average delta between scheduled start and actual completion for tasks with that tag

The Habit Model never calls external services. All data stays in SQLite.

### Module: Reminder Scheduler

Accepts a Time Block and a Task, computes the reminder lead time, and writes a `reminders` row.

Lead time rules:
- High priority: 15 minutes before Time Block start
- Medium/low priority: 5 minutes before Time Block start

The Cron Job calls a `dispatchPendingReminders()` function every minute. This function queries for undispatched reminders due in the past minute, sends them via the configured channel (push/email), and marks them dispatched or failed.

### Module: Pomodoro Timer

Client-side only. A React hook (`usePomodoroTimer`) that manages the work/break state machine.

States: `idle → working → break → working → ...`

Config: `workMinutes` (default 25), `breakMinutes` (default 5). Persisted to `app_state` in SQLite so settings survive page reloads.

The timer does not interact with the AI Scheduler or Habit Model.

### Module: Streak & Progress Tracker

Reads and writes the `app_state` table.

- `getStreak() → number` — reads current streak value
- `recordAppOpen(today)` — increments streak if yesterday had a completion, resets to 0 otherwise
- `getDailyProgress(today) → { completed: number, total: number }` — counts tasks completed today vs. tasks due/scheduled today

### Google Calendar Sync

A server-side service (not a standalone module) that wraps the Google Calendar API client. Called by:
- Time Block approval (create event)
- Time Block reschedule (update event)
- Time Block removal / Task deletion (delete event)
- App startup (reconcile)

OAuth 2.0 credentials are stored in `.env.local`. The sync service stores the Google Calendar event ID on the `time_blocks` row after creation.

### Daily Briefing

Computed server-side on app load. Checks `app_state.last_briefing_date` — if it differs from today, returns briefing data (today's time blocks, overdue tasks, top Next Action scorer result) and updates the date. Subsequent loads return a "no briefing" signal.

## Testing Decisions

Good tests for this app verify **observable outputs given controlled inputs** — they do not assert on internal state, implementation details, or database internals. Each logic-heavy module exposes a pure or near-pure interface that makes this straightforward.

### Modules to test

**AI Scheduler** (`proposeCandidates`)
- Given a task with a known duration and priority, and a set of occupied ranges, assert that no proposed candidate overlaps an occupied range
- Assert that high-priority tasks are proposed in the 9–12 window when the Habit Model is at defaults
- Assert that the returned candidates are sorted by score descending
- Assert that when no free slots exist in the next 7 days, an empty array is returned

**Next Action Scorer** (`scoreTask`)
- Assert that a high-priority task due today scores higher than a low-priority task due next week
- Assert that score increases as due date approaches
- Assert that the Habit Model's hourly weight influences the score proportionally
- Assert that a completed task is never returned as the next action

**Habit Model** (`getProductivityWeights`, `recordCompletion`, `getProcrastinationDeltaByTag`)
- Assert that `getProductivityWeights` returns the default curve when fewer than 10 completions exist
- Assert that after 10+ completions concentrated in the 9–11am window, those hours have higher weights
- Assert that `getProcrastinationDeltaByTag` returns the correct average delta for a known set of completions
- Assert that no data is transmitted externally (mock the network layer and assert zero calls)

**Reminder Scheduler** (`computeLeadTime`, `dispatchPendingReminders`)
- Assert that a high-priority task gets a 15-minute lead time
- Assert that a medium-priority task gets a 5-minute lead time
- Assert that `dispatchPendingReminders` marks reminders as dispatched after successful send
- Assert that failed dispatches are logged with task ID and scheduled time

### Prior art

No existing tests in the codebase (greenfield project). Use Vitest as the test runner — it integrates naturally with Next.js and supports TypeScript without additional config. Use `vitest --run` for single-pass CI execution (not watch mode).

## Out of Scope

- Multi-user support or authentication of any kind
- Cloud deployment or hosting
- Outlook / Microsoft Calendar integration
- Mobile or desktop native apps (PWA is acceptable as a future enhancement)
- Natural language task input parsing (e.g. "remind me to call John tomorrow at 3pm")
- LLM-based scheduling reasoning
- Subtasks, task dependencies, or recurring tasks
- Drag-and-drop rescheduling on the calendar (manual time selection via a picker is sufficient for v1)
- SMS reminders
- Data export or backup tooling
- Team or shared calendar features

## Further Notes

- The ADHD-first design philosophy is a first-class constraint, not a nice-to-have. Every UI decision should be evaluated against: "does this add friction or cognitive load?" If yes, it needs strong justification to stay.
- The Habit Model has a cold-start problem by design — the default 9–12am peak is a reasonable prior for knowledge workers. Users should be able to override this default in settings before enough data accumulates.
- Google Calendar OAuth requires a Google Cloud project with the Calendar API enabled and OAuth credentials in `.env.local`. The setup process should be documented in the README.
- The `node-cron` job and the Next.js server should be started together via a single `npm run dev` command (using `concurrently` or a custom server entry point).
- Phase 2 (Habit Learning + Reminders) is fully designed in the requirements document and the module interfaces above are built to support it — the Habit Model and Reminder Scheduler modules should be scaffolded in Phase 1 even if their full behavior ships in Phase 2.
