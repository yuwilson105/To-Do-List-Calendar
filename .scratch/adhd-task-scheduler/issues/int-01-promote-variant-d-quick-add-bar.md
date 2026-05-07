Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD-frontend-backend-integration.md`

## What to build

Promote the Variant D dark split-view layout to the real app root (`/`), replacing the current placeholder page. Rewrite it from scratch using the canonical `Task` type from `lib/types.ts` — do not copy-paste the prototype code, which was written under throwaway constraints. The visual design (dark slate background, red "Do this now" card, compact calendar, split layout) is the thing to preserve; the implementation should be production-quality.

Wire the Quick-Add Bar so it actually creates Tasks. On Enter: generate a Task with a random id, the typed title, `priority: "medium"`, `estimatedDurationMinutes: 30`, `dueDate: null`, empty tags and notes, `status: "incomplete"`, `createdAt: new Date()`, `completedAt: null`. Append to a `useState` array at the root level. Clear the input. Tasks appear in the list immediately.

The calendar header should show the real current date (not hardcoded). The current-time indicator should reflect the real current time. External calendar events stay as a static inline array for now (Google Calendar sync is a separate issue).

State lives in memory — no database yet.

## Acceptance criteria

- [ ] Navigating to `/` shows the dark split-view layout (not the old placeholder)
- [ ] Quick-Add Bar is visible at the top of the app at all times
- [ ] Typing a title and pressing Enter creates a Task and appends it to the task list immediately
- [ ] The input clears after submission
- [ ] New tasks default to medium priority and 30-minute estimated duration
- [ ] The calendar header shows the real current day name and date
- [ ] The current-time indicator on the calendar reflects the real current time
- [ ] The prototype route (`/prototype/layout`) still exists and is not broken by this change
- [ ] All 17 existing tests continue to pass

## Blocked by

None — can start immediately.
