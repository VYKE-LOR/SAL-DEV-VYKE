local ESX = exports['es_extended']:getSharedObject()
local DB = PublicAlertsDB
if not DB then
    error('PublicAlertsDB not loaded. Ensure server/sv_db.lua loads before sv_main.lua.')
end

local senderRate = {}
local lastGlobalSend = 0

local function debugLog(message)
    if Config.Logging.Debug then
        print(('[sal_public_alerts][debug] %s'):format(message))
    end
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
        if job and job.name == entry.job and job.grade >= entry.grade then
            return true
        end
    end

    return false
end

local function sanitizeAlert(data)
    local title = (data.title or ''):gsub('[\r\n]+', ' '):sub(1, Config.Alert.TitleMax)
    local message = (data.message or ''):sub(1, Config.Alert.MessageMax)
    local severity = tostring(data.severity or Config.Alert.DefaultSeverity)
    local category = tostring(data.category or Config.Alert.DefaultCategory)

    if title == '' or message == '' then
        return nil, 'validation'
    end

    local allowed = false
    for _, entry in ipairs(Config.Alert.SeverityOptions) do
        if entry == severity then
            allowed = true
            break
        end
    end
    if not allowed then
        severity = Config.Alert.DefaultSeverity
    end

    local categoryAllowed = false
    for _, entry in ipairs(Config.Alert.Categories) do
        if entry == category then
            categoryAllowed = true
            break
        end
    end
    if not categoryAllowed then
        category = Config.Alert.DefaultCategory
    end

    return {
        title = title,
        message = message,
        severity = severity,
        category = category
    }
end

local function checkRateLimit(source)
    local now = os.time()
    local sender = senderRate[source] or { times = {} }

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
    return {
        title = alert.title,
        message = alert.message,
        severity = alert.severity,
        category = alert.category,
        created_at = os.time() * 1000,
        created_by = xPlayer.getIdentifier()
    }
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

    local alert = {
        id = alertId,
        title = alertPayload.title,
        message = alertPayload.message,
        severity = alertPayload.severity,
        category = alertPayload.category,
        created_at = alertPayload.created_at,
        created_by = alertPayload.created_by
    }

    local notifyPayload = {
        app = Config.App.Identifier,
        title = 'Emergency Alert',
        message = alert.title,
        icon = Config.App.Icon
    }

    if exports['lb-phone'] and exports['lb-phone'].NotifyEveryone then
        local ok, success, err = pcall(function()
            return exports['lb-phone']:NotifyEveryone('all', notifyPayload)
        end)
        if not ok then
            logMessage(('NotifyEveryone failed: %s'):format(success))
        elseif success == false then
            logMessage(('NotifyEveryone error: %s'):format(err or 'unknown'))
        end
    else
        logMessage('NotifyEveryone export not available on lb-phone.')
    end

    TriggerClientEvent('sal_public_alerts:newAlert', -1, alert)

    local players = ESX.GetExtendedPlayers()
    for _, player in ipairs(players) do
        DB.SetLastSeen(player.getIdentifier(), alertId)
    end

    logMessage(('Alert %s sent by %s'):format(alertId, xPlayer.getName()))

    return true, alert
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

RegisterNetEvent('sal_public_alerts:fetchHistory', function(limit, offset)
    local src = source
    local safeLimit = math.min(tonumber(limit) or Config.HistoryLimit, Config.HistoryLimit)
    local safeOffset = math.max(tonumber(offset) or 0, 0)
    local alerts = DB.FetchFeed(safeLimit, safeOffset)
    TriggerClientEvent('sal_public_alerts:historyData', src, alerts)
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

    local lastSeen = DB.GetLastSeen(identifier)
    local missed = DB.FetchAlertsAfter(lastSeen)
    if not missed or #missed == 0 then
        return
    end

    local maxId = lastSeen
    for _, alert in ipairs(missed) do
        TriggerClientEvent('sal_public_alerts:newAlert', source, alert)
        if alert.id > maxId then
            maxId = alert.id
        end
    end

    DB.SetLastSeen(identifier, maxId)
    debugLog(('Replayed %s alerts for %s'):format(#missed, identifier))
end)

AddEventHandler('esx:playerLoaded', function(playerId)
    if playerId then
        TriggerClientEvent('sal_public_alerts:playerLoaded', playerId)
    end
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

    local alert = {
        id = 0,
        title = 'Test Alarm',
        message = 'Dies ist ein Testalarm.',
        severity = Config.Alert.DefaultSeverity,
        category = Config.Alert.DefaultCategory,
        created_at = os.time() * 1000,
        created_by = xPlayer.getIdentifier()
    }

    TriggerClientEvent('sal_public_alerts:newAlert', src, alert)
end, false)
