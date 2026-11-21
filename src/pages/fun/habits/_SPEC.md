A very simple habit tracker app that helps building daily habits. Every day you can visit the app and mark the habits you have completed. The app shows an overview of completed habits for the current year. It uses the same visualisation graph as GitHub contributions. Each square represents a day, and the color intensity indicates how many habits were completed on that day.

The frontend is built using Astro components and Tailwind for styling. It interacts with the backend API located in `/api/habits`, which is built using Astro endpoints.

The backend uses a Postgres database (tables `habit_*` in `src/db/schema.ts`), accessed through the Drizzle ORM. There are no user accounts: a "tracker" is created by registering a passkey (WebAuthn, via `@simplewebauthn`), and signing in with that passkey creates a session. Sessions live in the `habit_sessions` table and are referenced by the `habits_session` cookie (see `src/db/habits.ts`). A tracker can have multiple passkeys and sessions.

Each tracker can have multiple habits. Habits are defined by a name and description. Each day, the user can mark which habits they have completed. The backend provides endpoints to create, update, and delete habits, as well as to mark habits as completed for a specific day.

A tracker can be configured with a color, which defines the colors used in the habit completion graph.