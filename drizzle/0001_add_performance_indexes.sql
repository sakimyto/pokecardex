CREATE INDEX IF NOT EXISTS `idx_cards_name_ja` ON `cards` (`name_ja`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_cards_name_en` ON `cards` (`name_en`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_cards_type_en` ON `cards` (`type_en`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_cards_rarity` ON `cards` (`rarity`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_cards_set_id` ON `cards` (`set_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_prices_card_id` ON `prices` (`card_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_prices_scraped_at` ON `prices` (`card_id`, `scraped_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_price_stats_card_id` ON `price_stats` (`card_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_arbitrage_active` ON `arbitrage_alerts` (`is_active`, `spread_percent`);
