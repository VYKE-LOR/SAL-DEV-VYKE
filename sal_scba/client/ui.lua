UI = {}

local uiState = {
    visible = false,
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
    SendNUIMessage({
        action = 'setVisible',
        visible = visible
    })
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

    SendNUIMessage({
        action = 'update',
        payload = uiState
    })
end

function UI:Reset()
    uiState.pressure = -1
    uiState.lowAirState = 'none'
    uiState.maskOn = false
    uiState.passAlarm = false
    self:SetVisible(false)
    SendNUIMessage({ action = 'reset' })
end
