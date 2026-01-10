local ESX = exports['es_extended']:getSharedObject()
local resourceName = GetCurrentResourceName()
local resourcePath = GetResourcePath(resourceName)
local DB = assert(loadfile(('%s/server/sv_db.lua'):format(resourcePath)))()

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

    return {
        title = title,
        message = message,
        severity = severity
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
        created_at = os.time() * 1000,
        author_identifier = xPlayer.getIdentifier()
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
        created_at = alertPayload.created_at,
        author_identifier = alertPayload.author_identifier
    }

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

RegisterNetEvent('sal_public_alerts:fetchHistory', function()
    local src = source
    local alerts = DB.FetchHistory(Config.HistoryLimit)
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
        created_at = os.time() * 1000,
        author_identifier = xPlayer.getIdentifier()
    }

    TriggerClientEvent('sal_public_alerts:newAlert', src, alert)
end, false)
