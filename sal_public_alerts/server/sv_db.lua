local DB = {}

function DB.CreateAlert(payload)
    return MySQL.insert.await([[INSERT INTO sal_alerts (title, message, severity, created_at, author_identifier)
        VALUES (?, ?, ?, ?, ?)]],
        {
            payload.title,
            payload.message,
            payload.severity,
            payload.created_at,
            payload.author_identifier
        }
    )
end

function DB.FetchHistory(limit)
    return MySQL.query.await([[SELECT id, title, message, severity, created_at, author_identifier
        FROM sal_alerts
        ORDER BY created_at DESC
        LIMIT ?]],
        { limit }
    )
end

function DB.FetchAlertsAfter(lastSeenId)
    return MySQL.query.await([[SELECT id, title, message, severity, created_at, author_identifier
        FROM sal_alerts
        WHERE id > ?
        ORDER BY id ASC]],
        { lastSeenId }
    )
end

function DB.GetLastSeen(identifier)
    local rows = MySQL.query.await([[SELECT last_seen_alert_id FROM sal_alert_user_state WHERE identifier = ? LIMIT 1]], { identifier })
    if rows and rows[1] then
        return rows[1].last_seen_alert_id or 0
    end
    return 0
end

function DB.SetLastSeen(identifier, alertId)
    MySQL.insert.await([[INSERT INTO sal_alert_user_state (identifier, last_seen_alert_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE last_seen_alert_id = VALUES(last_seen_alert_id)]],
        { identifier, alertId }
    )
end

return DB
