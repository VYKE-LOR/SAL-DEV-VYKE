local MySQL = require('bridge/mysql')
local Inventory = require('bridge/inventory')
local Bridge = require('bridge/framework')
local Cache = require('server/cache')
local Queue = require('server/queue')
local Crafting = require('server/crafting')
local Progression = require('server/progression')
local Blueprints = require('server/blueprints')
local Benches = require('server/benches')
local Security = require('server/security')
local Admin = require('server/admin')
local Util = require('shared/util')

local function checkDependencies()
  if not MySQL.GetAdapter() then
    print('[sal_craftingframework] Missing MySQL adapter. Resource stopped.')
    StopResource(GetCurrentResourceName())
    return false
  end
  if GetResourceState('jaksam_inventory') ~= 'started' then
    print('[sal_craftingframework] jaksam_inventory not running. Resource stopped.')
    StopResource(GetCurrentResourceName())
    return false
  end
  if GetResourceState('ox_target') ~= 'started' then
    print('[sal_craftingframework] ox_target not running. Resource stopped.')
    StopResource(GetCurrentResourceName())
    return false
  end
  if not LoadResourceFile(GetCurrentResourceName(), 'ui/index.html') then
    print('[sal_craftingframework] UI files missing (ui/index.html). Resource stopped.')
    StopResource(GetCurrentResourceName())
    return false
  end
  return true
end

local function sendSnapshot(source)
  local snapshot = Cache.GetSnapshot()
  TriggerClientEvent('sal_crafting:client:snapshot', source, snapshot)
end

AddEventHandler('onResourceStart', function(resourceName)
  if resourceName ~= GetCurrentResourceName() then
    return
  end
  if not checkDependencies() then
    return
  end
  Cache.LoadAll()
  Queue.Init()
  Util.Debug('Crafting framework started.')
end)

RegisterNetEvent('sal_crafting:server:open', function(benchContext)
  local source = source
  local player = Bridge.GetPlayer(source)
  if not player then
    return
  end
  local bench = nil
  if benchContext and benchContext.locationId then
    local benchLocation = Cache.benchLocations[benchContext.locationId]
    if not benchLocation then
      return
    end
    if not Benches.IsInRange(source, benchLocation) then
      return
    end
    if not Benches.HasAccess(source, benchLocation.access) then
      return
    end
    bench = benchLocation
  end
  local token = Security.NewNonce(source)
  local identifier = Bridge.GetIdentifier(player)
  local xp, level = Progression.GetPlayerProgress(identifier)

  sendSnapshot(source)
  TriggerClientEvent('sal_crafting:client:open', source, {
    token = token,
    bench = bench,
    admin = benchContext and benchContext.admin or false,
    player = {
      identifier = identifier,
      level = level,
      xp = xp,
    },
  })
end)

RegisterNetEvent('sal_crafting:server:request_snapshot', function(token)
  local source = source
  if not Security.ValidateNonce(source, token) then
    return
  end
  sendSnapshot(source)
end)

RegisterNetEvent('sal_crafting:server:craft_now', function(token, payload)
  local source = source
  if not Security.ValidateNonce(source, token) then
    return
  end
  if not Security.RateLimit(source, 'craft') then
    return
  end
  local benchLocation = Cache.benchLocations[payload.locationId]
  local ok, result = Crafting.CraftNow(source, benchLocation, payload.recipeId, payload.amount)
  if not ok then
    TriggerClientEvent('sal_crafting:client:toast', source, { type = 'error', title = 'Craft failed', body = result })
    return
  end
  if result.xpReward and result.xpReward > 0 then
    local identifier = Bridge.GetIdentifier(Bridge.GetPlayer(source))
    local xp, level = Progression.AddXP(identifier, result.xpReward)
    TriggerClientEvent('sal_crafting:client:progression', source, { xp = xp, level = level })
  end
  TriggerClientEvent('sal_crafting:client:toast', source, { type = 'success', title = 'Craft complete', body = result.name or 'Crafted' })
end)

RegisterNetEvent('sal_crafting:server:queue_add', function(token, payload)
  local source = source
  if not Security.ValidateNonce(source, token) then
    return
  end
  if not Security.RateLimit(source, 'queue') then
    return
  end
  local benchLocation = Cache.benchLocations[payload.locationId]
  local ok, result = Crafting.QueueAdd(source, benchLocation, payload.recipeId, payload.amount)
  if not ok then
    TriggerClientEvent('sal_crafting:client:toast', source, { type = 'error', title = 'Queue failed', body = result })
    return
  end
  TriggerClientEvent('sal_crafting:client:queue_updated', source)
  TriggerClientEvent('sal_crafting:client:toast', source, { type = 'success', title = 'Queued', body = 'Item added to queue.' })
end)

