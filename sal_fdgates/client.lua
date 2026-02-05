local doors = {}
local states = {}
local panels = {}
local zoneNames = {}

local editorEnabled = false
local editorThread = false
local pendingPanelType = nil
local pendingPanelDoorId = nil

local function notify(msg)
    TriggerEvent('chat:addMessage', { args = { '^3sal_fdgates', msg } })
end

local function doorSystemId(doorId)
    return joaat(('sal_fdgates:%s'):format(doorId))
end

local function panelVec(panel)
    return vec3(panel.x + 0.0, panel.y + 0.0, panel.z + 0.0)
end

local function toVec3(data)
    return vec3(data.x + 0.0, data.y + 0.0, data.z + 0.0)
end

local function ensureDoorRegistered(door)
    local id = doorSystemId(door.id)
    if not IsDoorRegisteredWithSystem(id) then
        AddDoorToSystem(id, door.model, door.x, door.y, door.z, false, false, false)
    end
    DoorSystemSetAutomaticRate(id, door.rate or Config.DefaultDoorRate, false, false)
    return id
end

local function fallbackApply(door, isOpen)
    local entity = GetClosestObjectOfType(door.x, door.y, door.z, 1.5, door.model, false, false, false)
    if entity == 0 then
        return
    end
    FreezeEntityPosition(entity, not isOpen)
end

local function applyDoorState(door, isOpen)
    local id = ensureDoorRegistered(door)
    local ratio = isOpen and (door.openRatio or Config.DefaultOpenRatio) or 0.0
    DoorSystemSetDoorState(id, 0, false, false)
    DoorSystemSetOpenRatio(id, ratio, false, false)
    fallbackApply(door, isOpen)
end

local function removePanelZones()
    if GetResourceState('ox_target') ~= 'started' then
        zoneNames = {}
        return
    end
    for i = 1, #zoneNames do
        exports.ox_target:removeZone(zoneNames[i])
    end
    zoneNames = {}
end

local function addPanelZone(panel)
    if GetResourceState('ox_target') ~= 'started' then
        return
    end
    local zoneName = ('sal_fdgates:panel:%s'):format(panel.id)
    local options
    if panel.type == 'door' then
        options = {
            {
                name = zoneName .. ':open',
                icon = 'fa-solid fa-door-open',
                label = ('Tür #%s öffnen'):format(panel.doorId),
                onSelect = function()
                    TriggerServerEvent('sal_fdgates:server:requestDoorState', panel.doorId, true)
                end
            },
            {
                name = zoneName .. ':close',
                icon = 'fa-solid fa-door-closed',
                label = ('Tür #%s schließen'):format(panel.doorId),
                onSelect = function()
                    TriggerServerEvent('sal_fdgates:server:requestDoorState', panel.doorId, false)
                end
            }
        }
    else
        options = {
            {
                name = zoneName .. ':open_all',
                icon = 'fa-solid fa-warehouse',
                label = 'Alle Tore öffnen',
                onSelect = function()
                    TriggerServerEvent('sal_fdgates:server:requestAllState', true)
                end
            },
            {
                name = zoneName .. ':close_all',
                icon = 'fa-solid fa-warehouse',
                label = 'Alle Tore schließen',
                onSelect = function()
                    TriggerServerEvent('sal_fdgates:server:requestAllState', false)
                end
            }
        }
    end

    exports.ox_target:addSphereZone({
        name = zoneName,
        coords = panelVec(panel),
        radius = 0.45,
        drawSprite = true,
        debug = false,
        options = options
    })
    zoneNames[#zoneNames + 1] = zoneName
end

local function refreshPanelZones()
    removePanelZones()
    for _, panel in ipairs(panels) do
        addPanelZone(panel)
    end
end

local function playDoorSound(door)
    if GetResourceState('xsound') ~= 'started' then
        return
    end
    local key = ('%s:%s:%s'):format(Config.Sound.Identifier, door.id, GetGameTimer())
    local coords = toVec3(door)
    exports.xsound:PlayUrlPos(key, Config.Sound.Url, Config.Sound.Volume, coords, false)
    exports.xsound:Distance(key, Config.Sound.Distance)
    SetTimeout(Config.Sound.DestroyMs, function()
        if exports.xsound:soundExists(key) then
            exports.xsound:Destroy(key)
        end
    end)
end

local function draw3DText(coords, text)
    local onScreen, x, y = World3dToScreen2d(coords.x, coords.y, coords.z)
    if not onScreen then
        return
    end
    SetTextScale(0.3, 0.3)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 230)
    SetTextCentre(true)
    BeginTextCommandDisplayText('STRING')
    AddTextComponentSubstringPlayerName(text)
    EndTextCommandDisplayText(x, y)
end

