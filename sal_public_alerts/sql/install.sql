CREATE TABLE IF NOT EXISTS `sal_alerts` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(60) NOT NULL,
    `message` VARCHAR(600) NOT NULL,
    `severity` VARCHAR(16) NOT NULL DEFAULT 'critical',
    `category` VARCHAR(32) NOT NULL DEFAULT 'general',
    `created_at` BIGINT NOT NULL,
    `created_by` VARCHAR(64) NOT NULL,
    `expires_at` BIGINT NULL,
    `is_active` TINYINT NOT NULL DEFAULT 1,
    `cleared_at` BIGINT NULL,
    `cleared_by` VARCHAR(64) NULL,
    `alert_type` VARCHAR(16) NOT NULL DEFAULT 'alert',
    `auto_clear` TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_sal_alerts_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sal_alert_user_state` (
    `identifier` VARCHAR(64) NOT NULL,
    `last_seen_alert_id` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
