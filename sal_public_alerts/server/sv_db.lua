local DB = {}

function DB.CreateAlert(payload)
    local insertId = MySQL.insert.await([[INSERT INTO sal_alerts (title, message, category, severity, created_at, created_by_identifier, created_by_name, expires_at, meta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)]],
        {
            payload.title,
            payload.message,
            payload.category,
            payload.severity,
            payload.created_at,
            payload.created_by_identifier,
            payload.created_by_name,
            payload.expires_at,
            payload.meta
        }
    )

    return insertId
end

function DB.FetchAlerts(limit, offset)
    return MySQL.query.await([[SELECT id, title, message, category, severity, created_at, created_by_name, expires_at, meta
        FROM sal_alerts
        WHERE (expires_at IS NULL OR expires_at >= ?)
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?]],
        { os.time() * 1000, limit, offset }
    )
end

function DB.FetchAlertById(alertId)
    local rows = MySQL.query.await([[SELECT id, title, message, category, severity, created_at, created_by_name, expires_at, meta
        FROM sal_alerts WHERE id = ? LIMIT 1]], { alertId })
    return rows and rows[1] or nil
end

function DB.FetchUndeliveredAlerts(identifier)
    return MySQL.query.await([[SELECT a.id, a.title, a.message, a.category, a.severity, a.created_at, a.created_by_name, a.expires_at, a.meta
        FROM sal_alerts a
        LEFT JOIN sal_alert_receipts r ON r.alert_id = a.id AND r.identifier = ?
        WHERE r.alert_id IS NULL AND (a.expires_at IS NULL OR a.expires_at >= ?)
        ORDER BY a.created_at DESC]],
        { identifier, os.time() * 1000 }
    )
end

function DB.InsertReceipt(alertId, identifier, deliveredAt)
    MySQL.insert.await([[INSERT INTO sal_alert_receipts (alert_id, identifier, delivered_at)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE delivered_at = VALUES(delivered_at)]],
        { alertId, identifier, deliveredAt }
    )
end

function DB.MarkSeen(alertId, identifier, seenAt)
    MySQL.update.await([[UPDATE sal_alert_receipts
        SET seen_at = ?
        WHERE alert_id = ? AND identifier = ?]],
        { seenAt, alertId, identifier }
    )
end

return DB
