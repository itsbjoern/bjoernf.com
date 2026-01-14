CREATE TABLE "habit_passkeys" (
	"id" text PRIMARY KEY NOT NULL,
	"tracker_id" uuid NOT NULL,
	"public_key" text NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean DEFAULT false NOT NULL,
	"transports" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "habit_trackers" DROP CONSTRAINT "habit_trackers_password_hash_unique";--> statement-breakpoint
ALTER TABLE "habit_passkeys" ADD CONSTRAINT "habit_passkeys_tracker_id_habit_trackers_id_fk" FOREIGN KEY ("tracker_id") REFERENCES "public"."habit_trackers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_trackers" DROP COLUMN "password_hash";