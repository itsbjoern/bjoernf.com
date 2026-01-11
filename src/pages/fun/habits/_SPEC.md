A very simple habit tracker app that helps building daily habits. Every day you can visit the app and mark the habits you have completed. The app shows an overview of completed habits for the current year. It uses the same visualisation graph as GitHub contributions. Each square represents a day, and the color intensity indicates how many habits were completed on that day.

The frontend is built using Astro components and Tailwind for styling. It interacts with the backend API located in `/api/habits`, which is built using Astro endpoints.

The backend uses a Postgres database to store habit data, managed through the Drizzle ORM. There is no users, authentication is a simple hashed password which creates a "tracker". Each tracker has an ID and a password hash stored in the database. The password is used to authenticate requests to modify habit data. Each tracker can have multiple active sessions, these are synced using the Astro session API. This is defined as the `session` in the astro config and uses db0 (unstorage) under the hood.

Each tracker can have multiple habits. Habits are defined by a name and description. Each day, the user can mark which habits they have completed. The backend provides endpoints to create, update, and delete habits, as well as to mark habits as completed for a specific day.

A tracker can be configured with a color, which defines the colors used in the habit completion graph.