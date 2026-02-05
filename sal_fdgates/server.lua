local ESX = exports['es_extended']:getSharedObject()
local DATA_FILE = 'doors.json'

local store = {
    version = 2,
    nextDoorId = 1,
    nextPanelId = 1,
    doors = {},
    panels = {},
    states = {}
}

local function encode(data)
    return json.encode(data)
end

local function decode(raw)
    if not raw or raw == '' then
        return nil
    end
    local ok, data = pcall(json.decode, raw)
    if not ok or type(data) ~= 'table' then
        return nil
    end
    return data
end

local function saveStore()
    SaveResourceFile(GetCurrentResourceName(), DATA_FILE, encode(store), -1)
end

local function isAdmin(xPlayer)
    local group = xPlayer and xPlayer.getGroup and xPlayer.getGroup() or 'user'
    for i = 1, #Config.AdminGroups do
        if group == Config.AdminGroups[i] then
            return true
        end
    end
    return false
end

local function hasGateAccess(xPlayer)
    if not xPlayer then
        return false
    end
    if isAdmin(xPlayer) then
        return true
    end
    local job = xPlayer.getJob and xPlayer.getJob() or nil
    return job and job.name == Config.FireJob and (job.grade or 0) >= Config.MinGrade
end

local function hasEditorAccess(xPlayer)
    if not Config.Editor.Enabled or not xPlayer then
        return false
    end
    if isAdmin(xPlayer) then
        return true
    end
    if Config.Editor.AllowEveryone then
        return true
    end
    if Config.Editor.AllowJob then
        local job = xPlayer.getJob and xPlayer.getJob() or nil
        return job and job.name == Config.FireJob and (job.grade or 0) >= Config.MinGrade
    end
    return false
end

local function normalizeDoor(door)
    if type(door) ~= 'table' then
        return nil
    end
    local id = tonumber(door.id)
    local model = tonumber(door.model)
    local x, y, z = tonumber(door.x), tonumber(door.y), tonumber(door.z)
    if not id or not model or not x or not y or not z then
        return nil
    end
    local mode = tostring(door.mode or Config.DefaultDoorMode)
    if mode ~= 'doorsystem' and mode ~= 'entity' then
        mode = Config.DefaultDoorMode
    end
    return {
        id = id,
        label = tostring(door.label or ('Door %s'):format(id)),
        model = model,
        x = x,
        y = y,
        z = z,
        rate = tonumber(door.rate) or Config.DefaultDoorRate,
        openRatio = tonumber(door.openRatio) or Config.DefaultOpenRatio,
        mode = mode,
        headingClosed = tonumber(door.headingClosed),
        headingOpen = tonumber(door.headingOpen)
    }
end

local function normalizePanel(panel)
    if type(panel) ~= 'table' then
        return nil
    end
    local id = tonumber(panel.id)
    local x, y, z = tonumber(panel.x), tonumber(panel.y), tonumber(panel.z)
    if not id or not x or not y or not z then
        return nil
    end
    local kind = tostring(panel.type or '')
    if kind ~= 'door' and kind ~= 'all' and kind ~= 'red' then
        return nil
    end
    local doorId = nil
    if kind == 'door' then
        doorId = tonumber(panel.doorId)
        if not doorId then
            return nil
        end
    end
    return {
        id = id,
        type = kind,
        doorId = doorId,
        x = x,
        y = y,
        z = z
    }
end

local function getDoorById(doorId)
    for i = 1, #store.doors do
        if store.doors[i].id == doorId then
            return store.doors[i], i
        end
    end
end

local function getPanelById(panelId)
    for i = 1, #store.panels do
        if store.panels[i].id == panelId then
            return store.panels[i], i
        end
    end
end

