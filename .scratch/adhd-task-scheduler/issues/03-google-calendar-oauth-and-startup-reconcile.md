Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD.md`

## What to build

Wire up Google Calendar API access using OAuth 2.0 credentials from `.env.local`. On app startup, read all Time Block events from Google Calendar and reconcile them with the local `time_blocks` table — updating rows where the remote event differs and removing local rows whose Google Calendar event no longer exists.

The Google Calendar sync service wraps the API client and exposes four operations used by later slices: create event, update event, delete event, and reconcile. All four handle API errors gracefully: on failure, the local state is left unchanged and a non-blocking toast notification is shown to the user.

The README should document the one-time Google Cloud setup steps (create project, enable Calendar API, create OAuth credentials, populate `.env.local`).

## Acceptance criteria

- [ ] App reads `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` from `.env.local`
- [ ] On startup, the sync service fetches Time Block events from Google Calendar and reconciles with the local `time_blocks` table
- [ ] Local `time_blocks` rows are updated when the corresponding Google Calendar event has changed
- [ ] Local `time_blocks` rows whose Google Calendar event no longer exists are removed
- [ ] A Google Calendar API error during reconcile shows a non-blocking toast and leaves local state unchanged
- [ ] The sync service exposes create, update, delete, and reconcile operations for use by other slices
- [ ] README documents the Google Cloud project setup and `.env.local` configuration

## Blocked by

- `01-project-scaffold-and-database-schema`
