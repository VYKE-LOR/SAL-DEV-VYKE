local ESX = exports['es_extended']:getSharedObject()
local DB = require 'server.sv_db'

local senderRate = {}
local lastGlobalSend = 0

local function getLocale()
    return Locales[Config.Locale] or {}
end

local function logMessage(message)
    if not Config.Logging.Enabled then
        return
    end

    print(('[sal_public_alerts] %s'):format(message))

    if Config.Logging.Webhook ~= '' then
        PerformHttpRequest(Config.Logging.Webhook, function() end, 'POST', json.encode({
            username = 'sal_public_alerts',
            content = message
        }), { ['Content-Type'] = 'application/json' })
    end
end

local function isSenderAllowed(xPlayer)
    if IsPlayerAceAllowed(xPlayer.source, Config.AcePermission) then
        return true
    end

    local job = xPlayer.getJob()
    for _, entry in ipairs(Config.Senders) do
        if job and job.name == entry.job and job.grade >= entry.minGrade then
            return true
        end
    end
    return false
end

local function sanitizeAlert(data)
    local title = (data.title or ''):gsub('[\r\n]+', ' '):sub(1, Config.Alert.TitleMax)
    local message = (data.message or ''):sub(1, Config.Alert.MessageMax)
    local category = tostring(data.category or 'critical')
    local severity = tonumber(data.severity) or Config.Alert.DefaultSeverity

    if title == '' or message == '' then
        return nil, 'validation'
    end

    return {
        title = title,
        message = message,
        category = category,
        severity = severity
    }
end

local function checkRateLimit(source)
    local now = os.time()
    local sender = senderRate[source] or { times = {}, last = 0 }
    sender.last = sender.last or 0

    if (now - lastGlobalSend) < Config.RateLimit.GlobalCooldownSeconds then
        return false, 'global'
    end

    local window = Config.RateLimit.SenderWindowSeconds
    local limit = Config.RateLimit.SenderLimit
    local filtered = {}
    for _, ts in ipairs(sender.times) do
        if (now - ts) < window then
            table.insert(filtered, ts)
        end
    end
    sender.times = filtered

    if #sender.times >= limit then
        senderRate[source] = sender
        return false, 'sender'
    end

    table.insert(sender.times, now)
    senderRate[source] = sender
    lastGlobalSend = now
    return true
end

local function buildAlertPayload(xPlayer, alert)
    local createdAt = os.time() * 1000
    local expiresAt = createdAt + (Config.Alert.DefaultExpiresHours * 3600 * 1000)

    return {
        title = alert.title,
        message = alert.message,
        category = alert.category,
        severity = alert.severity,
        created_at = createdAt,
        created_by_identifier = xPlayer.getIdentifier(),
        created_by_name = xPlayer.getName(),
        expires_at = expiresAt,
        meta = json.encode(alert.meta or {})
    }
end

local function dispatchAlert(alertId, alertPayload)
    local players = ESX.GetExtendedPlayers()
    local nowMs = os.time() * 1000
    for _, xPlayer in ipairs(players) do
        DB.InsertReceipt(alertId, xPlayer.getIdentifier(), nowMs)
        TriggerClientEvent('sal_public_alerts:incomingAlert', xPlayer.source, {
            id = alertId,
            title = alertPayload.title,
            message = alertPayload.message,
            category = alertPayload.category,
            severity = alertPayload.severity,
            created_at = alertPayload.created_at,
            created_by_name = alertPayload.created_by_name,
            expires_at = alertPayload.expires_at,
            meta = alertPayload.meta
        })
    end
end

local function sendAlertFromPlayer(xPlayer, data)
    if not isSenderAllowed(xPlayer) then
        return false, 'permission'
    end

    local sanitized, err = sanitizeAlert(data or {})
    if not sanitized then
        return false, err
    end

    local ok = checkRateLimit(xPlayer.source)
    if not ok then
        return false, 'rate_limit'
    end

    local alertPayload = buildAlertPayload(xPlayer, sanitized)
    local alertId = DB.CreateAlert(alertPayload)
    if not alertId then
        return false, 'db'
    end

    dispatchAlert(alertId, alertPayload)
    logMessage(('Alert %s sent by %s'):format(alertId, alertPayload.created_by_name))

    return true, alertId
end

RegisterNetEvent('sal_public_alerts:requestCanSend', function()
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then
        return
    end

    TriggerClientEvent('sal_public_alerts:canSend', source, isSenderAllowed(xPlayer))
end)

RegisterNetEvent('sal_public_alerts:sendAlert', function(data)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then
        return
    end

    local ok, result = sendAlertFromPlayer(xPlayer, data)
    if not ok then
        TriggerClientEvent('sal_public_alerts:sendResult', source, false, result)
        return
    end

    TriggerClientEvent('sal_public_alerts:sendResult', source, true)
end)

RegisterNetEvent('sal_public_alerts:fetchFeed', function(limit, offset)
    local src = source
    local safeLimit = math.min(tonumber(limit) or 25, 50)
    local safeOffset = math.max(tonumber(offset) or 0, 0)
    local alerts = DB.FetchAlerts(safeLimit, safeOffset)
    TriggerClientEvent('sal_public_alerts:feedData', src, alerts)
end)

RegisterNetEvent('sal_public_alerts:markSeen', function(alertId)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then
        return
    end

    if not alertId then
        return
    end

    DB.MarkSeen(alertId, xPlayer.getIdentifier(), os.time() * 1000)
end)

RegisterNetEvent('sal_public_alerts:clientReady', function()
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then
        return
    end

    local identifier = xPlayer.getIdentifier()
    TriggerClientEvent('sal_public_alerts:canSend', source, isSenderAllowed(xPlayer))

    if not Config.OfflineReplayNotification then
        return
    end

    local undelivered = DB.FetchUndeliveredAlerts(identifier)
    if not undelivered or #undelivered == 0 then
        return
    end

    local nowMs = os.time() * 1000
    for _, alert in ipairs(undelivered) do
        DB.InsertReceipt(alert.id, identifier, nowMs)
    end

    TriggerClientEvent('sal_public_alerts:offlineAlerts', source, undelivered)
end)

exports('SendAlert', function(data)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer then
        return false, 'no_player'
    end

    local ok, result = sendAlertFromPlayer(xPlayer, data)
    if not ok then
        return false, result
    end

    logMessage(('Alert %s sent via export by %s'):format(result, xPlayer.getName()))

    return true, result
end)

RegisterCommand('alerttest', function(src)
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then
        return
    end

    if not isSenderAllowed(xPlayer) then
        TriggerClientEvent('sal_public_alerts:sendResult', src, false, 'permission')
        return
    end

    TriggerClientEvent('sal_public_alerts:incomingAlert', src, {
        id = 0,
        title = 'Test Alarm',
        message = 'Dies ist ein Testalarm.',
        category = 'test',
        severity = Config.Alert.DefaultSeverity,
        created_at = os.time() * 1000,
        created_by_name = xPlayer.getName(),
        expires_at = os.time() * 1000 + (Config.Alert.DefaultExpiresHours * 3600 * 1000),
        meta = json.encode({})
    })
end, false)

RegisterCommand('alertsend', function(src, args)
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then
        return
    end

    local title = args[1] or 'Alarm'
    local message = table.concat(args, ' ', 2)
    local ok, result = sendAlertFromPlayer(xPlayer, {
        title = title,
        message = message ~= '' and message or 'Alarm ausgelöst.',
        category = 'critical',
        severity = Config.Alert.DefaultSeverity
    })
    if not ok then
        TriggerClientEvent('sal_public_alerts:sendResult', src, false, result)
    end
end, false)
