CREATE TABLE `bookings` (
`id` int AUTO_INCREMENT NOT NULL,
`clientId` int NOT NULL,
`serviceId` int NOT NULL,
`startTime` timestamp NOT NULL,
`endTime` timestamp NOT NULL,
`hasNailDesign` boolean NOT NULL DEFAULT false,
`totalPriceBeyn` decimal(10,2) NOT NULL,
`status` enum('confirmed','cancelled','completed') NOT NULL DEFAULT 'confirmed',
`clientNotes` text,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);

CREATE TABLE `reminders` (
`id` int AUTO_INCREMENT NOT NULL,
`bookingId` int NOT NULL,
`reminderType` enum('24_hours','2_hours') NOT NULL,
`sentAt` timestamp,
`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);

CREATE TABLE `scheduleSettings` (
`id` int AUTO_INCREMENT NOT NULL,
`weekSchedule` json NOT NULL,
`breakStartTime` varchar(5),
`breakEndTime` varchar(5),
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `scheduleSettings_id` PRIMARY KEY(`id`)
);

CREATE TABLE `services` (
`id` int AUTO_INCREMENT NOT NULL,
`name` varchar(255) NOT NULL,
`description` text,
`durationMinutes` int NOT NULL,
`priceBeyn` decimal(10,2) NOT NULL,
`isActive` boolean NOT NULL DEFAULT true,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `services_id` PRIMARY KEY(`id`)
);

CREATE TABLE `telegramUsers` (
`id` int AUTO_INCREMENT NOT NULL,
`userId` int NOT NULL,
`telegramUserId` varchar(64) NOT NULL,
`telegramUsername` varchar(255),
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `telegramUsers_id` PRIMARY KEY(`id`),
CONSTRAINT `telegramUsers_userId_unique` UNIQUE(`userId`),
CONSTRAINT `telegramUsers_telegramUserId_unique` UNIQUE(`telegramUserId`)
);

ALTER TABLE `users` ADD `phone` varchar(20);
