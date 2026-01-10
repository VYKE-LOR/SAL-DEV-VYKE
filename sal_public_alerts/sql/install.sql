CREATE TABLE IF NOT EXISTS `sal_alerts` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(60) NOT NULL,
    `message` VARCHAR(600) NOT NULL,
    `category` VARCHAR(32) NOT NULL,
    `severity` TINYINT NOT NULL DEFAULT 5,
    `created_at` BIGINT NOT NULL,
    `created_by_identifier` VARCHAR(64) NOT NULL,
    `created_by_name` VARCHAR(64) NOT NULL,
    `expires_at` BIGINT NULL,
    `meta` JSON NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_sal_alerts_created_at` (`created_at`),
    INDEX `idx_sal_alerts_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sal_alert_receipts` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `alert_id` INT NOT NULL,
    `identifier` VARCHAR(64) NOT NULL,
    `delivered_at` BIGINT NULL,
    `seen_at` BIGINT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_alert_identifier` (`alert_id`, `identifier`),
    INDEX `idx_receipts_identifier` (`identifier`),
    INDEX `idx_receipts_delivered` (`delivered_at`),
    CONSTRAINT `fk_receipts_alerts` FOREIGN KEY (`alert_id`) REFERENCES `sal_alerts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
