Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD-frontend-backend-integration.md`

## What to build

Two things in one slice: wire the calendar to render live Task Time Blocks, and delete all prototype files.

**Calendar — live Time Blocks**: The calendar currently renders only static external events. Add a second rendering layer for Task Time Blocks from the live in-memory array. Task Time Blocks use a dark red background with a red left border. External events use dark indigo with an indigo left border. The visual distinction makes it immediately clear which blocks are tasks vs. meetings.

**Prototype cleanup**: Once the real app is fully wired (all int-01 through int-04 complete), delete:
- The entire `app/prototype/` directory (all variant files, switcher, mock-data, page)
- Any remaining references to `MockTask`, `MockCalendarEvent`, or `MOCK_EVENTS` in the codebase

The `MOCK_EVENTS` static array used for external calendar events should be inlined as a `const` directly in the calendar component (not imported from the deleted prototype files) until Google Calendar sync (issue #3 in the original backlog) replaces it.

## Acceptance criteria

- [ ] Approving a Time Block proposal (from int-04) causes the event to appear on the calendar immediately
- [ ] Task Time Blocks are visually distinct from external calendar events (dark red vs. dark indigo)
- [ ] The `app/prototype/` directory is fully deleted
- [ ] No references to `MockTask`, `MockCalendarEvent`, or prototype-specific types remain in production code
- [ ] The static external events array is inlined in the calendar component, not imported from a deleted file
- [ ] Navigating to `/prototype/layout` returns a 404 (route no longer exists)
- [ ] All 17 existing tests continue to pass

## Blocked by

- `int-04-schedule-popover-propose-candidates`
