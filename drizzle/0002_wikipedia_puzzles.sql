CREATE TABLE "wikipedia_puzzles" (
	"date" text PRIMARY KEY NOT NULL,
	"puzzle" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
