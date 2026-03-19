CREATE TABLE `arbitrage_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_id` text NOT NULL,
	`jp_price_cents` integer NOT NULL,
	`en_price_cents` integer NOT NULL,
	`jp_currency` text DEFAULT 'JPY' NOT NULL,
	`en_currency` text DEFAULT 'USD' NOT NULL,
	`spread_percent` real NOT NULL,
	`jp_marketplace` text NOT NULL,
	`en_marketplace` text NOT NULL,
	`detected_at` text NOT NULL,
	`expires_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`set_id` text NOT NULL,
	`number_in_set` text NOT NULL,
	`name_ja` text NOT NULL,
	`name_en` text,
	`subtype_ja` text,
	`subtype_en` text,
	`rarity` text,
	`type_ja` text,
	`type_en` text,
	`hp` integer,
	`image_url_ja` text,
	`image_url_en` text,
	`artist` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`set_id`) REFERENCES `sets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cards_set_number_idx` ON `cards` (`set_id`,`number_in_set`);--> statement-breakpoint
CREATE TABLE `news_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_url` text NOT NULL,
	`source_name` text NOT NULL,
	`title_ja` text NOT NULL,
	`title_en` text,
	`body_ja` text NOT NULL,
	`body_en` text,
	`thumbnail_url` text,
	`published_at` text NOT NULL,
	`translated_at` text,
	`translation_model` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_articles_source_url_unique` ON `news_articles` (`source_url`);--> statement-breakpoint
CREATE TABLE `price_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_id` text NOT NULL,
	`marketplace` text NOT NULL,
	`region` text NOT NULL,
	`currency` text NOT NULL,
	`avg_price_cents` integer,
	`min_price_cents` integer,
	`max_price_cents` integer,
	`median_price_cents` integer,
	`sample_count` integer DEFAULT 0 NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `price_stats_card_market_period_idx` ON `price_stats` (`card_id`,`marketplace`,`region`,`period_start`);--> statement-breakpoint
CREATE TABLE `prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_id` text NOT NULL,
	`marketplace` text NOT NULL,
	`region` text NOT NULL,
	`price_cents` integer NOT NULL,
	`currency` text NOT NULL,
	`condition` text,
	`listing_url` text,
	`scraped_at` text NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sets` (
	`id` text PRIMARY KEY NOT NULL,
	`name_ja` text NOT NULL,
	`name_en` text,
	`code_ja` text NOT NULL,
	`code_en` text,
	`series_ja` text NOT NULL,
	`series_en` text,
	`total_cards` integer,
	`release_date_ja` text,
	`release_date_en` text,
	`image_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sets_code_ja_idx` ON `sets` (`code_ja`);