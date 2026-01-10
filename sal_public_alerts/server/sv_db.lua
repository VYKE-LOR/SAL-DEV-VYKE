PublicAlertsDB = PublicAlertsDB or {}

function PublicAlertsDB.CreateAlert(payload)
    return MySQL.insert.await([[INSERT INTO sal_alerts (title, message, severity, category, created_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?)]],
        {
            payload.title,
            payload.message,
            payload.severity,
            payload.category,
            payload.created_at,
            payload.created_by
        }
    )
end

function PublicAlertsDB.FetchFeed(limit, offset)
    return MySQL.query.await([[SELECT id, title, message, severity, category, created_at, created_by
        FROM sal_alerts
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?]],
        { limit, offset }
    )
end

function PublicAlertsDB.FetchAlertsAfter(lastSeenId)
    return MySQL.query.await([[SELECT id, title, message, severity, category, created_at, created_by
        FROM sal_alerts
        WHERE id > ?
        ORDER BY id ASC]],
        { lastSeenId }
    )
end

function PublicAlertsDB.GetLastSeen(identifier)
    local rows = MySQL.query.await([[SELECT last_seen_alert_id FROM sal_alert_user_state WHERE identifier = ? LIMIT 1]], { identifier })
    if rows and rows[1] then
        return rows[1].last_seen_alert_id or 0
    end
    return 0
end

function PublicAlertsDB.SetLastSeen(identifier, alertId)
    MySQL.insert.await([[INSERT INTO sal_alert_user_state (identifier, last_seen_alert_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE last_seen_alert_id = VALUES(last_seen_alert_id)]],
        { identifier, alertId }
    )
end
