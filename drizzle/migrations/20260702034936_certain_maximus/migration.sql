CREATE TABLE `delta_force_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`studentId` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`role` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`linkedin` text NOT NULL
);
