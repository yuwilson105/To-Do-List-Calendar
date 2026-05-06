Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD.md`

## What to build

Deliver the core task management UI and the split-view shell in one slice. The left panel shows the Quick-Add Bar at the top, followed by a scrollable task list. The right panel renders a FullCalendar instance (day/week/month views, no events yet). Tasks created via the Quick-Add Bar are persisted to SQLite and appear in the list immediately.

**Quick-Add Bar**: always visible, single text input. Pressing Enter creates a Task with the typed title, defaulting to medium priority, 30-minute estimated duration, and no due date. The input clears after submission.

**Task list**: each Task row shows title, priority badge, and a completion checkbox. Checking the box marks the Task complete (sets `completed_at`, updates `status`). Clicking a Task row opens an inline or modal editor for all fields: title, due date, priority, estimated duration, tags, notes. Deleting a Task removes it from the list and database.

**Split-view layout**: Quick-Add Bar spans the full width at the top. Below it, task list panel on the left, FullCalendar panel on the right. Calendar view switcher (day/week/month) is visible in the calendar panel header. View switches happen without a page reload.

## Acceptance criteria

- [ ] Quick-Add Bar is visible at all times across all views
- [ ] Pressing Enter in the Quick-Add Bar creates a Task with correct defaults and clears the input
- [ ] New Tasks appear in the task list immediately without a page reload
- [ ] Task rows display title, priority badge, and a completion checkbox
- [ ] Checking the completion checkbox marks the Task complete and persists `completed_at`
- [ ] Clicking a Task row opens an editor for all Task fields (title, due date, priority, estimated duration, tags, notes)
- [ ] Saving edits persists changes to SQLite
- [ ] Deleting a Task removes it from the list and database
- [ ] Split-view layout renders with task list on the left and FullCalendar on the right
- [ ] Day, week, and month calendar views are selectable and render without a page reload

## Blocked by

- `01-project-scaffold-and-database-schema`