local function loadStore()
    local raw = LoadResourceFile(GetCurrentResourceName(), DATA_FILE)
    local parsed = decode(raw)
    if not parsed then
        saveStore()
        return
    end

    store.version = tonumber(parsed.version) or 2
    store.nextDoorId = tonumber(parsed.nextDoorId) or 1
    store.nextPanelId = tonumber(parsed.nextPanelId) or 1
    store.doors = {}
    store.panels = {}
    store.states = {}

    local maxDoorId = 0
    for _, door in ipairs(parsed.doors or {}) do
        local nDoor = normalizeDoor(door)
        if nDoor then
            store.doors[#store.doors + 1] = nDoor
            store.states[tostring(nDoor.id)] = parsed.states and parsed.states[tostring(nDoor.id)] == true or false
            if nDoor.id > maxDoorId then
                maxDoorId = nDoor.id
            end
        end
    end

    local maxPanelId = 0
    for _, panel in ipairs(parsed.panels or {}) do
        local nPanel = normalizePanel(panel)
        if nPanel and (nPanel.type ~= 'door' or getDoorById(nPanel.doorId)) then
            store.panels[#store.panels + 1] = nPanel
            if nPanel.id > maxPanelId then
                maxPanelId = nPanel.id
            end
        end
    end

    if store.nextDoorId <= maxDoorId then
        store.nextDoorId = maxDoorId + 1
    end
    if store.nextPanelId <= maxPanelId then
        store.nextPanelId = maxPanelId + 1
    end
    saveStore()
end

local function syncTo(src)
    TriggerClientEvent('sal_fdgates:client:syncAll', src, store.doors, store.panels, store.states)
end

local function syncAll()
    TriggerClientEvent('sal_fdgates:client:syncAll', -1, store.doors, store.panels, store.states)
end

local function setDoorState(doorId, state, src)
    local door = getDoorById(doorId)
    if not door then
        return false
    end
    local key = tostring(doorId)
    local oldState = store.states[key] == true
    local newState = state == true
    if oldState == newState then
        return false
    end
    store.states[key] = newState
    saveStore()
    TriggerClientEvent('sal_fdgates:client:setDoorState', -1, door, newState, src)
    return true
end

local function setAllDoorsState(state, src)
    local newState = state == true
    local changed = false
    for i = 1, #store.doors do
        local door = store.doors[i]
        local key = tostring(door.id)
        if (store.states[key] == true) ~= newState then
            store.states[key] = newState
            TriggerClientEvent('sal_fdgates:client:setDoorState', -1, door, newState, src)
            changed = true
        end
    end
    if changed then
        saveStore()
    end
    return changed
end

local function triggerStationAlarm()
    if not Config.StationAlarm.enabled then
        return
    end
    TriggerClientEvent('sal_fdgates:client:playStationAlarm', -1, {
        coords = { x = Config.StationAlarm.coords.x, y = Config.StationAlarm.coords.y, z = Config.StationAlarm.coords.z },
        distance = Config.StationAlarm.distance,
        url = Config.StationAlarm.url,
        volume = Config.StationAlarm.volume,
        destroyMs = Config.StationAlarm.destroyMs
    })
end

local function deleteDoor(doorId)
    local _, index = getDoorById(doorId)
    if not index then
        return false
    end
    table.remove(store.doors, index)
    store.states[tostring(doorId)] = nil
    for i = #store.panels, 1, -1 do
        if store.panels[i].type == 'door' and store.panels[i].doorId == doorId then
            table.remove(store.panels, i)
        end
    end
    saveStore()
    syncAll()
    return true
end

local function deletePanel(panelId)
    local _, index = getPanelById(panelId)
    if not index then
        return false
    end
    table.remove(store.panels, index)
    saveStore()
    syncAll()
    return true
end

RegisterNetEvent('sal_fdgates:server:requestSync', function()
    syncTo(source)
end)

RegisterNetEvent('sal_fdgates:server:requestDoorState', function(doorId, state)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not hasGateAccess(xPlayer) then
        return
    end
    setDoorState(tonumber(doorId), state == true, source)
end)

RegisterNetEvent('sal_fdgates:server:requestAllState', function(state, reason)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not hasGateAccess(xPlayer) then
        return
    end
    local changed = setAllDoorsState(state == true, source)
    if changed and state == true and reason == 'redbutton' then
        triggerStationAlarm()
    end
end)

RegisterNetEvent('sal_fdgates:server:editorAddDoor', function(payload)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not hasEditorAccess(xPlayer) then
        return
    end
    local entry = normalizeDoor({
        id = store.nextDoorId,
        label = payload and payload.label,
        model = payload and payload.model,
        x = payload and payload.x,
        y = payload and payload.y,
        z = payload and payload.z,
        rate = payload and payload.rate,
        openRatio = payload and payload.openRatio,
        mode = payload and payload.mode,
        headingClosed = payload and payload.headingClosed,
        headingOpen = payload and payload.headingOpen
    })
    if not entry then
        return
    end
    store.nextDoorId = store.nextDoorId + 1
    store.doors[#store.doors + 1] = entry
    store.states[tostring(entry.id)] = false
    saveStore()
    syncAll()
end)

RegisterNetEvent('sal_fdgates:server:editorDeleteDoor', function(doorId)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not hasEditorAccess(xPlayer) then
        return
    end
    deleteDoor(tonumber(doorId))
end)

RegisterNetEvent('sal_fdgates:server:editorAddPanel', function(payload)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not hasEditorAccess(xPlayer) then
        return
    end
    local panel = normalizePanel({
        id = store.nextPanelId,
        type = payload and payload.type,
        doorId = payload and payload.doorId,
        x = payload and payload.x,
        y = payload and payload.y,
        z = payload and payload.z
    })
    if not panel then
        return
    end
    if panel.type == 'door' and not getDoorById(panel.doorId) then
        return
    end
    store.nextPanelId = store.nextPanelId + 1
    store.panels[#store.panels + 1] = panel
    saveStore()
    syncAll()
end)

RegisterNetEvent('sal_fdgates:server:editorDeletePanel', function(panelId)
    local xPlayer = ESX.GetPlayerFromId(source)
    if not hasEditorAccess(xPlayer) then
        return
    end
    deletePanel(tonumber(panelId))
end)

RegisterNetEvent('sal_fdgates:server:requestUiData', function()
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    TriggerClientEvent('sal_fdgates:client:receiveUiData', src, {
        doors = store.doors,
        panels = store.panels,
        states = store.states,
        canControl = hasGateAccess(xPlayer),
        canEdit = hasEditorAccess(xPlayer),
        editorEnabled = Config.Editor.Enabled
    })
end)

ESX.RegisterCommand(Config.MenuCommand, 'user', function(xPlayer)
    TriggerClientEvent('sal_fdgates:client:openMainMenu', xPlayer.source)
end, false, { help = 'Öffnet das FD-Gates Menü' })

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then
        return
    end
    loadStore()
    Wait(200)
    syncAll()
end)
