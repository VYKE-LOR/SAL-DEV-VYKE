local ESX = exports['es_extended']:getSharedObject()

local playerLoaded = false
local phoneReady = false

local function sendPhoneNotification(alert)
    local notification = {
        app = Config.App.Identifier,
        title = Config.App.Label,
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

local function playSoundOnce()
    if Config.Sound.system == 'native' and exports['lb-nativeaudio'] and exports['lb-nativeaudio'].PlaySound then
        exports['lb-nativeaudio']:PlaySound(Config.Sound.name, Config.Sound.volume)
        return
    end

    if Config.Sound.system == 'xsound' and exports['xsound'] then
        local url = Config.Sound.url ~= '' and Config.Sound.url or Config.Sound.name
        exports['xsound']:PlayUrl('sal_public_alerts', url, Config.Sound.volume)
        exports['xsound']:Distance('sal_public_alerts', 1)
        return
    end

    exports['sal_public_alerts']:SendAppMessage({
        type = 'sal_public_alerts',
        action = 'playSound',
        name = Config.Sound.name,
        url = Config.Sound.url,
        volume = Config.Sound.volume,
        duration = Config.Sound.durationMs
    })
end

local function playAlertSound()
    playSoundOnce()

    if Config.Sound.repeatSound.enabled then
        for i = 1, Config.Sound.repeatSound.times do
            SetTimeout(Config.Sound.durationMs + (Config.Sound.repeatSound.intervalMs * i), function()
                playSoundOnce()
            end)
        end
    end
end

local function handleIncomingAlert(alert)
    sendPhoneNotification(alert)
    playAlertSound()

    exports['sal_public_alerts']:SendAppMessage({
        type = 'sal_public_alerts',
        action = 'incoming',
        alert = alert
    })
end

local function checkReady()
    if playerLoaded and phoneReady then
        TriggerServerEvent('sal_public_alerts:clientReady')
    end
end

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

    TriggerServerEvent('sal_public_alerts:requestCanSend')
    checkReady()
end)

RegisterNetEvent('sal_public_alerts:incomingAlert', function(alert)
    handleIncomingAlert(alert)
end)

RegisterNetEvent('sal_public_alerts:offlineAlerts', function(alerts)
    for _, alert in ipairs(alerts or {}) do
        handleIncomingAlert(alert)
    end
end)
