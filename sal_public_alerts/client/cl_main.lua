local ESX = exports['es_extended']:getSharedObject()

local appRegistered = false
local phoneReady = false
local playerLoaded = false

local function debugLog(message)
    if Config.Logging.Debug then
        print(('[sal_public_alerts][debug] %s'):format(message))
    end
end

local function registerApp()
    if appRegistered then
        return
    end

    local success, err = exports['lb-phone']:AddCustomApp({
        identifier = Config.App.Identifier,
        name = Config.App.Label,
        description = Config.App.Description,
        defaultApp = true,
        ui = ('%s/ui/index.html'):format(GetCurrentResourceName()),
        icon = Config.App.Icon,
        fixBlur = Config.App.FixBlur
    })

    if success == false then
        print(('[sal_public_alerts] AddCustomApp failed: %s'):format(err or 'unknown'))
        return
    end

    appRegistered = true
    debugLog('Custom app registered.')
end

local function sendAppMessage(payload)
    if not appRegistered then
        return
    end

    exports['lb-phone']:SendCustomAppMessage(Config.App.Identifier, payload)
end

local function sendPhoneNotification(alert)
    local preview = alert.message or ''
    if #preview > 140 then
        preview = preview:sub(1, 140) .. '...'
    end
    local notification = {
        app = Config.App.Identifier,
        title = 'DESPS CRITICAL ALERT',
        message = preview ~= '' and preview or alert.title,
        icon = Config.App.Icon,
        duration = 15000,
        type = 'critical',
        sound = false
    }

    if exports['lb-phone'] and exports['lb-phone'].Notify then
        exports['lb-phone']:Notify(notification)
    elseif exports['lb-phone'] and exports['lb-phone'].notify then
        exports['lb-phone']:notify(notification)
    else
        TriggerEvent('lb-phone:notify', notification)
    end
end

local function buildSoundUrl()
    return ('https://cfx-nui-%s/%s'):format(GetCurrentResourceName(), Config.Sound.File)
end

local function playAlertSound()
    if Config.Sound.UseNativeAudio and exports['lb-nativeaudio'] and exports['lb-nativeaudio'].PlaySound then
        exports['lb-nativeaudio']:PlaySound(Config.Sound.NativeAudioName, Config.Sound.Volume)
        SetTimeout(1500, function()
            exports['lb-nativeaudio']:PlaySound(Config.Sound.NativeAudioName, Config.Sound.Volume)
        end)
        return
    end

    if Config.Sound.UseXSound and exports['xsound'] then
        exports['xsound']:PlayUrl('sal_public_alerts', buildSoundUrl(), Config.Sound.Volume)
        exports['xsound']:Distance('sal_public_alerts', 1)
        SetTimeout(1500, function()
            exports['xsound']:PlayUrl('sal_public_alerts_repeat', buildSoundUrl(), Config.Sound.Volume)
            exports['xsound']:Distance('sal_public_alerts_repeat', 1)
        end)
        return
    end

    PlaySoundFrontend(-1, 'Beep_Red', 'DLC_HEIST_HACKING_SNAKE_SOUNDS', true)
    SetTimeout(1500, function()
        PlaySoundFrontend(-1, 'Beep_Red', 'DLC_HEIST_HACKING_SNAKE_SOUNDS', true)
    end)
    sendAppMessage({ event = 'sound:play', data = { url = buildSoundUrl(), volume = Config.Sound.Volume } })
end

local function handleIncomingAlert(alert)
    sendPhoneNotification(alert)
    playAlertSound()

    sendAppMessage({ event = 'alert:new', data = alert })
end

local function checkReady()
    if playerLoaded and phoneReady then
        TriggerServerEvent('sal_public_alerts:clientReady')
    end
end

local function tryRegisterApp()
    if appRegistered then
        return
    end

    if GetResourceState('lb-phone') ~= 'started' then
        SetTimeout(500, tryRegisterApp)
        return
    end

    SetTimeout(500, registerApp)
end

RegisterNetEvent('sal_public_alerts:playerLoaded', function()
    playerLoaded = true
    checkReady()
end)

RegisterNetEvent('esx:playerLoaded', function()
    playerLoaded = true
    checkReady()
end)