RegisterNetEvent('sal_crafting:server:queue_claim', function(token, payload)
  local source = source
  if not Security.ValidateNonce(source, token) then
    return
  end
  if not Security.RateLimit(source, 'claim') then
    return
  end
  local identifier = Bridge.GetIdentifier(Bridge.GetPlayer(source))
  local ok, item = Queue.Claim(payload.queueId, identifier)
  if not ok then
    TriggerClientEvent('sal_crafting:client:toast', source, { type = 'error', title = 'Claim failed', body = item })
    return
  end
  local output = item.payload
  if type(output) == 'string' then
    output = json.decode(output)
  end
  if output and output.output then
    local canCarry = Inventory.CanCarryItem(source, output.output.item, output.output.amount * item.amount, output.output.metadata)
    if not canCarry then
      TriggerClientEvent('sal_crafting:client:toast', source, { type = 'error', title = 'Inventory full', body = 'Cannot carry crafted item.' })
      return
    end
    Inventory.AddItem(source, output.output.item, output.output.amount * item.amount, output.output.metadata)
    if output.xp and output.xp > 0 then
      local xp, level = Progression.AddXP(identifier, output.xp)
      TriggerClientEvent('sal_crafting:client:progression', source, { xp = xp, level = level })
    end
  end
  TriggerClientEvent('sal_crafting:client:queue_updated', source)
  TriggerClientEvent('sal_crafting:client:toast', source, { type = 'success', title = 'Claimed', body = 'Crafted item claimed.' })
end)

RegisterNetEvent('sal_crafting:server:queue_cancel', function(token, payload)
  local source = source
  if not Security.ValidateNonce(source, token) then
    return
  end
  if not Security.RateLimit(source, 'queue') then
    return
  end
  local identifier = Bridge.GetIdentifier(Bridge.GetPlayer(source))
  local ok = Queue.Cancel(payload.queueId, identifier)
  if not ok then
    TriggerClientEvent('sal_crafting:client:toast', source, { type = 'error', title = 'Cancel failed', body = 'Unable to cancel.' })
    return
  end
  TriggerClientEvent('sal_crafting:client:queue_updated', source)
end)

RegisterNetEvent('sal_crafting:server:admin_save', function(token, payload)
  local source = source
  if not Security.ValidateNonce(source, token) then
    return
  end
  if not Security.RateLimit(source, 'admin') then
    return
  end
  if not Security.IsAdmin(source) then
    return
  end
  if payload.type == 'recipe' then
    Admin.SaveRecipe(payload.data)
  elseif payload.type == 'category' then
    Admin.SaveCategory(payload.data)
  elseif payload.type == 'blueprint' then
    Admin.SaveBlueprint(payload.data)
  elseif payload.type == 'benchType' then
    Admin.SaveBenchType(payload.data)
  elseif payload.type == 'benchLocation' then
    Admin.SaveBenchLocation(payload.data)
  end
  TriggerClientEvent('sal_crafting:client:snapshot', -1, Cache.GetSnapshot())
end)

RegisterNetEvent('sal_crafting:server:admin_delete', function(token, payload)
  local source = source
  if not Security.ValidateNonce(source, token) then
    return
  end
  if not Security.RateLimit(source, 'admin') then
    return
  end
  if not Security.IsAdmin(source) then
    return
  end
  if payload.type == 'recipe' then
    Admin.DeleteRecipe(payload.id)
  elseif payload.type == 'category' then
    Admin.DeleteCategory(payload.id)
  elseif payload.type == 'blueprint' then
    Admin.DeleteBlueprint(payload.id)
  elseif payload.type == 'benchType' then
    Admin.DeleteBenchType(payload.id)
  elseif payload.type == 'benchLocation' then
    Admin.DeleteBenchLocation(payload.id)
  end
  TriggerClientEvent('sal_crafting:client:snapshot', -1, Cache.GetSnapshot())
end)

RegisterNetEvent('sal_crafting:server:admin_teleport', function(token, payload)
  local source = source
  if not Security.ValidateNonce(source, token) then
    return
  end
  if not Security.RateLimit(source, 'admin') then
    return
  end
  if not Security.IsAdmin(source) then
    return
  end
  local location = Cache.benchLocations[payload.id]
  if not location or not location.coords then
    return
  end
  local ped = GetPlayerPed(source)
  if ped and ped ~= 0 then
    SetEntityCoords(ped, location.coords.x, location.coords.y, location.coords.z, false, false, false, false)
  end
end)

RegisterNetEvent('sal_crafting:server:request_queue', function(token)
  local source = source
  if not Security.ValidateNonce(source, token) then
    return
  end
  local identifier = Bridge.GetIdentifier(Bridge.GetPlayer(source))
  local queue = Queue.GetPlayerQueue(identifier)
  TriggerClientEvent('sal_crafting:client:queue', source, queue)
end)

RegisterNetEvent('sal_crafting:server:close', function()
  local source = source
  Security.ClearNonce(source)
end)
