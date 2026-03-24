local resetApplied = false
local resetScheduled = false

local function tryResolveGroundZ(x, y, z)
    local startZ = z + 50.0

    for _ = 1, (Config.MaxGroundChecks or 15) do
        RequestCollisionAtCoord(x, y, startZ)
        local found, groundZ = GetGroundZFor_3dCoord(x, y, startZ, false)

        if found then
            return groundZ
        end

        startZ = startZ + 25.0
        Wait(Config.GroundCheckIntervalMs or 100)
    end

    return nil
end

local function applySpawnReset()
    if resetApplied then
        return
    end

    resetApplied = true

    local ped = PlayerPedId()
    if ped == 0 or not DoesEntityExist(ped) then
        return
    end

    local coords = GetEntityCoords(ped)
    local groundZ = tryResolveGroundZ(coords.x, coords.y, coords.z)

    local targetZ = groundZ and (groundZ + (Config.GroundOffset or 1.0)) or (coords.z + 1.0)

    SetEntityCoordsNoOffset(ped, coords.x, coords.y, targetZ, false, false, false)
end

local function scheduleReset()
    if resetApplied or resetScheduled then
        return
    end

    resetScheduled = true

    CreateThread(function()
        Wait(Config.DelayMs or 3000)
        applySpawnReset()
    end)
end

RegisterNetEvent('esx:onPlayerSpawn', function()
    scheduleReset()
end)

AddEventHandler('playerSpawned', function()
    scheduleReset()
end)

RegisterNetEvent('esx:playerLoaded', function()
    scheduleReset()
end)
