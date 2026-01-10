local appIdentifier = Config.App.Identifier

local function registerApp()
    local appData = {
        identifier = appIdentifier,
        name = Config.App.Label,
        description = Config.App.Description,
        defaultApp = true,
        ui = 'ui/index.html',
        icon = Config.App.Icon
    }

    if exports['lb-phone'] and exports['lb-phone'].RegisterApp then
        exports['lb-phone']:RegisterApp(appData)
    elseif exports['lb-phone'] and exports['lb-phone'].registerApp then
        exports['lb-phone']:registerApp(appData)
    else
        TriggerEvent('lb-phone:registerApp', appData)
    end
end

local function sendAppMessage(payload)
    if exports['lb-phone'] and exports['lb-phone'].SendCustomAppMessage then
        exports['lb-phone']:SendCustomAppMessage(appIdentifier, payload)
    elseif exports['lb-phone'] and exports['lb-phone'].sendCustomAppMessage then
        exports['lb-phone']:sendCustomAppMessage(appIdentifier, payload)
    else
        SendNUIMessage(payload)
    end
end

exports('SendAppMessage', sendAppMessage)

AddEventHandler('onClientResourceStart', function(resource)
    if resource ~= GetCurrentResourceName() then
        return
    end

    registerApp()
end)

RegisterNUICallback('fetchFeed', function(data, cb)
    TriggerServerEvent('sal_public_alerts:fetchFeed', data.limit, data.offset)
    cb({ ok = true })
end)

RegisterNUICallback('sendAlert', function(data, cb)
    TriggerServerEvent('sal_public_alerts:sendAlert', data)
    cb({ ok = true })
end)

RegisterNUICallback('markSeen', function(data, cb)
    TriggerServerEvent('sal_public_alerts:markSeen', data.id)
    cb({ ok = true })
end)

RegisterNetEvent('sal_public_alerts:feedData', function(alerts)
    sendAppMessage({
        type = 'sal_public_alerts',
        action = 'feed',
        alerts = alerts or {}
    })
end)

RegisterNetEvent('sal_public_alerts:sendResult', function(success, reason)
    sendAppMessage({
        type = 'sal_public_alerts',
        action = 'sendResult',
        success = success,
        reason = reason
    })
end)

RegisterNetEvent('sal_public_alerts:canSend', function(canSend)
    sendAppMessage({
        type = 'sal_public_alerts',
        action = 'permissions',
        canSend = canSend
    })
end)
