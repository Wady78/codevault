CREATE TABLE `codeSnippets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`language` varchar(64) NOT NULL,
	`category` varchar(100) NOT NULL,
	`tags` text NOT NULL,
	`notes` text,
	`code` text NOT NULL,
	`favorite` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `codeSnippets_id` PRIMARY KEY(`id`)
);
