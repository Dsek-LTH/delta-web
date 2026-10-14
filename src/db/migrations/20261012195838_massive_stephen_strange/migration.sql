CREATE TABLE `attendees_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`descriptionSv` text NOT NULL,
	`descriptionEn` text NOT NULL,
	`industry` text NOT NULL,
	`tags` text NOT NULL,
	`contact` text NOT NULL,
	`linkedin` text NOT NULL
);
