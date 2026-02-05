local ESX = exports['es_extended']:getSharedObject()
local DATA_FILE = 'doors.json'

local store = {
    version = 1,
    nextDoorId = 1,
    nextPanelId = 1,
    doors = {},
    panels = {},
    states = {}
}

local function encode(value)
    return json.encode(value)
end

local function decode(value)
    if not value or value == '' then
        return nil
    end
    local ok, parsed = pcall(json.decode, value)
    if not ok or type(parsed) ~= 'table' then
        return nil
    end
    return parsed
end

local function saveStore()
    SaveResourceFile(GetCurrentResourceName(), DATA_FILE, encode(store), -1)
end

local function normalizeDoor(door)
    if type(door) ~= 'table' then
        return nil
    end
    door.id = tonumber(door.id)
    door.model = tonumber(door.model)
    door.x = tonumber(door.x)
    door.y = tonumber(door.y)
    door.z = tonumber(door.z)
    if not door.id or not door.model or not door.x or not door.y or not door.z then
        return nil
    end
    door.rate = tonumber(door.rate) or Config.DefaultDoorRate
    door.openRatio = tonumber(door.openRatio) or Config.DefaultOpenRatio
    return door
end

local function normalizePanel(panel)
    if type(panel) ~= 'table' then
        return nil
    end
    panel.id = tonumber(panel.id)
    panel.type = tostring(panel.type or '')
    panel.x = tonumber(panel.x)
    panel.y = tonumber(panel.y)
    panel.z = tonumber(panel.z)
    if not panel.id or not panel.x or not panel.y or not panel.z then
        return nil
    end
    if panel.type ~= 'door' and panel.type ~= 'all' then
        return nil
    end
    if panel.type == 'door' then
        panel.doorId = tonumber(panel.doorId)
        if not panel.doorId then
            return nil
        end
    else
        panel.doorId = nil
    end
    return panel
end

