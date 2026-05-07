Status: ready-for-agent

## Parent

`.scratch/adhd-task-scheduler/PRD-sqlite-persistence.md`

## What to build

Clean up the domain type inconsistencies resolved in the grill-with-docs session before the persistence layer is built on top of them.

Two changes:

1. **Rename `TimeRange` to `OccupiedRange`** in `lib/types.ts` and update all call sites. `OccupiedRange` is the canonical term for a generic time interval passed to the AI Scheduler to represent any period that cannot be scheduled. `TimeRange` was a generic name that didn't reflect its domain meaning.

2. **Move `TimeBlock` to `lib/types.ts`**. The approved, task-linked scheduled period is currently defined as a local interface in `lib/daily-progress.ts`. It is a first-class domain type and belongs in the shared types module alongside `Task`, `OccupiedRange`, and `TimeBlockCandidate`. Update all imports.

No behavior changes — this is a pure rename and type relocation. All 22 existing tests must continue to pass.

## Acceptance criteria

- [ ] `OccupiedRange` replaces `TimeRange` everywhere in the codebase
- [ ] `TimeBlock` is defined in `lib/types.ts` and imported from there by all consumers (including `lib/daily-progress.ts` and `app/page.tsx`)
- [ ] No duplicate `TimeBlock` interface definitions remain
- [ ] All 22 existing tests pass without modification

## Blocked by

None — can start immediately.
