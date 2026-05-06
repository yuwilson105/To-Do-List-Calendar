# Requirements Document

## Introduction

The ADHD Task Scheduler is a personal productivity web application built with Next.js, designed for local-only, single-user deployment. It combines a to-do list with Google Calendar integration and a heuristic-based AI scheduler, purpose-built for users with ADHD. The application prioritises minimal friction at task capture, reduces decision fatigue through AI-assisted scheduling, and reinforces consistent daily use through focus tools and positive feedback mechanisms.

The MVP delivers the core task list, calendar UI, Google Calendar sync, and AI scheduling (suggest + approve flow). Habit learning and smart reminders are Phase 2 features that are designed for in this document.

---

## Glossary

- **App**: The ADHD Task Scheduler Next.js web application running locally.
- **Task**: A unit of work with a title and optional metadata (due date, priority, estimated duration, tags, notes).
- **Time Block**: A calendar event representing a scheduled period of focused work on a Task.
- **AI Scheduler**: The heuristic-based scheduling engine that proposes Time Blocks for user approval.
- **Habit Model**: The per-user data model that tracks completion timing, time-of-day productivity patterns, and procrastination patterns by tag.
- **Google Calendar**: The external Google Calendar service accessed via the Google Calendar API.
- **Sync**: The bidirectional exchange of Time Block data between the App and Google Calendar.
- **Quick-Add Bar**: The always-visible input field at the top of the UI for near-instant task capture.
- **Next Action Card**: The prominently displayed card at the top of the task list showing the AI-selected highest-priority task to work on now.
- **Focus Mode**: A stripped-down UI view showing a single Task and a configurable Pomodoro-style timer.
- **Daily Briefing**: The summary shown on app open covering today's schedule, overdue items, and an AI recommendation.
- **Reminder**: A browser push notification or email sent to the user before a scheduled Task.
- **Cron Job**: The Node.js background process responsible for scheduling and dispatching Reminders.
- **Streak**: A count of consecutive days on which the user has opened the App and completed at least one Task.
- **Pomodoro Timer**: A configurable work/break interval timer used in Focus Mode.
- **Drizzle ORM**: The TypeScript ORM used to interact with the local SQLite database.
- **FullCalendar**: The calendar UI library used to render day, week, and month calendar views.

---

## Requirements

### Requirement 1: Task Creation and Management

**User Story:** As a user with ADHD, I want to capture tasks instantly with minimal required input, so that I don't lose ideas due to friction in the capture process.

#### Acceptance Criteria

1. THE App SHALL provide a Quick-Add Bar that is visible at all times across all views.
2. WHEN the user types a task title into the Quick-Add Bar and presses Enter, THE App SHALL create a new Task with only the title field required.
3. WHEN a Task is created via the Quick-Add Bar, THE App SHALL assign sensible defaults: priority set to "medium", estimated duration set to 30 minutes, and no due date.
4. THE App SHALL allow the user to set or edit the following Task fields: title, due date, priority (low / medium / high), estimated duration (in minutes), tags, and notes.
5. WHEN the user saves edits to a Task, THE App SHALL persist all changes to the local SQLite database via Drizzle ORM.
6. WHEN the user deletes a Task, THE App SHALL remove the Task and any associated Time Blocks from the local database.
7. IF a Task has an associated Time Block on Google Calendar, THEN THE App SHALL delete the corresponding Google Calendar event when the Task is deleted.
8. THE App SHALL display all Tasks in a scrollable task list panel on the left side of the split-view layout.

---

### Requirement 2: Split-View Layout

**User Story:** As a user, I want to see my task list and calendar side by side, so that I can understand my schedule and workload at a glance without switching views.

#### Acceptance Criteria

1. THE App SHALL render a split-view layout with the task list panel on the left and the calendar panel on the right.
2. THE App SHALL display the Quick-Add Bar at the top of the interface, above both the task list and calendar panels.
3. THE App SHALL display the Next Action Card at the top of the task list panel, above the task list.
4. THE App SHALL support calendar views for day, week, and month, selectable by the user.
5. WHEN the user selects a calendar view, THE App SHALL render the selected view using FullCalendar without a full page reload.

---

### Requirement 3: Google Calendar Integration

**User Story:** As a user, I want my scheduled tasks to appear on my Google Calendar, so that my task schedule is visible alongside my other commitments.

#### Acceptance Criteria

