local doors, panels, states = {}, {}, {}
local spawnedPanels, panelTargets = {}, {}

local editorActive = false
local editorLoopRunning = false
local panelPreviewEnabled = true
local pendingPanelType = nil
local pendingPanelDoorId = nil
local uiCache = nil

local function notify(msg, kind)
    lib.notify({ title = 'FD Gates', description = msg, type = kind or 'inform' })
end

local function toVec3(v)
    return vec3(v.x + 0.0, v.y + 0.0, v.z + 0.0)
end

local function doorSystemId(doorId)
    return joaat(('sal_fdgates:%s'):format(doorId))
end

local function ensureModel(model)
    if not IsModelValid(model) then
        return false
    end
    if HasModelLoaded(model) then
        return true
    end
    RequestModel(model)
    local timeout = GetGameTimer() + 3000
    while not HasModelLoaded(model) and GetGameTimer() < timeout do
        Wait(0)
    end
    return HasModelLoaded(model)
end

local function applyDoorDoorSystem(door, isOpen)
    local id = doorSystemId(door.id)
    if not IsDoorRegisteredWithSystem(id) then
        AddDoorToSystem(id, door.model, door.x, door.y, door.z, false, false, false)
    end
    DoorSystemSetAutomaticRate(id, door.rate or Config.DefaultDoorRate, false, false)
    DoorSystemSetDoorState(id, isOpen and 0 or 1, false, true)
    DoorSystemSetOpenRatio(id, isOpen and (door.openRatio or Config.DefaultOpenRatio) or 0.0, false, true)
    DoorSystemSetHoldOpen(id, isOpen)
end

local function applyDoorEntityFallback(door, isOpen)
    local entity = GetClosestObjectOfType(door.x, door.y, door.z, 2.5, door.model, false, false, false)
    if entity == 0 then
        return
    end
    SetEntityInvincible(entity, true)
    SetEntityCollision(entity, false, false)
    local targetHeading = isOpen and (door.headingOpen or door.headingClosed or GetEntityHeading(entity)) or (door.headingClosed or GetEntityHeading(entity))
    SetEntityHeading(entity, targetHeading)
    FreezeEntityPosition(entity, not isOpen)
end

local function applyDoorState(door, isOpen)
    if (door.mode or Config.DefaultDoorMode) == 'entity' then
        applyDoorEntityFallback(door, isOpen)
        return
    end
    applyDoorDoorSystem(door, isOpen)
end

local function playGateBeep(door)
    if GetResourceState('xsound') ~= 'started' then
        return
    end
    local key = ('%s:%s:%s'):format(Config.Sound.Identifier, door.id, GetGameTimer())
    exports.xsound:PlayUrlPos(key, Config.Sound.Url, Config.Sound.Volume, vec3(door.x, door.y, door.z), false)
    exports.xsound:Distance(key, Config.Sound.Distance)
    SetTimeout(Config.Sound.DestroyMs, function()
        if exports.xsound:soundExists(key) then
            exports.xsound:Destroy(key)
        end
    end)
end

local function removePanelTargets()
    if GetResourceState('ox_target') ~= 'started' then
        panelTargets = {}
        return
    end
    for ent, _ in pairs(panelTargets) do
        if DoesEntityExist(ent) then
            exports.ox_target:removeLocalEntity(ent)
        end
    end
    panelTargets = {}
end

local function destroyPanelProps()
    for _, ent in pairs(spawnedPanels) do
        if DoesEntityExist(ent) then
            DeleteEntity(ent)
        end
    end
    spawnedPanels = {}
end

local function panelModelForType(kind)
    if kind == 'door' then
        return Config.PanelProps.doorPanelModel
    end
    if kind == 'all' then
        return Config.PanelProps.allPanelModel
    end
    return Config.PanelProps.bigRedButtonModel
end