local function raycastFromCamera(distance)
    local camPos = GetGameplayCamCoord()
    local rot = GetGameplayCamRot(2)
    local pitch = math.rad(rot.x)
    local yaw = math.rad(rot.z)
    local dir = vec3(-math.sin(yaw) * math.cos(pitch), math.cos(yaw) * math.cos(pitch), math.sin(pitch))
    local destination = camPos + (dir * distance)
    local handle = StartShapeTestRay(camPos.x, camPos.y, camPos.z, destination.x, destination.y, destination.z, 16, PlayerPedId(), 0)
    local _, hit, endCoords, _, entityHit = GetShapeTestResult(handle)
    return hit == 1 and entityHit or 0, endCoords
end

local function startEditorLoop()
    if editorThread then
        return
    end
    editorThread = true
    CreateThread(function()
        while editorEnabled do
            local entity, hitCoords = raycastFromCamera(20.0)
            if entity ~= 0 and DoesEntityExist(entity) then
                local min, max = GetModelDimensions(GetEntityModel(entity))
                local pos = GetEntityCoords(entity)
                DrawBox(
                    pos.x + min.x, pos.y + min.y, pos.z + min.z,
                    pos.x + max.x, pos.y + max.y, pos.z + max.z,
                    255, 70, 30, 120
                )
                DrawMarker(1, pos.x, pos.y, pos.z + max.z + 0.15, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.16, 0.16, 0.16, 255, 80, 30, 220, false, false, 2, false, nil, nil, false)
                local info = ('ID:%s | Hash:%s\nX:%.3f Y:%.3f Z:%.3f'):format(entity, GetEntityModel(entity), pos.x, pos.y, pos.z)
                draw3DText(pos + vec3(0.0, 0.0, max.z + 0.35), info)
                if IsControlJustPressed(0, 38) then
                    TriggerServerEvent('sal_fdgates:server:editorAddDoor', {
                        model = GetEntityModel(entity),
                        x = pos.x,
                        y = pos.y,
                        z = pos.z,
                        rate = Config.DefaultDoorRate,
                        openRatio = Config.DefaultOpenRatio
                    })
                end
            elseif pendingPanelType then
                DrawMarker(28, hitCoords.x, hitCoords.y, hitCoords.z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.18, 0.18, 0.18, 40, 175, 255, 220, false, false, 2, false, nil, nil, false)
                draw3DText(hitCoords + vec3(0.0, 0.0, 0.2), ('Panel: %s'):format(pendingPanelType))
                if IsControlJustPressed(0, 38) then
                    TriggerServerEvent('sal_fdgates:server:editorAddPanel', {
                        type = pendingPanelType,
                        doorId = pendingPanelDoorId,
                        x = hitCoords.x,
                        y = hitCoords.y,
                        z = hitCoords.z
                    })
                    pendingPanelType = nil
                    pendingPanelDoorId = nil
                    notify('Panel gespeichert.')
                end
            end
            Wait(0)
        end
        editorThread = false
    end)
end

RegisterNetEvent('sal_fdgates:client:syncAll', function(syncDoors, syncPanels, syncStates)
    doors = syncDoors or {}
    panels = syncPanels or {}
    states = syncStates or {}
    for _, door in ipairs(doors) do
        applyDoorState(door, states[tostring(door.id)] == true)
    end
    refreshPanelZones()
end)

RegisterNetEvent('sal_fdgates:client:setDoorState', function(door, isOpen)
    if not door or not door.id then
        return
    end
    local key = tostring(door.id)
    local old = states[key] == true
    states[key] = isOpen == true
    applyDoorState(door, states[key])
    if old ~= states[key] then
        playDoorSound(door)
    end
end)

RegisterNetEvent('sal_fdgates:client:toggleEditor', function()
    if not Config.Editor.Enabled then
        notify('Editor ist deaktiviert.')
        return
    end
    editorEnabled = not editorEnabled
    pendingPanelType = nil
    pendingPanelDoorId = nil
    notify(editorEnabled and 'Editor aktiv. Mit E Tür übernehmen.' or 'Editor deaktiviert.')
    if editorEnabled then
        startEditorLoop()
    end
end)

RegisterNetEvent('sal_fdgates:client:preparePanelPlacement', function(panelType, doorId)
    if not editorEnabled then
        notify('Editor muss aktiv sein.')
        return
    end
    panelType = tostring(panelType or '')
    if panelType ~= 'door' and panelType ~= 'all' then
        notify('Typ muss door oder all sein.')
        return
    end
    if panelType == 'door' then
        doorId = tonumber(doorId)
        if not doorId then
            notify('Door-ID fehlt.')
            return
        end
    end
    pendingPanelType = panelType
    pendingPanelDoorId = panelType == 'door' and tonumber(doorId) or nil
    notify('Ziele Punkt an und drücke E zum Speichern.')
end)

AddEventHandler('onClientResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then
        return
    end
    TriggerServerEvent('sal_fdgates:server:requestSync')
end)

RegisterNetEvent('esx:playerLoaded', function()
    TriggerServerEvent('sal_fdgates:server:requestSync')
end)
