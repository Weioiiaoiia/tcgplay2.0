CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` varchar(64) NOT NULL,
	`title` varchar(512) NOT NULL,
	`description` text,
	`severity` enum('high','medium','low') NOT NULL DEFAULT 'medium',
	`matchedKeywords` text,
	`source` varchar(128),
	`sourceUrl` varchar(1024),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`),
	CONSTRAINT `alerts_alertId_unique` UNIQUE(`alertId`)
);
--> statement-breakpoint
CREATE TABLE `engine_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('running','success','error') NOT NULL DEFAULT 'running',
	`sourcesProcessed` int DEFAULT 0,
	`insightsCreated` int DEFAULT 0,
	`alertsCreated` int DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`finishedAt` timestamp,
	CONSTRAINT `engine_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`insightId` varchar(64) NOT NULL,
	`title` varchar(512) NOT NULL,
	`summary` text NOT NULL,
	`source` varchar(128) NOT NULL,
	`sourceUrl` varchar(1024),
	`originalTitle` varchar(512),
	`scrapeMethod` varchar(32) DEFAULT 'rss',
	`section` enum('tcg','web3','collector') NOT NULL,
	`category` enum('official','community','tournament','cross_lang','alert') NOT NULL DEFAULT 'community',
	`game` enum('pokemon','onepiece','general') NOT NULL DEFAULT 'general',
	`disclaimer` text,
	`isNew` int DEFAULT 1,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insights_id` PRIMARY KEY(`id`),
	CONSTRAINT `insights_insightId_unique` UNIQUE(`insightId`)
);
--> statement-breakpoint
CREATE TABLE `meta_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`game` enum('pokemon','onepiece') NOT NULL,
	`cardName` varchar(128) NOT NULL,
	`appearances` int NOT NULL DEFAULT 0,
	`winRate` int NOT NULL DEFAULT 0,
	`trend` enum('up','down','stable') NOT NULL DEFAULT 'stable',
	`notes` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meta_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processed_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentHash` varchar(64) NOT NULL,
	`sourceUrl` varchar(1024),
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `processed_messages_id` PRIMARY KEY(`id`),
	CONSTRAINT `processed_messages_contentHash_unique` UNIQUE(`contentHash`)
);
--> statement-breakpoint
CREATE TABLE `roi_predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`game` enum('pokemon','onepiece') NOT NULL,
	`cardName` varchar(128) NOT NULL,
	`rating` enum('S','A','B','C') NOT NULL,
	`confidence` int NOT NULL DEFAULT 50,
	`rationale` varchar(280),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roi_predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scrape_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`sourceType` enum('rss','html') NOT NULL DEFAULT 'rss',
	`section` enum('tcg','web3','collector') NOT NULL,
	`category` enum('official','community','tournament') NOT NULL DEFAULT 'community',
	`game` enum('pokemon','onepiece','general') NOT NULL DEFAULT 'general',
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scrape_sources_id` PRIMARY KEY(`id`)
);