local function addTargetToPanel(entity, panel)
    if GetResourceState('ox_target') ~= 'started' then
        return
    end
    local options = {}
    if panel.type == 'door' then
        options[1] = {
            name = ('sal_fdgates:%s:open'):format(panel.id),
            icon = 'fa-solid fa-door-open',
            label = ('Tor #%s öffnen'):format(panel.doorId),
            onSelect = function()
                TriggerServerEvent('sal_fdgates:server:requestDoorState', panel.doorId, true)
            end
        }
        options[2] = {
            name = ('sal_fdgates:%s:close'):format(panel.id),
            icon = 'fa-solid fa-door-closed',
            label = ('Tor #%s schließen'):format(panel.doorId),
            onSelect = function()
                TriggerServerEvent('sal_fdgates:server:requestDoorState', panel.doorId, false)
            end
        }
    elseif panel.type == 'all' then
        options[1] = {
            name = ('sal_fdgates:%s:openall'):format(panel.id),
            icon = 'fa-solid fa-warehouse',
            label = 'Alle Tore öffnen',
            onSelect = function()
                TriggerServerEvent('sal_fdgates:server:requestAllState', true, 'panel')
            end
        }
        options[2] = {
            name = ('sal_fdgates:%s:closeall'):format(panel.id),
            icon = 'fa-solid fa-warehouse',
            label = 'Alle Tore schließen',
            onSelect = function()
                TriggerServerEvent('sal_fdgates:server:requestAllState', false, 'panel')
            end
        }
    else
        options[1] = {
            name = ('sal_fdgates:%s:redopen'):format(panel.id),
            icon = 'fa-solid fa-triangle-exclamation',
            label = 'Alle Tore öffnen (Alarm)',
            onSelect = function()
                TriggerServerEvent('sal_fdgates:server:requestAllState', true, 'redbutton')
            end
        }
    end

    exports.ox_target:addLocalEntity(entity, options)
    panelTargets[entity] = true
end

local function spawnPanels()
    removePanelTargets()
    destroyPanelProps()
    for i = 1, #panels do
        local panel = panels[i]
        local model = panelModelForType(panel.type)
        if ensureModel(model) then
            local ent = CreateObjectNoOffset(model, panel.x, panel.y, panel.z + (Config.PanelProps.zOffset or 0.0), false, false, false)
            if ent ~= 0 then
                SetEntityAsMissionEntity(ent, true, true)
                SetEntityHeading(ent, GetEntityHeading(PlayerPedId()))
                SetEntityCollision(ent, false, false)
                SetEntityInvincible(ent, true)
                FreezeEntityPosition(ent, true)
                spawnedPanels[panel.id] = ent
                addTargetToPanel(ent, panel)
            end
            SetModelAsNoLongerNeeded(model)
        end
    end
end

local function draw3DText(coords, text)
    local visible, sx, sy = World3dToScreen2d(coords.x, coords.y, coords.z)
    if not visible then
        return
    end
    SetTextScale(0.30, 0.30)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 230)
    SetTextCentre(true)
    BeginTextCommandDisplayText('STRING')
    AddTextComponentSubstringPlayerName(text)
    EndTextCommandDisplayText(sx, sy)
end

local function raycastFromCamera(distance)
    local camPos = GetGameplayCamCoord()
    local rot = GetGameplayCamRot(2)
    local pitch = math.rad(rot.x)
    local yaw = math.rad(rot.z)
    local dir = vec3(-math.sin(yaw) * math.cos(pitch), math.cos(yaw) * math.cos(pitch), math.sin(pitch))
    local dest = camPos + (dir * distance)
    local handle = StartShapeTestRay(camPos.x, camPos.y, camPos.z, dest.x, dest.y, dest.z, 16, PlayerPedId(), 0)
    local _, hit, endCoords, _, entity = GetShapeTestResult(handle)
    return hit == 1 and entity or 0, endCoords
end

local function startEditorLoop()
    if editorLoopRunning then
        return
    end
    editorLoopRunning = true
    CreateThread(function()
        while editorActive do
            local entity, hitCoords = raycastFromCamera(25.0)
            if entity ~= 0 and DoesEntityExist(entity) then
                local min, max = GetModelDimensions(GetEntityModel(entity))
                local pos = GetEntityCoords(entity)
                DrawBox(pos.x + min.x, pos.y + min.y, pos.z + min.z, pos.x + max.x, pos.y + max.y, pos.z + max.z, 255, 60, 40, 120)
                DrawMarker(1, pos.x, pos.y, pos.z + max.z + 0.15, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.16, 0.16, 0.16, 255, 80, 40, 210, false, false, 2, false, nil, nil, false)
                draw3DText(pos + vec3(0.0, 0.0, max.z + 0.35), ('Entity:%s Hash:%s\nX:%.3f Y:%.3f Z:%.3f'):format(entity, GetEntityModel(entity), pos.x, pos.y, pos.z))
                if IsControlJustPressed(0, 38) then
                    local modeInput = lib.inputDialog('Tür hinzufügen', {
                        { type = 'select', label = 'Mode', options = { { label = 'DoorSystem', value = 'doorsystem' }, { label = 'Entity Fallback', value = 'entity' } }, default = Config.DefaultDoorMode },
                        { type = 'number', label = 'Open Ratio', default = Config.DefaultOpenRatio },
                        { type = 'number', label = 'Rate', default = Config.DefaultDoorRate },
                        { type = 'number', label = 'Heading Closed (nur entity)', default = GetEntityHeading(entity) },
                        { type = 'number', label = 'Heading Open (nur entity)', default = GetEntityHeading(entity) + 90.0 }
                    })
                    if modeInput then
                        TriggerServerEvent('sal_fdgates:server:editorAddDoor', {
                            model = GetEntityModel(entity),
                            x = pos.x,
                            y = pos.y,
                            z = pos.z,
                            mode = modeInput[1],
                            openRatio = tonumber(modeInput[2]) or Config.DefaultOpenRatio,
                            rate = tonumber(modeInput[3]) or Config.DefaultDoorRate,
                            headingClosed = tonumber(modeInput[4]),
                            headingOpen = tonumber(modeInput[5])
                        })
                    end
                end
            elseif pendingPanelType then
                if panelPreviewEnabled then
                    DrawMarker(28, hitCoords.x, hitCoords.y, hitCoords.z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.22, 0.22, 0.22, 220, 35, 35, 230, false, false, 2, false, nil, nil, false)
                end
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
                    notify('Panel platziert.', 'success')
                end
            end
            Wait(0)
        end
        editorLoopRunning = false
    end)
