UI = {}

local uiState = {
    visible = false,
    hud = false,
    pressure = 0,
    maxPressure = Config.SCBA.MaxPressure,
    lowAirState = 'none',
    maskOn = false,
    passAlarm = false
}

local function toStatusAndWarn()
    if uiState.lowAirState == 'empty' then
        return 'EMPTY', 'OUT OF AIR'
    end

    if uiState.lowAirState == 'verylow' then
        return 'VERY LOW', 'VERY LOW AIR'
    end

    if uiState.lowAirState == 'low' then
        return 'LOW AIR', 'LOW AIR'
    end

    return 'READY', ''
end

function UI:SetVisible(state)
    local visible = state == true
    if uiState.visible == visible then
        return
    end

    uiState.visible = visible
    SendNUIMessage({ type = 'scba:visibility', visible = uiState.visible, hud = uiState.hud })
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

    local status, warn = toStatusAndWarn()
    SendNUIMessage({
        type = 'scba:update',
        hud = uiState.hud,
        maskOn = uiState.maskOn,
        pressure = uiState.pressure,
        maxPressure = uiState.maxPressure,
        unit = Config.UsePercent and '%' or 'PSI',
        status = status,
        warn = warn
    })
end

function UI:Reset()
    uiState.visible = false
    uiState.hud = false
    uiState.pressure = 0
    uiState.maxPressure = Config.SCBA.MaxPressure
    uiState.lowAirState = 'none'
    uiState.maskOn = false
    uiState.passAlarm = false

    SendNUIMessage({ type = 'scba:hardHide' })
    SendNUIMessage({ type = 'scba:visibility', visible = false, hud = false })
    SendNUIMessage({
        type = 'scba:update',
        hud = false,
        maskOn = false,
        pressure = 0,
        maxPressure = Config.SCBA.MaxPressure,
        unit = '',
        status = '',
        warn = ''
    })
end
