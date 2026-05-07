Status: ready-for-agent

# PRD: Frontend–Backend Integration (Variant D → Real App)

## Problem Statement

The Kairos app currently has two disconnected halves: a set of well-tested backend logic modules (AI Scheduler, Next Action Scorer, Habit Model, Reminder Scheduler) and a throwaway UI prototype (Variant D) that renders hardcoded mock data. Neither half is useful on its own. The user cannot add real tasks, see a real Next Action, or get a real schedule proposal — everything is static. The prototype answered the layout question; now it needs to become the actual application.

## Solution

Promote Variant D's dark split-view layout to the real app root, replace all mock data with live in-memory React state, and wire each interactive element to the corresponding backend module. Tasks created via the Quick-Add Bar use the real `Task` type. The Next Action Card calls `scoreTask()` with the real Habit Model. The "+ Schedule" button calls `proposeCandidates()` and shows an inline popover with the top candidate for approval. Completing a task calls `habitModel.recordCompletion()`. State lives in memory for now (SQLite persistence is a separate issue); the app is fully interactive from first load.

## User Stories

1. As a user with ADHD, I want to type a task title and press Enter to add it instantly, so that I can capture ideas without breaking my flow.
2. As a user with ADHD, I want new tasks to appear in the task list immediately after I add them, so that I get instant confirmation the task was captured.
3. As a user with ADHD, I want new tasks to default to medium priority and 30-minute duration, so that I don't have to make decisions at capture time.
4. As a user with ADHD, I want the Quick-Add Bar to clear after I press Enter, so that I can add the next task without extra steps.
5. As a user with ADHD, I want the Next Action Card to show the task I should work on right now, so that I don't have to decide what to start.
6. As a user with ADHD, I want the Next Action Card to be calculated by the real AI scoring logic, so that it reflects my actual priorities and due dates.
7. As a user with ADHD, I want the Next Action Card to update immediately when I complete a task, so that I always see the current best next action.
8. As a user with ADHD, I want to click "Start focus session" on the Next Action Card and enter Focus Mode, so that I can begin working with zero additional decisions.
9. As a user with ADHD, I want to check off a task from the task list, so that I can mark it complete without entering Focus Mode.
10. As a user with ADHD, I want completed tasks to visually dim and move to the bottom of the list, so that my attention stays on what's left to do.
11. As a user with ADHD, I want the progress bar to update immediately when I complete a task, so that I get instant positive feedback.
12. As a user with ADHD, I want to click "+ Schedule" on an unscheduled task and see a proposed time block inline, so that I don't have to think about when to do it.
13. As a user with ADHD, I want the schedule proposal to appear as a small popover directly under the task row, so that I stay in context and don't lose my place.
14. As a user with ADHD, I want the proposal to show the start time, end time, and date of the suggested Time Block, so that I can evaluate it at a glance.
15. As a user with ADHD, I want to approve a proposed Time Block with one click, so that scheduling a task takes minimal effort.
16. As a user with ADHD, I want to reject a proposal and see the next candidate, so that I can find a time that works without manually picking one.
17. As a user with ADHD, I want approved Time Blocks to appear on the calendar immediately, so that I can see my updated schedule without refreshing.
18. As a user with ADHD, I want the AI Scheduler to avoid proposing times that overlap with existing calendar events, so that proposals are always realistic.
19. As a user with ADHD, I want the AI Scheduler to prefer my peak productivity hours (9–12am by default) for high-priority tasks, so that my hardest work gets my best hours.
20. As a user with ADHD, I want completing a task to record my completion time in the Habit Model, so that the app starts learning my productivity patterns from day one.
21. As a user with ADHD, I want the streak counter to reflect how many consecutive days I've used the app, so that I'm motivated to keep the streak going.
22. As a user with ADHD, I want the calendar to show today's date and day name in the header, so that I'm always oriented in time.
23. As a user with ADHD, I want Time Block events on the calendar to be visually distinct from external calendar events, so that I can tell my tasks apart from meetings at a glance.

## Implementation Decisions

### Promote Variant D to the real app root

The Variant D component becomes the production UI at the app root (`/`). The prototype route (`/prototype/layout`) and all other variant files (A, B, C) are deleted. The prototype switcher is removed. The promoted component is rewritten from scratch using the real `Task` type — not adapted from the prototype, which was written under throwaway constraints.

### In-memory task store (React state)

Tasks live in a `useState` array at the root layout level. No database in this PRD — SQLite persistence is issue #1 in the backlog. The state shape uses the canonical `Task` interface from `lib/types.ts` exactly. Time Blocks are stored as a separate `useState` array of `{ taskId, start, end }` objects.

### Quick-Add Bar

Controlled input. On Enter: generate a `Task` with a `crypto.randomUUID()` id, the typed title, `priority: "medium"`, `estimatedDurationMinutes: 30`, `dueDate: null`, empty tags and notes, `status: "incomplete"`, `createdAt: new Date()`, `completedAt: null`. Append to the tasks array. Clear the input.

### Next Action Card — wired to `scoreTask`

On every render, call `scoreTask(task, habitModel, now)` for every incomplete Task and surface the highest scorer. `now` is `new Date()`. The Habit Model instance is created once at the root level and passed down (or held in a ref). Uses the default productivity curve (9–12am peak) until 10+ completions accumulate.