end

local function buildDoorMenu(canControl)
    local options = {}
    for i = 1, #doors do
        local door = doors[i]
        local isOpen = states[tostring(door.id)] == true
        options[#options + 1] = {
            title = ('#%s %s'):format(door.id, door.label or ('Door ' .. door.id)),
            description = ('Status: %s | Mode: %s'):format(isOpen and 'Offen' or 'Geschlossen', door.mode or Config.DefaultDoorMode),
            icon = isOpen and 'door-open' or 'door-closed',
            disabled = not canControl,
            onSelect = function()
                lib.registerContext({
                    id = ('sal_fdgates:door:%s'):format(door.id),
                    title = ('Tor #%s'):format(door.id),
                    menu = 'sal_fdgates:main',
                    options = {
                        {
                            title = 'Öffnen',
                            onSelect = function() TriggerServerEvent('sal_fdgates:server:requestDoorState', door.id, true) end
                        },
                        {
                            title = 'Schließen',
                            onSelect = function() TriggerServerEvent('sal_fdgates:server:requestDoorState', door.id, false) end
                        },
                        {
                            title = 'Toggle',
                            onSelect = function() TriggerServerEvent('sal_fdgates:server:requestDoorState', door.id, not (states[tostring(door.id)] == true)) end
                        }
                    }
                })
                lib.showContext(('sal_fdgates:door:%s'):format(door.id))
            end
        }
    end
    return options
end

local function openEditorMenu(canEdit)
    if not canEdit then
        notify('Keine Editor-Rechte.', 'error')
        return
    end
    lib.registerContext({
        id = 'sal_fdgates:editor',
        title = 'FD Gates Editor',
        menu = 'sal_fdgates:main',
        options = {
            {
                title = editorActive and 'Editor deaktivieren' or 'Editor aktivieren',
                onSelect = function()
                    editorActive = not editorActive
                    pendingPanelType = nil
                    pendingPanelDoorId = nil
                    if editorActive then
                        startEditorLoop()
                    end
                    notify(editorActive and 'Editor aktiv.' or 'Editor deaktiviert.', 'success')
                end
            },
            {
                title = panelPreviewEnabled and 'Panel-Preview aus' or 'Panel-Preview an',
                onSelect = function()
                    panelPreviewEnabled = not panelPreviewEnabled
                    openEditorMenu(canEdit)
                end
            },
            {
                title = 'Panel setzen (Door)',
                onSelect = function()
                    if not editorActive then
                        notify('Editor ist nicht aktiv.', 'error')
                        return
                    end
                    local input = lib.inputDialog('Door Panel', { { type = 'number', label = 'Door ID', required = true } })
                    if input and input[1] then
                        pendingPanelType = 'door'
                        pendingPanelDoorId = tonumber(input[1])
                        notify('Auf Position zielen und E drücken.', 'inform')
                    end
                end
            },
            {
                title = 'Panel setzen (All)',
                onSelect = function()
                    if not editorActive then
                        notify('Editor ist nicht aktiv.', 'error')
                        return
                    end
                    pendingPanelType = 'all'
                    pendingPanelDoorId = nil
                    notify('Auf Position zielen und E drücken.', 'inform')
                end
            },
            {
                title = 'Großen roten Knopf setzen',
                onSelect = function()
                    if not editorActive then
                        notify('Editor ist nicht aktiv.', 'error')
                        return
                    end
                    pendingPanelType = 'red'
                    pendingPanelDoorId = nil
                    notify('Auf Position zielen und E drücken.', 'inform')
                end
            },
            {
                title = 'Tür löschen (ID)',
                onSelect = function()
                    local input = lib.inputDialog('Tür löschen', { { type = 'number', label = 'Door ID', required = true } })
                    if input and input[1] then
                        TriggerServerEvent('sal_fdgates:server:editorDeleteDoor', tonumber(input[1]))
                    end
                end
            },
            {
                title = 'Panel löschen (ID)',
                onSelect = function()
                    local input = lib.inputDialog('Panel löschen', { { type = 'number', label = 'Panel ID', required = true } })
                    if input and input[1] then
                        TriggerServerEvent('sal_fdgates:server:editorDeletePanel', tonumber(input[1]))
                    end
                end
            }
        }
    })
    lib.showContext('sal_fdgates:editor')
