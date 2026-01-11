PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_trackers` (
	`id` text PRIMARY KEY NOT NULL,
	`password_hash` text NOT NULL,
	`color` text DEFAULT '#216e39' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_trackers`("id", "password_hash", "color", "created_at") SELECT "id", "password_hash", "color", "created_at" FROM `trackers`;--> statement-breakpoint
DROP TABLE `trackers`;--> statement-breakpoint
ALTER TABLE `__new_trackers` RENAME TO `trackers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `trackers_password_hash_unique` ON `trackers` (`password_hash`);