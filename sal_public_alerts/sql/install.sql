CREATE TABLE IF NOT EXISTS `sal_alerts` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(60) NOT NULL,
    `message` VARCHAR(600) NOT NULL,
    `severity` VARCHAR(16) NOT NULL DEFAULT 'critical',
    `created_at` BIGINT NOT NULL,
    `author_identifier` VARCHAR(64) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_sal_alerts_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sal_alert_user_state` (
    `identifier` VARCHAR(64) NOT NULL,
    `last_seen_alert_id` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