end

local function openMainMenu(data)
    uiCache = data
    local doorOptions = buildDoorMenu(data.canControl)
    local panelCount = #panels

    lib.registerContext({
        id = 'sal_fdgates:main',
        title = 'FD Gates',
        options = {
            {
                title = 'Alle Tore öffnen',
                description = 'Server-authoritativ',
                disabled = not data.canControl,
                onSelect = function() TriggerServerEvent('sal_fdgates:server:requestAllState', true, 'menu') end
            },
            {
                title = 'Alle Tore schließen',
                description = 'Server-authoritativ',
                disabled = not data.canControl,
                onSelect = function() TriggerServerEvent('sal_fdgates:server:requestAllState', false, 'menu') end
            },
            {
                title = 'Tore',
                description = ('%s Einträge'):format(#doorOptions),
                onSelect = function()
                    lib.registerContext({ id = 'sal_fdgates:doors', title = 'Tore', menu = 'sal_fdgates:main', options = doorOptions })
                    lib.showContext('sal_fdgates:doors')
                end
            },
            {
                title = 'Panels',
                description = ('%s Panels vorhanden'):format(panelCount),
                disabled = panelCount == 0,
                onSelect = function()
                    local opts = {}
                    for i = 1, #panels do
                        local p = panels[i]
                        opts[#opts + 1] = {
                            title = ('Panel #%s (%s)'):format(p.id, p.type),
                            description = ('X: %.2f Y: %.2f Z: %.2f'):format(p.x, p.y, p.z),
                            onSelect = function()
                                SetNewWaypoint(p.x, p.y)
                                notify(('Waypoint gesetzt: Panel #%s'):format(p.id), 'success')
                            end
                        }
                    end
                    lib.registerContext({ id = 'sal_fdgates:panels', title = 'Panels', menu = 'sal_fdgates:main', options = opts })
                    lib.showContext('sal_fdgates:panels')
                end
            },
            {
                title = 'Editor',
                description = data.editorEnabled and 'Editor-Funktionen' or 'Editor ist deaktiviert',
                disabled = not data.editorEnabled,
                onSelect = function() openEditorMenu(data.canEdit) end
            }
        }
    })

    lib.showContext('sal_fdgates:main')
end

RegisterNetEvent('sal_fdgates:client:openMainMenu', function()
    TriggerServerEvent('sal_fdgates:server:requestUiData')
end)

RegisterNetEvent('sal_fdgates:client:receiveUiData', function(data)
    if not data then
        return
    end
    openMainMenu(data)
end)

RegisterNetEvent('sal_fdgates:client:syncAll', function(syncDoors, syncPanels, syncStates)
    doors = syncDoors or {}
    panels = syncPanels or {}
    states = syncStates or {}
    for i = 1, #doors do
        local door = doors[i]
        applyDoorState(door, states[tostring(door.id)] == true)
    end
    spawnPanels()
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
        playGateBeep(door)
    end
end)

RegisterNetEvent('sal_fdgates:client:playStationAlarm', function(payload)
    if GetResourceState('xsound') ~= 'started' or not payload or not payload.coords then
        return
    end
    local key = ('fdstation_alarm:%s'):format(GetGameTimer())
    local coords = vec3(payload.coords.x + 0.0, payload.coords.y + 0.0, payload.coords.z + 0.0)
    exports.xsound:PlayUrlPos(key, payload.url, payload.volume, coords, false)
    exports.xsound:Distance(key, payload.distance)
    SetTimeout(payload.destroyMs or 10000, function()
        if exports.xsound:soundExists(key) then
            exports.xsound:Destroy(key)
        end
    end)
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

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then
        return
    end
    removePanelTargets()
    destroyPanelProps()
end)