1. THE App SHALL authenticate with the Google Calendar API using OAuth 2.0 credentials stored in local environment configuration.
2. WHEN the user approves a proposed Time Block, THE App SHALL create a corresponding event on the user's Google Calendar via the Google Calendar API.
3. WHEN a Time Block event is created on Google Calendar, THE App SHALL store the Google Calendar event ID against the Task in the local database.
4. WHEN the user reschedules a Time Block within the App, THE App SHALL update the corresponding Google Calendar event to reflect the new time.
5. WHEN the user removes a Time Block from a Task, THE App SHALL delete the corresponding Google Calendar event.
6. WHEN the App starts, THE App SHALL read existing Time Block events from Google Calendar and reconcile them with the local database, updating any events that differ.
7. IF the Google Calendar API returns an error during any sync operation, THEN THE App SHALL display a non-blocking error notification to the user and retain the local state unchanged.
8. THE App SHALL perform Google Calendar sync without requiring a page reload.

---

### Requirement 4: AI Scheduling (Heuristic-Based)

**User Story:** As a user with ADHD, I want the app to suggest when I should work on tasks, so that I don't have to spend mental energy deciding when to schedule things.

#### Acceptance Criteria

1. WHEN the user requests scheduling for a Task (or a Task is created without a Time Block), THE AI Scheduler SHALL propose a Time Block with a specific start time, end time, and date.
2. WHEN proposing a Time Block, THE AI Scheduler SHALL use the Task's estimated duration to set the block length.
3. WHEN proposing a Time Block, THE AI Scheduler SHALL avoid scheduling during times already occupied by existing Time Blocks or Google Calendar events.
4. WHEN proposing a Time Block, THE AI Scheduler SHALL apply the Habit Model's time-of-day productivity patterns to prefer high-productivity windows for high-priority Tasks.
5. WHEN the AI Scheduler has no Habit Model data for a user, THE AI Scheduler SHALL default to treating 9:00–12:00 as the peak productivity window.
6. THE App SHALL present each proposed Time Block to the user for approval before creating it.
7. WHEN the user approves a proposed Time Block, THE App SHALL save the Time Block to the local database and trigger Google Calendar sync.
8. WHEN the user rejects a proposed Time Block, THE App SHALL offer an alternative proposal or allow the user to manually select a time.
9. THE AI Scheduler SHALL NOT automatically create Time Blocks without explicit user approval.

---

### Requirement 5: Next Action Card

**User Story:** As a user with ADHD, I want the app to tell me what to work on next, so that I don't experience decision paralysis when starting a work session.

#### Acceptance Criteria

1. THE App SHALL display a Next Action Card at the top of the task list at all times.
2. WHEN calculating the Next Action, THE AI Scheduler SHALL select the Task with the highest combined score based on: due date proximity, priority level, and the Habit Model's current time-of-day productivity pattern.
3. WHEN no incomplete Tasks exist, THE Next Action Card SHALL display a message indicating there are no pending tasks.
4. WHEN the user completes the Task shown in the Next Action Card, THE App SHALL recalculate and display the next highest-scoring Task.
5. WHEN the user clicks the Next Action Card, THE App SHALL enter Focus Mode for the selected Task.

---

### Requirement 6: Focus Mode

**User Story:** As a user with ADHD, I want a distraction-free mode with a timer, so that I can maintain focus on a single task without being overwhelmed by the rest of the UI.

#### Acceptance Criteria

1. WHEN the user activates Focus Mode for a Task, THE App SHALL display only the Task title, Task notes, and the Pomodoro Timer, hiding all other UI elements.
2. THE App SHALL provide a Pomodoro Timer with configurable work interval duration (default: 25 minutes) and break interval duration (default: 5 minutes).
3. WHEN the work interval ends, THE App SHALL display a break prompt and start the break interval countdown.
4. WHEN the break interval ends, THE App SHALL display a prompt to begin the next work interval.
5. THE App SHALL allow the user to exit Focus Mode at any time, returning to the split-view layout.
6. WHEN the user marks the Task as complete from within Focus Mode, THE App SHALL record the completion, exit Focus Mode, and return to the split-view layout.
7. WHEN the Pomodoro Timer is running, THE App SHALL display the remaining time in MM:SS format.

---

### Requirement 7: Daily Briefing

**User Story:** As a user with ADHD, I want a summary when I open the app, so that I can orient myself quickly without having to scan the entire task list and calendar.

#### Acceptance Criteria

