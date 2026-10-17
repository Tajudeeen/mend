CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`owner` text NOT NULL,
	`revision` integer NOT NULL,
	`action` text NOT NULL,
	`detail` text NOT NULL,
	`actor` text NOT NULL,
	`at` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_event_idx` ON `audit` (`event_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`document` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_owner_idx` ON `events` (`owner`);