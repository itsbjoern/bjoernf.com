CREATE TABLE "habit_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_id" uuid NOT NULL,
	"completed_at" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tracker_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"tracker_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"data" jsonb DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_trackers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"password_hash" text NOT NULL,
	"color" text DEFAULT '#216e39' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "habit_trackers_password_hash_unique" UNIQUE("password_hash")
);
--> statement-breakpoint
ALTER TABLE "habit_completions" ADD CONSTRAINT "habit_completions_habit_id_habit_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habit_habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_habits" ADD CONSTRAINT "habit_habits_tracker_id_habit_trackers_id_fk" FOREIGN KEY ("tracker_id") REFERENCES "public"."habit_trackers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_sessions" ADD CONSTRAINT "habit_sessions_tracker_id_habit_trackers_id_fk" FOREIGN KEY ("tracker_id") REFERENCES "public"."habit_trackers"("id") ON DELETE cascade ON UPDATE no action;