local function loadStore()
    local raw = LoadResourceFile(GetCurrentResourceName(), DATA_FILE)
    local parsed = decode(raw)
    if not parsed then
        saveStore()
        return
    end
    store.version = tonumber(parsed.version) or 1
    store.nextDoorId = tonumber(parsed.nextDoorId) or 1
    store.nextPanelId = tonumber(parsed.nextPanelId) or 1
    store.doors = {}
    store.panels = {}
    store.states = {}

    for _, door in ipairs(parsed.doors or {}) do
        local normalized = normalizeDoor(door)
        if normalized then
            store.doors[#store.doors + 1] = normalized
        end
    end

    for _, panel in ipairs(parsed.panels or {}) do
        local normalized = normalizePanel(panel)
        if normalized then
            store.panels[#store.panels + 1] = normalized
        end
    end

    local maxDoorId = 0
    for _, door in ipairs(store.doors) do
        if door.id > maxDoorId then
            maxDoorId = door.id
        end
        store.states[tostring(door.id)] = parsed.states and parsed.states[tostring(door.id)] == true or false
    end
    if store.nextDoorId <= maxDoorId then
        store.nextDoorId = maxDoorId + 1
    end

    local maxPanelId = 0
    for _, panel in ipairs(store.panels) do
        if panel.id > maxPanelId then
            maxPanelId = panel.id
        end
    end
    if store.nextPanelId <= maxPanelId then
        store.nextPanelId = maxPanelId + 1
    end

    saveStore()
end

local function getDoorById(doorId)
    for i = 1, #store.doors do
        local door = store.doors[i]
        if door.id == doorId then
            return door, i
        end
    end
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
    if not job then
        return false
    end
    return job.name == Config.FireJob and (job.grade or 0) >= Config.MinGrade
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

local function syncTo(src)
    TriggerClientEvent('sal_fdgates:client:syncAll', src, store.doors, store.panels, store.states)
end

local function syncAll()
    TriggerClientEvent('sal_fdgates:client:syncAll', -1, store.doors, store.panels, store.states)
end

local function setDoorState(doorId, newState, src)
    local door = getDoorById(doorId)
    if not door then
        return false
    end
    local key = tostring(doorId)
    local oldState = store.states[key] == true
    local targetState = newState == true
    if oldState == targetState then
        return false
    end
    store.states[key] = targetState
    saveStore()
    TriggerClientEvent('sal_fdgates:client:setDoorState', -1, door, targetState, src)
    return true
end


local function deleteDoor(doorId)
    local _, index = getDoorById(doorId)
    if not index then
        return false
    end
    table.remove(store.doors, index)
    store.states[tostring(doorId)] = nil
    for i = #store.panels, 1, -1 do
        local panel = store.panels[i]
        if panel.type == 'door' and panel.doorId == doorId then
            table.remove(store.panels, i)
        end
    end
    saveStore()
    syncAll()
    return true
end

local function deletePanel(panelId)
    for i = 1, #store.panels do
        if store.panels[i].id == panelId then
            table.remove(store.panels, i)
            saveStore()
            syncAll()
            return true
        end
    end
    return false
end
local function setAllDoorsState(newState, src)
    local changed = false
    for _, door in ipairs(store.doors) do
        local key = tostring(door.id)
        local oldState = store.states[key] == true
        if oldState ~= newState then
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

RegisterNetEvent('sal_fdgates:server:requestSync', function()
    syncTo(source)
end)

RegisterNetEvent('sal_fdgates:server:requestDoorState', function(doorId, state)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not hasGateAccess(xPlayer) then
        return
    end
    doorId = tonumber(doorId)
    if not doorId then
        return
    end
    setDoorState(doorId, state == true, src)
end)

RegisterNetEvent('sal_fdgates:server:requestAllState', function(state)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not hasGateAccess(xPlayer) then
        return
    end
    setAllDoorsState(state == true, src)
end)

RegisterNetEvent('sal_fdgates:server:editorAddDoor', function(doorData)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not hasEditorAccess(xPlayer) then
        return
    end
    local door = normalizeDoor({
        id = store.nextDoorId,
        model = doorData and doorData.model,
        x = doorData and doorData.x,
        y = doorData and doorData.y,
        z = doorData and doorData.z,
        rate = doorData and doorData.rate,
        openRatio = doorData and doorData.openRatio
    })
    if not door then
        return
    end
    store.nextDoorId = store.nextDoorId + 1
    store.doors[#store.doors + 1] = door
    store.states[tostring(door.id)] = false
    saveStore()
    syncAll()
    TriggerClientEvent('chat:addMessage', src, { args = { '^2sal_fdgates', ('Door #%s hinzugefügt.'):format(door.id) } })
end)

RegisterNetEvent('sal_fdgates:server:editorDeleteDoor', function(doorId)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not hasEditorAccess(xPlayer) then
        return
    end
    doorId = tonumber(doorId)
    if not doorId then
        return
    end
    deleteDoor(doorId)
end)

RegisterNetEvent('sal_fdgates:server:editorAddPanel', function(panelData)
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not hasEditorAccess(xPlayer) then
        return
    end
    local panel = normalizePanel({
        id = store.nextPanelId,
        type = panelData and panelData.type,
        doorId = panelData and panelData.doorId,
        x = panelData and panelData.x,
        y = panelData and panelData.y,
        z = panelData and panelData.z
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
    local src = source
    local xPlayer = ESX.GetPlayerFromId(src)
    if not hasEditorAccess(xPlayer) then
        return
    end
    panelId = tonumber(panelId)
    if not panelId then
        return
    end
    deletePanel(panelId)
end)

ESX.RegisterCommand('fdgate', 'user', function(xPlayer, args)
    local src = xPlayer.source
    if not hasGateAccess(xPlayer) then
        return
    end
    if args.action ~= 'open' and args.action ~= 'close' then
        return
    end
    local action = args.action == 'open'
    if args.scope == 'all' then
        setAllDoorsState(action, src)
        return
    end
    local doorId = tonumber(args.scope)
    if not doorId then
        return
    end
    setDoorState(doorId, action, src)
end, false, {
    help = 'Steuert FD-Tore',
    arguments = {
        { name = 'scope', help = 'Door-ID oder all', type = 'string' },
        { name = 'action', help = 'open oder close', type = 'string' }
    }
})

ESX.RegisterCommand('fdgeditor', 'user', function(xPlayer)
    if not hasEditorAccess(xPlayer) then
        return
    end
    TriggerClientEvent('sal_fdgates:client:toggleEditor', xPlayer.source)
end, false, { help = 'Schaltet den FD-Gate-Editor um' })

ESX.RegisterCommand('fdgatedeldoor', 'user', function(xPlayer, args)
    if not hasEditorAccess(xPlayer) then
        return
    end
    deleteDoor(tonumber(args.id))
end, false, {
    help = 'Löscht eine Tür',
    arguments = {
        { name = 'id', help = 'Door-ID', type = 'number' }
    }
})

ESX.RegisterCommand('fdgatepanel', 'user', function(xPlayer, args)
    if not hasEditorAccess(xPlayer) then
        return
    end
    TriggerClientEvent('sal_fdgates:client:preparePanelPlacement', xPlayer.source, args.type, args.doorid)
end, false, {
    help = 'Panel-Platzierung starten',
    arguments = {
        { name = 'type', help = 'door oder all', type = 'string' },
        { name = 'doorid', help = 'Door-ID (nur bei type door)', type = 'number', optional = true }
    }
})

ESX.RegisterCommand('fdgatedelpanel', 'user', function(xPlayer, args)
    if not hasEditorAccess(xPlayer) then
        return
    end
    deletePanel(tonumber(args.id))
end, false, {
    help = 'Löscht ein Panel',
    arguments = {
        { name = 'id', help = 'Panel-ID', type = 'number' }
    }
})

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then
        return
    end
    loadStore()
    Wait(250)
    syncAll()
end)
