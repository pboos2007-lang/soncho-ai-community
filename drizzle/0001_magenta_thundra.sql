CREATE TABLE `manus_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`userId` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manus_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manus_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manus_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suno_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`youtubeUrl` varchar(500) NOT NULL,
	`comment` text NOT NULL,
	`category` enum('Suno AI','Suno Studio') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suno_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `nickname` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `verificationToken` varchar(255);