# Kairos

A personal productivity web app combining a to-do list with Google Calendar integration and a heuristic AI scheduler, purpose-built for users with ADHD. Runs locally, single user, no authentication.

## Language

**Task**:
A unit of work with a title and optional metadata (due date, priority, estimated duration, tags, notes).
_Avoid_: Todo, item, action item

**Time Block**:
An approved, task-linked scheduled period of focused work — stored locally and synced to Google Calendar as an event.
_Avoid_: Event (for task blocks), slot, appointment

**Time Block Candidate**:
A proposed Time Block returned by the AI Scheduler before the user approves or rejects it. Has a score but no taskId yet.
_Avoid_: Suggestion, proposal, slot

**Occupied Range**:
A generic time interval used as input to the AI Scheduler to represent any period that cannot be scheduled — includes existing Time Blocks and external calendar events.
_Avoid_: TimeRange, busy slot, conflict

**Next Action**:
The single highest-scoring incomplete Task surfaced by the Next Action Scorer at any given moment.
_Avoid_: Top task, recommended task, priority task

**Habit Model**:
The per-user data model that tracks completion timing, time-of-day productivity patterns, and procrastination patterns by tag. Used to weight Time Block Candidate scoring.
_Avoid_: User model, productivity model, learning model

**AI Scheduler**:
The heuristic scheduling engine that proposes Time Block Candidates for a Task given a set of Occupied Ranges and a Habit Model.
_Avoid_: Scheduler, planner, auto-scheduler

**Focus Mode**:
A stripped-down UI view showing a single Task and a configurable Pomodoro Timer, entered from the Next Action Card.
_Avoid_: Focus view, deep work mode

**Daily Briefing**:
A dismissible overlay shown once per calendar day on app open, summarising today's Time Blocks, overdue Tasks, and the current Next Action.
_Avoid_: Morning summary, daily summary

**Streak**:
A count of consecutive calendar days on which the user opened the app and completed at least one Task.
_Avoid_: Streak count, usage streak

**Quick-Add Bar**:
The always-visible text input at the top of the app for near-instant Task capture. Only the title is required.
_Avoid_: Task input, add bar, capture bar

## Relationships

- A **Task** may have zero or one approved **Time Block**
- A **Time Block** belongs to exactly one **Task**
- The **AI Scheduler** takes a **Task**, a list of **Occupied Ranges**, and a **Habit Model** — and returns a ranked list of **Time Block Candidates**
- The **Next Action Scorer** takes a **Task**, a **Habit Model**, and the current time — and returns a numeric score
- The **Next Action** is the incomplete **Task** with the highest score at the current moment

## Flagged ambiguities

- `TimeRange` in early code was used for both Occupied Ranges and Time Block shapes — resolved: `TimeRange` is renamed to `OccupiedRange`; `TimeBlock` is the canonical term for an approved, task-linked scheduled period

## Persistence model

- **Database**: SQLite via Drizzle ORM, stored at `kairos.db` in the project root
- **Write model**: write-through — every state change persists immediately via Next.js API routes
- **Read model**: all Tasks and Time Blocks loaded on page load
- **Date storage**: ISO 8601 strings (TEXT columns) with JS `Date` transform in Drizzle
- **Initial schema**: `tasks` and `time_blocks` tables only; `app_state`, `habit_completions`, and `reminders` are added in later issues
