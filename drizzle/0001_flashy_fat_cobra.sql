CREATE TABLE `revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`owner` text NOT NULL,
	`revision` integer NOT NULL,
	`document` text NOT NULL,
	`at` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `revisions_event_revision_idx` ON `revisions` (`event_id`,`revision`);