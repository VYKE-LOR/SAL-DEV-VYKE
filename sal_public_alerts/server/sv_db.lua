PublicAlertsDB = PublicAlertsDB or {}

local function safeQuery(sql, params)
    if type(sql) ~= 'string' or sql == '' then
        print(('[sal_public_alerts][DB] invalid sql: %s'):format(tostring(sql)))
        return nil, 'invalid_sql'
    end
    params = params or {}
    return MySQL.query.await(sql, params)
end

local function safeInsert(sql, params)
    if type(sql) ~= 'string' or sql == '' then
        print(('[sal_public_alerts][DB] invalid sql: %s'):format(tostring(sql)))
        return nil, 'invalid_sql'
    end
    params = params or {}
    return MySQL.insert.await(sql, params)
end

function PublicAlertsDB.CreateAlert(payload)
    local id, err = safeInsert([[INSERT INTO sal_alerts (title, message, severity, category, created_at, created_by)
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
    if not id then
        print(('[sal_public_alerts][DB] CreateAlert failed: %s'):format(tostring(err)))
        return nil
    end
    return id
end

function PublicAlertsDB.FetchFeed(limit, offset)
    local rows = safeQuery([[SELECT id, title, message, severity, category, created_at, created_by
        FROM sal_alerts
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?]],
        { limit or 0, offset or 0 }
    )
    return rows or {}
end

function PublicAlertsDB.FetchAlertsAfter(lastSeenId)
    local rows = safeQuery([[SELECT id, title, message, severity, category, created_at, created_by
        FROM sal_alerts
        WHERE id > ?
        ORDER BY id ASC]],
        { lastSeenId or 0 }
    )
    return rows or {}
end

function PublicAlertsDB.GetLastSeen(identifier)
    local rows = safeQuery([[SELECT last_seen_alert_id FROM sal_alert_user_state WHERE identifier = ? LIMIT 1]], { identifier or '' })
    if rows and rows[1] then
        return rows[1].last_seen_alert_id or 0
    end
    return 0
end

function PublicAlertsDB.SetLastSeen(identifier, alertId)
    local _, err = safeInsert([[INSERT INTO sal_alert_user_state (identifier, last_seen_alert_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE last_seen_alert_id = VALUES(last_seen_alert_id)]],
        { identifier or '', alertId or 0 }
    )
    if err then
        print(('[sal_public_alerts][DB] SetLastSeen failed: %s'):format(tostring(err)))
    end
end
