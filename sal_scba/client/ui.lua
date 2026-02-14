UI = {}

local uiState = {
    visible = false,
    hud = false,
    pressure = -1,
    maxPressure = Config.SCBA.MaxPressure,
    lowAirState = 'none',
    maskOn = false,
    passAlarm = false
}

function UI:SetVisible(state)
    local visible = state == true
    if uiState.visible == visible then
        return
    end

    uiState.visible = visible
    SendNUIMessage({ type = 'scba:setVisible', visible = visible })
end

function UI:Push(data)
    local changed = false

    for k, v in pairs(data) do
        if uiState[k] ~= v then
            uiState[k] = v
            changed = true
        end
    end

    if not changed then
        return
    end

    SendNUIMessage({ type = 'scba:update', payload = uiState })

    if data.maskOn ~= nil then
        SendNUIMessage({ type = 'scba:setMask', on = data.maskOn == true })
    end
end

function UI:Reset()
    uiState.visible = false
    uiState.hud = false
    uiState.pressure = -1
    uiState.lowAirState = 'none'
    uiState.maskOn = false
    uiState.passAlarm = false

    SendNUIMessage({ type = 'scba:setVisible', visible = false })
    SendNUIMessage({ type = 'scba:setMask', on = false })
    SendNUIMessage({ type = 'scba:reset' })
end
