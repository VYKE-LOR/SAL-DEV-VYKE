local ESX = exports['es_extended']:getSharedObject()

local State = {
    scbaEquipped = false,
    maskOn = false,
    pressure = Config.SCBA.MaxPressure,
    lowAirState = 'none',
    passArmed = false,
    passAlarm = false,
    hudEnabled = Config.HUD.Enabled,
    localHazardBoost = 0,
    hazardUntil = 0,
    dead = false
}

local Threads = {
    pressure = nil,
    hazards = nil,
    controls = nil,
    pass = nil
}

local backProp = nil
local lastCoughAt = 0
local nextDamageAt = 0
local submixId = nil

local function notify(msg)
    lib.notify({ description = msg, type = 'inform' })
end

local function setSubmixEnabled(enabled)
    if not Config.AudioMuffle.Enabled then
        return
    end

    if enabled and not submixId then
        submixId = CreateAudioSubmix('sal_scba_muffle')
        if submixId ~= -1 then
            SetAudioSubmixEffectRadioFx(submixId, 0)
            SetAudioSubmixEffectParamInt(submixId, 0, `default`, 1)
            SetAudioSubmixEffectParamFloat(submixId, 0, `freq_low`, 250.0)
            SetAudioSubmixEffectParamFloat(submixId, 0, `freq_hi`, 1800.0)
            AddAudioSubmixOutput(submixId, 0)
        end
    end

    if submixId and submixId ~= -1 then
        SetAudioSubmixOutputVolumes(submixId, 0, enabled and Config.AudioMuffle.FilterStrength or 1.0, enabled and Config.AudioMuffle.FilterStrength or 1.0, enabled and Config.AudioMuffle.FilterStrength or 1.0, enabled and Config.AudioMuffle.FilterStrength or 1.0, enabled and Config.AudioMuffle.FilterStrength or 1.0, enabled and Config.AudioMuffle.FilterStrength or 1.0)
    end
end

local function updateLowAirState()
    local p = State.pressure
    local nextState = 'none'

    if p <= Config.SCBA.EmptyThreshold then
        nextState = 'empty'
    elseif p <= Config.SCBA.VeryLowThreshold then
        nextState = 'verylow'
    elseif p <= Config.SCBA.LowThreshold then
        nextState = 'low'
    end

    if nextState == State.lowAirState then
        return
    end

    State.lowAirState = nextState
    if nextState == 'low' then
        Sound:PlayFrontend('LowAir', 0.25)
    elseif nextState == 'verylow' or nextState == 'empty' then
        Sound:PlayFrontend('VeryLowAir', 0.35)
    end

    UI:Push({ lowAirState = State.lowAirState })
end

local function pushHud()
    UI:Push({
        pressure = State.pressure,
        maxPressure = Config.SCBA.MaxPressure,
        lowAirState = State.lowAirState,
        maskOn = State.maskOn,
        passAlarm = State.passAlarm
    })
    UI:SetVisible(State.hudEnabled and State.scbaEquipped)
end

local function clearBackProp()
    if backProp and DoesEntityExist(backProp) then
        DeleteEntity(backProp)
    end
    backProp = nil
end

local function refreshBackProp()
    clearBackProp()

    if not (State.scbaEquipped and Config.Props.EnableBackProp) then
        return
    end

    local ped = PlayerPedId()
    local model = Config.Props.BackPropModel
    RequestModel(model)

    local timeout = GetGameTimer() + 5000
    while not HasModelLoaded(model) and GetGameTimer() < timeout do
        Wait(50)
    end

    if not HasModelLoaded(model) then
        return
    end

    local coords = GetEntityCoords(ped)
    backProp = CreateObject(model, coords.x, coords.y, coords.z, false, false, false)
    SetEntityCollision(backProp, false, false)
    AttachEntityToEntity(backProp, ped, GetPedBoneIndex(ped, Config.Props.BackBone), Config.Props.BackOffset.x, Config.Props.BackOffset.y, Config.Props.BackOffset.z, Config.Props.BackRotation.x, Config.Props.BackRotation.y, Config.Props.BackRotation.z, true, true, false, true, 2, true)
    SetModelAsNoLongerNeeded(model)
end

local function startPressureThread()
    if Threads.pressure then
        return
    end

    Threads.pressure = CreateThread(function()
        while State.scbaEquipped do
            Wait(1000)

            local ped = PlayerPedId()
            State.dead = IsEntityDead(ped)
            if not State.maskOn or State.dead then
                goto continue
            end

            local consumption = Config.SCBA.ConsumptionPerSecond
            if IsPedSprinting(ped) then
                consumption = consumption * Config.SCBA.SprintMultiplier
            elseif IsPedSwimming(ped) then
                consumption = consumption * Config.SCBA.SwimMultiplier
            end

            local newPressure = math.max(0, State.pressure - consumption)
            if math.abs(newPressure - State.pressure) >= 0.01 then
                State.pressure = newPressure
                updateLowAirState()
                pushHud()
                TriggerServerEvent('sal_scba:server:setPressure', newPressure)
            end

            if State.pressure <= 0 and GetGameTimer() > nextDamageAt then
                ApplyDamageToPed(ped, Config.SCBA.OutOfAirDamage, false)
                nextDamageAt = GetGameTimer() + Config.SCBA.OutOfAirDamageIntervalMs
            end

            ::continue::
        end

        Threads.pressure = nil
    end)