1. WHEN the user opens the App, THE App SHALL display a Daily Briefing overlay or panel before showing the main split-view layout.
2. THE Daily Briefing SHALL include: a list of Tasks scheduled for today, a list of overdue Tasks, and the AI Scheduler's recommendation for which Task to tackle first.
3. WHEN the user dismisses the Daily Briefing, THE App SHALL display the main split-view layout.
4. THE App SHALL show the Daily Briefing once per calendar day per app session; subsequent page loads on the same day SHALL go directly to the split-view layout.
5. WHEN no Tasks are scheduled for today and no Tasks are overdue, THE Daily Briefing SHALL display a message indicating the day is clear.

---

### Requirement 8: Progress Bar and Streak Counter

**User Story:** As a user with ADHD, I want to see my daily progress and usage streak, so that I receive positive reinforcement that encourages me to keep using the app consistently.

#### Acceptance Criteria

1. THE App SHALL display a daily progress bar showing the number of Tasks completed today versus the total number of Tasks due or scheduled today.
2. WHEN the user completes a Task, THE App SHALL update the progress bar immediately without a page reload.
3. THE App SHALL display a Streak counter showing the number of consecutive days on which the user opened the App and completed at least one Task.
4. WHEN the user opens the App on a new calendar day and has completed at least one Task on the previous calendar day, THE App SHALL increment the Streak counter by one.
5. WHEN the user does not open the App or completes no Tasks on a calendar day, THE App SHALL reset the Streak counter to zero on the next app open.
6. THE App SHALL persist the Streak counter value in the local SQLite database.

---

### Requirement 9: Habit Learning (Phase 2)

**User Story:** As a user with ADHD, I want the app to learn my productivity patterns over time, so that scheduling suggestions become increasingly accurate to how I actually work.

#### Acceptance Criteria

1. WHEN the user completes a Task, THE App SHALL record the completion timestamp, the Task's tags, and the time of day in the Habit Model.
2. THE Habit Model SHALL track time-of-day productivity patterns by calculating the distribution of Task completions across hourly time buckets.
3. THE Habit Model SHALL track procrastination patterns per tag by recording the delta between a Task's scheduled Time Block start time and the actual completion timestamp.
4. WHEN the Habit Model has recorded at least 10 Task completions, THE AI Scheduler SHALL use the Habit Model's time-of-day productivity distribution to weight Time Block proposals.
5. WHEN the Habit Model has fewer than 10 Task completions, THE AI Scheduler SHALL use the default peak productivity window of 9:00–12:00.
6. THE App SHALL store all Habit Model data in the local SQLite database via Drizzle ORM.
7. THE App SHALL NOT transmit Habit Model data to any external service.

---

### Requirement 10: Reminders (Phase 2)

**User Story:** As a user with ADHD, I want to receive reminders before scheduled tasks, so that I don't miss time blocks due to time blindness.

#### Acceptance Criteria

1. THE App SHALL request browser push notification permission from the user on first launch.
2. WHEN the user grants push notification permission, THE App SHALL send browser push notifications for upcoming Time Blocks.
3. THE App SHALL support email reminders as an alternative or supplement to push notifications, configurable by the user.
4. WHEN a Time Block is scheduled, THE AI Scheduler SHALL calculate a reminder lead time based on the Task's priority and estimated duration.
5. WHEN a Task has high priority, THE AI Scheduler SHALL schedule the reminder at least 15 minutes before the Time Block start time.
6. WHEN a Task has medium or low priority, THE AI Scheduler SHALL schedule the reminder at least 5 minutes before the Time Block start time.
7. THE Cron Job SHALL run at a minimum interval of one minute to check for pending Reminders and dispatch them.
8. IF the Cron Job fails to dispatch a Reminder, THEN THE Cron Job SHALL log the failure with the Task ID and scheduled reminder time to a local log file.
9. THE App SHALL allow the user to disable Reminders globally or per Task.

---

### Requirement 11: Data Persistence and Local Storage

**User Story:** As a user, I want all my task and scheduling data stored locally, so that my data remains private and the app works without an internet connection (except for Google Calendar sync).

#### Acceptance Criteria

1. THE App SHALL store all Task data, Time Block data, Habit Model data, and Streak data in a local SQLite database.
2. THE App SHALL use Drizzle ORM for all database read and write operations.
3. THE App SHALL function fully for task creation, editing, deletion, and local scheduling without an active internet connection.
4. WHEN Google Calendar sync is attempted without an internet connection, THE App SHALL display a non-blocking notification and queue the sync operation for retry when connectivity is restored.
5. THE App SHALL NOT require user authentication or account creation.
6. THE App SHALL NOT transmit Task data, Habit Model data, or personal information to any external service other than the Google Calendar API for sync operations.
