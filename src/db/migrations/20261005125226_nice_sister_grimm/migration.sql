PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_delta_force_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`studentId` text NOT NULL UNIQUE,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`role` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`linkedin` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_delta_force_table`(`id`, `studentId`, `firstName`, `lastName`, `role`, `email`, `linkedin`) SELECT `id`, `studentId`, `firstName`, `lastName`, `role`, `email`, `linkedin` FROM `delta_force_table`;--> statement-breakpoint
DROP TABLE `delta_force_table`;--> statement-breakpoint
ALTER TABLE `__new_delta_force_table` RENAME TO `delta_force_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;