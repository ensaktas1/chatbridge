CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`source` text NOT NULL,
	`source_url` text NOT NULL,
	`messages` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