end

local function isInHazardZone(coords)
    for i = 1, #Config.Hazards.CustomZones do
        local zone = Config.Hazards.CustomZones[i]
        if zone.type == 'sphere' then
            if #(coords - zone.center) <= zone.radius then
                return zone.level or 1
            end
        end
    end

    return 0
end

local function runHazardEffects(level)
    local now = GetGameTimer()

    if level >= Config.Hazards.Cough.MinLevel and now - lastCoughAt > Config.Hazards.Cough.CooldownMs then
        Sound:PlayFrontend('Cough', 0.2)
        lastCoughAt = now
    end

    if now >= nextDamageAt then
        local dmg = Config.Hazards.Damage.Base + (level * Config.Hazards.Damage.LevelMultiplier)
        if State.maskOn then
            dmg = dmg * (1.0 - Config.Hazards.Damage.MaskReduction)
        end

        if dmg > 0 then
            ApplyDamageToPed(PlayerPedId(), math.floor(dmg), false)
        end

        nextDamageAt = now + Config.Hazards.Damage.IntervalMs
    end
end

local function startHazardThread()
    if Threads.hazards then
        return
    end

    Threads.hazards = CreateThread(function()
        while State.scbaEquipped do
            local interval = Config.Hazards.FireDetection.CheckIntervalMs
            Wait(interval)

            local ped = PlayerPedId()
            if IsEntityDead(ped) then
                goto continue
            end

            local coords = GetEntityCoords(ped)
            local hazardLevel = 0

            if not State.maskOn and Config.Hazards.FireDetection.Enabled then
                local fireCount = GetNumberOfFiresInRange(coords.x, coords.y, coords.z, Config.Hazards.FireDetection.Radius)
                if fireCount > 0 then
                    hazardLevel = math.max(hazardLevel, 1)
                end
            end

            hazardLevel = math.max(hazardLevel, isInHazardZone(coords))

            if State.hazardUntil > GetGameTimer() then
                hazardLevel = math.max(hazardLevel, State.localHazardBoost)
            end

            if hazardLevel > 0 then
                runHazardEffects(hazardLevel)
            end

            ::continue::
        end

        Threads.hazards = nil
    end)
end

local function startPassThread()
    if Threads.pass or not Config.PASS.Enabled then
        return
    end

    Threads.pass = CreateThread(function()
        local idleSince = GetGameTimer()
        while State.scbaEquipped and State.passArmed do
            Wait(1000)

            local ped = PlayerPedId()
            if IsPedInAnyVehicle(ped, false) then
                idleSince = GetGameTimer()
            end

            if GetEntitySpeed(ped) > 0.15 then
                idleSince = GetGameTimer()
                if State.passAlarm then
                    State.passAlarm = false
                    Sound:Stop('PassAlarm')
                    pushHud()
                end
            end

            local idleFor = (GetGameTimer() - idleSince) / 1000
            if idleFor >= Config.PASS.AlarmAfterSeconds and not State.passAlarm then
                State.passAlarm = true
                Sound:PlayFrontend('PassAlarm', 0.4)
                pushHud()
            end
        end

        if State.passAlarm then
            State.passAlarm = false
            Sound:Stop('PassAlarm')
            pushHud()
        end

        Threads.pass = nil
    end)
end

local function getVehicleRefillPoint(vehicle)
    local pedCoords = GetEntityCoords(PlayerPedId())

    for i = 1, #Config.Refill.VehicleBoneCandidates do
        local boneName = Config.Refill.VehicleBoneCandidates[i]
        local boneIndex = GetEntityBoneIndexByName(vehicle, boneName)
        if boneIndex ~= -1 then
            local boneCoords = GetWorldPositionOfEntityBone(vehicle, boneIndex)
            if #(pedCoords - boneCoords) <= Config.Refill.Distance then
                return boneCoords
            end
        end
    end

    for i = 1, #Config.Refill.FallbackOffsets do
        local world = GetOffsetFromEntityInWorldCoords(vehicle, Config.Refill.FallbackOffsets[i].x, Config.Refill.FallbackOffsets[i].y, Config.Refill.FallbackOffsets[i].z)
        if #(pedCoords - world) <= Config.Refill.Distance then
            return world
        end
    end

    return nil
end