RegisterNetEvent('lb-phone:ready', function()
    phoneReady = true
    checkReady()
end)

RegisterNetEvent('lb-phone:phoneReady', function()
    phoneReady = true
    checkReady()
end)

AddEventHandler('onClientResourceStart', function(resource)
    if resource ~= GetCurrentResourceName() then
        return
    end

    if ESX.IsPlayerLoaded and ESX.IsPlayerLoaded() then
        playerLoaded = true
    end

    tryRegisterApp()
    TriggerServerEvent('sal_public_alerts:requestCanSend')
    checkReady()
end)

AddEventHandler('onClientResourceStart', function(resource)
    if resource ~= 'lb-phone' then
        return
    end

    tryRegisterApp()
end)

RegisterNUICallback('fetchHistory', function(data, cb)
    local ok, err = pcall(function()
        TriggerServerEvent('sal_public_alerts:fetchHistory', data.limit, data.offset)
    end)
    if not ok then
        cb({ ok = false, error = err or 'Internal error', alerts = {} })
        return
    end
    cb({ ok = true, alerts = {} })
end)

RegisterNUICallback('sendAlert', function(data, cb)
    if not data or not data.scenarioId then
        cb({ ok = false, error = 'validation' })
        return
    end
    local ok, err = pcall(function()
        TriggerServerEvent('sal_public_alerts:sendAlert', data)
    end)
    if not ok then
        cb({ ok = false, error = err or 'Internal error' })
        return
    end
    cb({ ok = true })
end)

RegisterNetEvent('sal_public_alerts:historyData', function(alerts)
    sendAppMessage({ event = 'alert:history', data = alerts or {} })
end)

RegisterNetEvent('sal_public_alerts:sendResult', function(success, reason)
    sendAppMessage({ event = 'alert:sendResult', data = { success = success, reason = reason } })
end)

RegisterNetEvent('sal_public_alerts:canSend', function(canSend)
    if type(canSend) == 'table' then
        sendAppMessage({ event = 'alert:permissions', data = { canSend = canSend.canSend } })
        sendAppMessage({ event = 'alert:scenarios', data = canSend.scenarios or {} })
        sendAppMessage({ event = 'alert:areas', data = canSend.areas or {} })
        return
    end

    sendAppMessage({ event = 'alert:permissions', data = { canSend = canSend } })
end)

RegisterNUICallback('getPermissions', function(_, cb)
    TriggerServerEvent('sal_public_alerts:requestCanSend')
    cb({ ok = true })
end)

RegisterNetEvent('sal_public_alerts:sendAck', function(ok, msg)
    sendAppMessage({ event = 'alert:sendAck', data = { ok = ok, msg = msg } })
end)

RegisterNetEvent('sal_public_alerts:newAlert', function(alert)
    handleIncomingAlert(alert)
end)

RegisterNetEvent('sal_public_alerts:startSirens', function(payload)
    if not payload or not Config.Sirens or not Config.Sirens.enabled then
        return
    end

    if not Config.Sirens.useXSound or GetResourceState('xsound') ~= 'started' or not exports['xsound'] then
        if Config.Logging.Debug then
            print('[sal_public_alerts] xSound not available for sirens.')
        end
        return
    end

    local soundUrl = ('https://cfx-nui-%s/%s'):format(GetCurrentResourceName(), payload.soundFile or Config.Sirens.soundFile)
    local names = {}
    for _, siren in ipairs(payload.sirens or {}) do
        local name = ('sal_siren_%s_%s'):format(payload.alertId or 'alert', siren.id or math.random(1000, 9999))
        names[#names + 1] = name
        exports['xsound']:PlayUrlPos(name, soundUrl, payload.volume or Config.Sirens.volume, siren.coords)
        exports['xsound']:Distance(name, siren.maxDistance or payload.maxDistance or Config.Sirens.defaultMaxDistance)
    end

    if payload.durationSeconds and payload.durationSeconds > 0 then
        SetTimeout(payload.durationSeconds * 1000, function()
            for _, name in ipairs(names) do
                if exports['xsound'] and exports['xsound'].Destroy then
                    exports['xsound']:Destroy(name)
                elseif exports['xsound'] and exports['xsound'].Stop then
                    exports['xsound']:Stop(name)
                end
            end
        end)
    end
end)
