PublicAlertsDB = PublicAlertsDB or {}

local function safeQuery(name, sql, params)
    if type(sql) ~= 'string' or sql == '' then
        print(('[sal_public_alerts][DB] NIL/EMPTY SQL in %s'):format(tostring(name)))
        return nil, 'invalid_sql'
    end
    params = params or {}
    local ok, res = pcall(function()
        return MySQL.query.await(sql, params)
    end)
    if not ok then
        print(('[sal_public_alerts][DB] ERROR in %s: %s'):format(tostring(name), tostring(res)))
        return nil, 'db_error'
    end
    return res, nil
end

local function safeInsert(name, sql, params)
    if type(sql) ~= 'string' or sql == '' then
        print(('[sal_public_alerts][DB] NIL/EMPTY SQL in %s'):format(tostring(name)))
        return nil, 'invalid_sql'
    end
    params = params or {}
    local ok, res = pcall(function()
        return MySQL.insert.await(sql, params)
    end)
    if not ok then
        print(('[sal_public_alerts][DB] ERROR in %s: %s'):format(tostring(name), tostring(res)))
        return nil, 'db_error'
    end
    return res, nil
end

local function safeUpdate(name, sql, params)
    if type(sql) ~= 'string' or sql == '' then
        print(('[sal_public_alerts][DB] NIL/EMPTY SQL in %s'):format(tostring(name)))
        return nil, 'invalid_sql'
    end
    params = params or {}
    local ok, res = pcall(function()
        return MySQL.update.await(sql, params)
    end)
    if not ok then
        print(('[sal_public_alerts][DB] ERROR in %s: %s'):format(tostring(name), tostring(res)))
        return nil, 'db_error'
    end
    return res, nil
end

local function columnExists(column)
    local rows = safeQuery('CheckColumn', 'SHOW COLUMNS FROM sal_alerts LIKE ?', { column })
    return rows and rows[1] ~= nil
end

function PublicAlertsDB.EnsureSchema()
    local columns = {
        expires_at = 'BIGINT NULL',
        is_active = 'TINYINT NOT NULL DEFAULT 1',
        cleared_at = 'BIGINT NULL',
        cleared_by = 'VARCHAR(64) NULL',
        alert_type = "VARCHAR(16) NOT NULL DEFAULT 'alert'",
        auto_clear = 'TINYINT NOT NULL DEFAULT 0'
    }

    for column, definition in pairs(columns) do
        if not columnExists(column) then
            local _, err = safeUpdate(('AddColumn:%s'):format(column),
                ('ALTER TABLE sal_alerts ADD COLUMN %s %s'):format(column, definition))
            if err then
                print(('[sal_public_alerts][DB] Failed adding column %s: %s'):format(column, tostring(err)))
            end
        end
    end
end

function PublicAlertsDB.CreateAlert(payload)
    local id, err = safeInsert('CreateAlert', [[INSERT INTO sal_alerts (title, message, severity, category, created_at, created_by, expires_at, is_active, cleared_at, cleared_by, alert_type, auto_clear)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)]],
        {
            payload.title,
            payload.message,
            payload.severity,
            payload.category,
            payload.created_at,
            payload.created_by,
            payload.expires_at,
            payload.is_active,
            payload.cleared_at,
            payload.cleared_by,
            payload.alert_type,
            payload.auto_clear
        }
    )
    if not id then
        print(('[sal_public_alerts][DB] CreateAlert failed: %s'):format(tostring(err)))
        return nil
    end
    return id
end

function PublicAlertsDB.FetchFeed(limit, offset, nowMs)
    local rows = safeQuery('FetchFeed', [[SELECT id, title, message, severity, category, created_at, created_by, expires_at, is_active, alert_type
        FROM sal_alerts
        WHERE is_active = 0 OR (expires_at IS NOT NULL AND expires_at <= ?)
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?]],
        { nowMs or 0, limit or 0, offset or 0 }
    )
    return rows or {}
end

function PublicAlertsDB.FetchAlertsAfter(lastSeenId)
    local rows = safeQuery('FetchAlertsAfter', [[SELECT id, title, message, severity, category, created_at, created_by, expires_at, is_active, alert_type
        FROM sal_alerts
        WHERE id > ?
        ORDER BY id ASC]],
        { lastSeenId or 0 }
    )
    return rows or {}
end

function PublicAlertsDB.FetchActive(nowMs, limit)
    local rows = safeQuery('FetchActive', [[SELECT id, title, message, severity, category, created_at, created_by, expires_at, is_active, alert_type
        FROM sal_alerts
        WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > ?)
        ORDER BY created_at DESC
        LIMIT ?]],
        { nowMs or 0, limit or 0 }
    )
    return rows or {}
end

function PublicAlertsDB.FetchActiveForAutoClear(nowMs)
    local rows = safeQuery('FetchActiveForAutoClear', [[SELECT id, expires_at
        FROM sal_alerts
        WHERE is_active = 1 AND auto_clear = 1 AND expires_at IS NOT NULL AND expires_at > ?]],
        { nowMs or 0 }
    )
    return rows or {}
end

function PublicAlertsDB.GetLastSeen(identifier)
    local rows = safeQuery('GetLastSeen', [[SELECT last_seen_alert_id FROM sal_alert_user_state WHERE identifier = ? LIMIT 1]], { identifier or '' })
    if rows and rows[1] then
        return rows[1].last_seen_alert_id or 0
    end
    return 0
end

function PublicAlertsDB.SetLastSeen(identifier, alertId)
    local _, err = safeUpdate('SetLastSeen', [[INSERT INTO sal_alert_user_state (identifier, last_seen_alert_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE last_seen_alert_id = VALUES(last_seen_alert_id)]],
        { identifier or '', alertId or 0 }
    )
    if err then
        print(('[sal_public_alerts][DB] SetLastSeen failed: %s'):format(tostring(err)))
    end
end

function PublicAlertsDB.ClearAlert(alertId, clearedAt, clearedBy)
    local res, err = safeUpdate('ClearAlert', [[UPDATE sal_alerts
        SET is_active = 0, cleared_at = ?, cleared_by = ?
        WHERE id = ? AND is_active = 1]],
        { clearedAt or 0, clearedBy or '', alertId or 0 }
    )
    return res, err
end
