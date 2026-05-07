# SQLite persistence via write-through API routes

All Task and Time Block state is persisted to a local SQLite database (`kairos.db`) using Drizzle ORM. Every client-side state change (create task, complete task, approve Time Block) immediately calls a Next.js API route which writes to the database. On page load, all Tasks and Time Blocks are fetched from the database as the initial React state.

We chose write-through over an explicit-save model because there is no meaningful "draft" concept in this app — a task either exists or it doesn't. We chose API routes over Server Actions because the codebase had no prior Server Action usage and explicit HTTP endpoints are easier to reason about and test in isolation. We chose SQLite over a hosted database because this is a local-only, single-user app with no deployment target — SQLite requires zero infrastructure and the database file is trivially portable.

Dates are stored as ISO 8601 strings (TEXT columns) rather than Unix timestamps for human readability when inspecting the database directly.