local function tryRefill()
    if not State.scbaEquipped then
        return
    end

    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local vehicle = lib.getClosestVehicle(coords, 8.0, false)
    if not vehicle or vehicle == 0 then
        notify(Config.Locales.RefillInvalid)
        return
    end

    local point = getVehicleRefillPoint(vehicle)
    if not point then
        notify(Config.Locales.RefillInvalid)
        return
    end

    local missing = Config.SCBA.MaxPressure - State.pressure
    if missing <= 0.01 then
        return
    end

    local duration = math.floor(missing * Config.Refill.DurationPerUnitMs)

    local ok = lib.progressBar({
        duration = duration,
        label = 'Refilling SCBA...',
        useWhileDead = false,
        canCancel = true,
        disable = { car = true, combat = true, sprint = true, move = true }
    })

    if not ok then
        return
    end

    TriggerServerEvent('sal_scba:server:requestRefill', VehToNet(vehicle))
end

local function setEquipped(state)
    State.scbaEquipped = state
    if not state then
        State.maskOn = false
        State.passArmed = false
        setSubmixEnabled(false)
    end

    refreshBackProp()
    pushHud()

    if state then
        startPressureThread()
        startHazardThread()
        if State.passArmed then
            startPassThread()
        end
    end
end

RegisterNetEvent('sal_scba:client:setState', function(serverState)
    State.scbaEquipped = serverState.scbaEquipped == true
    State.maskOn = serverState.maskOn == true
    State.pressure = tonumber(serverState.pressure) or Config.SCBA.MaxPressure
    State.lowAirState = serverState.lowAirState or 'none'
    State.passArmed = serverState.passArmed == true

    updateLowAirState()
    refreshBackProp()
    setSubmixEnabled(State.maskOn)
    pushHud()

    if State.scbaEquipped then
        startPressureThread()
        startHazardThread()
        if State.passArmed then
            startPassThread()
        end
    end
end)

RegisterNetEvent('sal_scba:client:notify', function(message)
    notify(message)
end)

RegisterNetEvent('sal_scba:client:applyPressure', function(value)
    State.pressure = tonumber(value) or State.pressure
    updateLowAirState()
    pushHud()
end)

RegisterNetEvent('sal_scba:client:refillDone', function(newPressure)
    State.pressure = newPressure
    updateLowAirState()
    pushHud()
    Sound:PlayFrontend('Refill', 0.3)
    notify(Config.Locales.RefillSuccess)
end)

local function handleHotkeys()
    if IsPauseMenuActive() then
        return
    end

    if IsControlJustPressed(0, Config.Keys.ToggleSCBA) then
        TriggerServerEvent('sal_scba:server:toggleEquip')
    end

    if IsControlJustPressed(0, Config.Keys.ToggleMask) and State.scbaEquipped then
        TriggerServerEvent('sal_scba:server:toggleMask')
        Sound:PlayFrontend(State.maskOn and 'MaskOff' or 'MaskOn', 0.3)
    end

    if IsControlJustPressed(0, Config.Keys.Refill) then
        tryRefill()
    end

    if Config.Keys.ToggleHUD and IsControlJustPressed(0, Config.Keys.ToggleHUD) then
        State.hudEnabled = not State.hudEnabled
        pushHud()
    end

    if Config.PASS.Enabled and Config.Keys.TogglePASS and IsControlJustPressed(0, Config.Keys.TogglePASS) and State.scbaEquipped then
        State.passArmed = not State.passArmed
        TriggerServerEvent('sal_scba:server:setPassArmed', State.passArmed)
        if State.passArmed then
            startPassThread()
        end
        pushHud()
    end
end

CreateThread(function()
    while true do
        Wait(5)
        handleHotkeys()
    end
end)

AddEventHandler('gameEventTriggered', function(name, args)
    if name ~= 'CEventNetworkEntityDamage' then
        return
    end

    local victim = args[1]
    if victim ~= PlayerPedId() then
        return
    end

    if IsEntityDead(victim) then
        State.dead = true
        State.maskOn = false
        setSubmixEnabled(false)
        pushHud()
    end
end)

AddEventHandler('onClientResourceStart', function(res)
    if res ~= GetCurrentResourceName() then
        return
    end

    UI:Reset()
    TriggerServerEvent('sal_scba:server:syncMe')
end)

AddEventHandler('onClientResourceStop', function(res)
    if res ~= GetCurrentResourceName() then
        return
    end

    clearBackProp()
    setSubmixEnabled(false)
    UI:Reset()
end)

exports('IsSCBAEquipped', function()
    return State.scbaEquipped
end)

exports('IsMaskOn', function()
    return State.maskOn
end)

exports('GetPressure', function()
    return State.pressure
end)

exports('SetPressure', function(value)
    TriggerServerEvent('sal_scba:server:setPressure', value)
end)

exports('SetHazardLevel', function(level, duration)
    State.localHazardBoost = math.floor(tonumber(level) or 0)
    State.hazardUntil = GetGameTimer() + (tonumber(duration) or 5000)
end)
