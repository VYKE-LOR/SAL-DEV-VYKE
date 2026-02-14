local ESX = exports['es_extended']:getSharedObject()

local PlayerState = {}

local function debugLog(msg)
    if Config.Debug then
        print(('[sal_scba] %s'):format(msg))
    end
end

local function loadStoredPressure(identifier)
    local value = GetResourceKvpString(('sal_scba:%s:pressure'):format(identifier))
    if not value then
        return Config.SCBA.MaxPressure
    end

    local numeric = tonumber(value)
    if not numeric then
        return Config.SCBA.MaxPressure
    end

    return math.min(Config.SCBA.MaxPressure, math.max(0, numeric))
end

local function saveStoredPressure(identifier, pressure)
    SetResourceKvp(('sal_scba:%s:pressure'):format(identifier), ('%.2f'):format(pressure))
end

local function lowStateFromPressure(pressure)
    if pressure <= Config.SCBA.EmptyThreshold then
        return 'empty'
    elseif pressure <= Config.SCBA.VeryLowThreshold then
        return 'verylow'
    elseif pressure <= Config.SCBA.LowThreshold then
        return 'low'
    end

    return 'none'
end

local function canUseByJob(xPlayer)
    if not Config.Framework.JobRestricted then
        return true
    end

    local cfg = Config.Framework.AllowedJobs[xPlayer.job.name]
    if cfg == nil then
        return false
    end

    return xPlayer.job.grade >= cfg
end

local function hasScbaItem(xPlayer)
    local item = xPlayer.getInventoryItem(Config.SCBA.ItemName)
    return item and item.count and item.count > 0
end

local function ensureState(src)
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then
        return nil
    end

    local state = PlayerState[src]
    if state then
        return state
    end

    state = {
        scbaEquipped = false,
        maskOn = false,
        pressure = loadStoredPressure(xPlayer.identifier),
        lowAirState = 'none',
        passArmed = false,
        passAlarm = false,
        identifier = xPlayer.identifier
    }

    state.lowAirState = lowStateFromPressure(state.pressure)
    PlayerState[src] = state

    return state
end

local function emitState(src)
    local state = ensureState(src)
    if not state then
        return
    end

    Player(src).state:set('sal_scba', {
        scbaEquipped = state.scbaEquipped,
        maskOn = state.maskOn,
        pressure = state.pressure,
        lowAirState = state.lowAirState,
        passArmed = state.passArmed,
        passAlarm = state.passAlarm
    }, true)

    TriggerClientEvent('sal_scba:client:setState', src, state)
end

local function savePressure(src)
    local state = PlayerState[src]
    if not state then
        return
    end

    saveStoredPressure(state.identifier, state.pressure)
end

local function isVehicleAllowed(vehicle)
    if vehicle == 0 or not DoesEntityExist(vehicle) then
        return false
    end

    local model = GetEntityModel(vehicle)
    local class = GetVehicleClass(vehicle)

    for i = 1, #Config.Refill.VehicleClasses do
        if class == Config.Refill.VehicleClasses[i] then
            return true
        end
    end

    for i = 1, #Config.Refill.AllowedModels do
        if model == Config.Refill.AllowedModels[i] then
            return true
        end
    end

    return false
end

RegisterNetEvent('sal_scba:server:syncMe', function()
    local src = source
    ensureState(src)
    emitState(src)
end)

RegisterNetEvent('sal_scba:server:toggleEquip', function()
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then
        return
    end

    if not canUseByJob(xPlayer) then
        TriggerClientEvent('sal_scba:client:notify', src, Config.Locales.JobDenied)
        return
    end

    if not hasScbaItem(xPlayer) then
        TriggerClientEvent('sal_scba:client:notify', src, Config.Locales.NoScbaItem)
        return
    end

    local state = ensureState(src)
    state.scbaEquipped = not state.scbaEquipped

    if not state.scbaEquipped then
        state.maskOn = false
        state.passArmed = false
        TriggerClientEvent('sal_scba:client:notify', src, Config.Locales.Unequipped)
    else
        TriggerClientEvent('sal_scba:client:notify', src, Config.Locales.Equipped)
    end

    emitState(src)
end)

RegisterNetEvent('sal_scba:server:toggleMask', function()
    local src = source
    local state = ensureState(src)
    if not state or not state.scbaEquipped then
        return
    end

    if state.pressure <= 0 then
        TriggerClientEvent('sal_scba:client:notify', src, Config.Locales.Empty)
        return
    end

    state.maskOn = not state.maskOn

    TriggerClientEvent('sal_scba:client:notify', src, state.maskOn and Config.Locales.MaskOn or Config.Locales.MaskOff)
    emitState(src)
end)

RegisterNetEvent('sal_scba:server:setPassArmed', function(passArmed)
    local src = source
    local state = ensureState(src)
    if not state then
        return
    end

    state.passArmed = passArmed == true and state.scbaEquipped
    emitState(src)
end)

RegisterNetEvent('sal_scba:server:setPressure', function(value)
    local src = source
    local state = ensureState(src)
    if not state then
        return
    end

    if not state.scbaEquipped then
        return
    end

    local v = tonumber(value)
    if not v then
        return
    end

    local clamped = math.min(Config.SCBA.MaxPressure, math.max(0, v))
    if math.abs(clamped - state.pressure) < 0.01 then
        return
    end

    state.pressure = clamped
    state.lowAirState = lowStateFromPressure(clamped)
    savePressure(src)
    emitState(src)
end)

RegisterNetEvent('sal_scba:server:requestRefill', function(vehicleNet)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    local state = ensureState(src)

    if not xPlayer or not state or not state.scbaEquipped then
        return
    end

    if Config.Refill.RequireJob and not Config.Refill.Jobs[xPlayer.job.name] then
        return
    end

    local vehicle = NetworkGetEntityFromNetworkId(vehicleNet)
    if not vehicle or vehicle == 0 then
        return
    end

    if not isVehicleAllowed(vehicle) then
        debugLog(('Player %s attempted refill with disallowed vehicle model %s'):format(src, GetEntityModel(vehicle)))
        return
    end

    local ped = GetPlayerPed(src)
    local pedCoords = GetEntityCoords(ped)
    local vehCoords = GetEntityCoords(vehicle)

    if #(pedCoords - vehCoords) > (Config.Refill.Distance + 3.0) then
        return
    end

    local increment = Config.Refill.RatePerSecond
    local newPressure = math.min(Config.SCBA.MaxPressure, state.pressure + increment)

    state.pressure = newPressure
    state.lowAirState = lowStateFromPressure(newPressure)
    savePressure(src)

    TriggerClientEvent('sal_scba:client:refillDone', src, newPressure)
    emitState(src)
end)

AddEventHandler('esx:playerLoaded', function(playerId)
    ensureState(playerId)
    emitState(playerId)
end)

AddEventHandler('playerDropped', function()
    local src = source
    savePressure(src)
    PlayerState[src] = nil
end)

AddEventHandler('onResourceStop', function(res)
    if res ~= GetCurrentResourceName() then
        return
    end

    for src, _ in pairs(PlayerState) do
        savePressure(src)
    end
end)

exports('SetPressure', function(playerId, value)
    local state = ensureState(playerId)
    if not state then
        return false
    end

    local clamped = math.min(Config.SCBA.MaxPressure, math.max(0, tonumber(value) or state.pressure))
    state.pressure = clamped
    state.lowAirState = lowStateFromPressure(clamped)
    savePressure(playerId)
    emitState(playerId)
    return true
end)
