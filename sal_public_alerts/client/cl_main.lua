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

    if GetResourceState('lb-phone') ~= 'started' then
        return
    end

    Wait(500)

    local ok, result = pcall(function()
        return exports['lb-phone']:AddCustomApp({
            identifier = Config.App.Identifier,
            name = Config.App.Label,
            description = Config.App.Description,
            defaultApp = true,
            ui = 'ui/index.html',
            icon = Config.App.Icon,
            fixBlur = Config.App.FixBlur
        })
    end)

    if not ok then
        debugLog(('AddCustomApp failed: %s'):format(result))
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
    local notification = {
        app = Config.App.Identifier,
        title = 'Emergency Alert',
        message = alert.title,
        icon = Config.App.Icon,
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
    if Config.Sound.UseXSound and exports['xsound'] then
        exports['xsound']:PlayUrl('sal_public_alerts', buildSoundUrl(), Config.Sound.Volume)
        exports['xsound']:Distance('sal_public_alerts', 1)
        return
    end

    PlaySoundFrontend(-1, 'Beep_Red', 'DLC_HEIST_HACKING_SNAKE_SOUNDS', true)
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

CreateThread(function()
    while GetResourceState('lb-phone') ~= 'started' do
        Wait(250)
    end

    registerApp()
end)

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

    registerApp()
    TriggerServerEvent('sal_public_alerts:requestCanSend')
    checkReady()
end)

RegisterNUICallback('fetchHistory', function(_, cb)
    TriggerServerEvent('sal_public_alerts:fetchHistory')
    cb({ ok = true })
end)

RegisterNUICallback('sendAlert', function(data, cb)
    TriggerServerEvent('sal_public_alerts:sendAlert', data)
    cb({ ok = true })
end)

RegisterNetEvent('sal_public_alerts:historyData', function(alerts)
    sendAppMessage({ event = 'alert:history', data = alerts or {} })
end)

RegisterNetEvent('sal_public_alerts:sendResult', function(success, reason)
    sendAppMessage({ event = 'alert:sendResult', data = { success = success, reason = reason } })
end)

RegisterNetEvent('sal_public_alerts:canSend', function(canSend)
    sendAppMessage({ event = 'alert:permissions', data = { canSend = canSend } })
end)

RegisterNetEvent('sal_public_alerts:newAlert', function(alert)
    handleIncomingAlert(alert)
end)