The Next Action Card recalculates on:
- Task creation (new task added)
- Task completion (status changes to complete)
- A 5-minute `setInterval` (handles time-of-day weight drift)

### Task completion flow

Checking a task's checkbox:
1. Sets `task.status = "complete"` and `task.completedAt = new Date()`
2. Calls `habitModel.recordCompletion(task.id, now, task.tags, scheduledStart ?? null)` where `scheduledStart` is the task's approved Time Block start (if any)
3. Triggers Next Action Card recalculation
4. Updates the progress bar

### "+ Schedule" inline popover — wired to `proposeCandidates`

Each incomplete, unscheduled Task row has a "+ Schedule" button. Clicking it:
1. Computes `occupiedRanges` from the current Time Blocks array (all approved blocks)
2. Calls `proposeCandidates(task, occupiedRanges, habitModel, new Date())`
3. Opens an inline popover directly below the task row showing the top candidate: formatted date, start time, end time, and duration
4. "Approve" button: adds the candidate to the Time Blocks array, closes the popover, updates the calendar
5. "Try another" button: cycles to the next candidate (index + 1); if no more candidates, shows "No more suggestions"
6. Clicking outside or pressing Escape closes the popover without scheduling

The popover is positioned absolutely relative to the task row. Only one popover is open at a time — opening a new one closes any existing one.

### Calendar — wired to real Time Blocks

The calendar renders two layers:
- **External events**: hardcoded mock events for now (Google Calendar sync is issue #3 in the backlog). These are the `MOCK_EVENTS` from the prototype, kept as static data until the real sync is built.
- **Task Time Blocks**: rendered from the live Time Blocks array. Visually distinct from external events (dark red background with red left border, vs dark indigo for external events).

The calendar header shows the real current date (`new Date()`), not the hardcoded "May 6, 2026".

The current-time indicator position is calculated from `new Date()` and updates every minute via `setInterval`.

### Habit Model instance

A single `HabitModel` instance (with `InMemoryHabitStore`) is created at the root component level and held in a `useRef` so it persists across renders without triggering re-renders. It is passed to `scoreTask` and `proposeCandidates` as needed. When SQLite is added (issue #1), the store implementation swaps out without changing any call sites.

### Streak and progress bar

- **Progress bar**: `completed / total` where `completed` = tasks with `status === "complete"` and `completedAt` on today's date; `total` = all tasks with `dueDate` on today or a Time Block starting today, plus completed tasks from today.
- **Streak**: stored in a `useState` number, initialised to 4 (the mock value) for now. Real streak logic (checking yesterday's completions) is part of issue #8 (Progress Bar & Streak Counter).

### Cleanup: delete prototype files

Once the real app is wired, delete:
- `app/prototype/` directory (all variants, switcher, mock-data, page)
- The `MOCK_TASKS`, `MOCK_EVENTS`, `MockTask`, `MockCalendarEvent` types

The `MOCK_EVENTS` array is temporarily inlined into the calendar component as a `const` until Google Calendar sync (issue #3) replaces it.

## Testing Decisions

Good tests verify observable behavior through public interfaces. They do not assert on React internals, component state, or implementation details.

The logic modules (`scoreTask`, `proposeCandidates`, `HabitModel`) are already tested in isolation with 17 passing tests. No new unit tests are needed for this PRD — the integration work is UI wiring, not new logic.

If a testing framework for React components is added in future (e.g. React Testing Library), the behaviors worth testing are:
- Quick-Add Bar: submitting a title creates a task visible in the list
- Task completion: checking a task updates the progress bar
- Schedule proposal: approving a candidate adds it to the calendar

No new tests are required to ship this PRD. The existing 17 tests continue to serve as the correctness guarantee for the scheduling logic.

## Out of Scope

- SQLite persistence (issue #1 — tasks reset on page reload)
- Google Calendar OAuth and sync (issue #3)
- Focus Mode and Pomodoro Timer (issue #6)
- Daily Briefing (issue #7)
- Real streak logic (issue #8)
- Reminder Scheduler and cron job (Phase 2)
- Habit Model persistence (Phase 2)
- Task editing (clicking a task to open an editor)
- Task deletion
- Drag-and-drop rescheduling on the calendar
- Week and month calendar views (D/W/M switcher is present but only D view is wired)

## Further Notes

- The prototype (Variant D) was written under throwaway constraints — no error handling, no accessibility, no tests. The promoted component should be rewritten properly, not copy-pasted. The visual design is the thing worth keeping; the code is not.
- The `InMemoryHabitStore` already exists in `lib/habit-model.ts` and is the correct store to use here. When SQLite is added, a `SqliteHabitStore` implementing the same `HabitModelStore` interface will replace it with zero changes to call sites.
- The `proposeCandidates` function searches 7 days forward from `now`. For the demo to show useful proposals, the mock external events should be updated to use today's real date rather than the hardcoded "2026-05-06" dates — or the external events array should be cleared until Google Calendar sync is built.
- ADHD-first principle applies to the promoted component: every interaction should require at most one click. The inline popover for scheduling is the right call — a modal would break focus.
