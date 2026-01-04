local State = require('client/state')
local Nui = require('client/nui')
local Targeting = require('client/target')

RegisterNetEvent('sal_crafting:client:open', function(payload)
  State.SetOpen(true, payload.token, payload.player, payload.bench, payload.admin)
  if State.IsNuiReady() then
    SetNuiFocus(true, true)
    SendNUIMessage({
      action = 'sal_crafting:open',
      data = {
        token = payload.token,
        player = payload.player,
        bench = payload.bench,
        admin = payload.admin,
        snapshot = State.GetSnapshot(),
      }
    })
  else
    SetTimeout(5000, function()
      if State.IsOpen() and not State.IsNuiReady() then
        SetNuiFocus(false, false)
        State.SetOpen(false)
      end
    end)
  end
end)

RegisterNetEvent('sal_crafting:client:snapshot', function(snapshot)
  State.SetSnapshot(snapshot)
  if snapshot and snapshot.benchLocations then
    Targeting.Refresh(snapshot.benchLocations)
  end
  if State.IsOpen() then
    SendNUIMessage({
      action = 'sal_crafting:updateSnapshot',
      data = { snapshotPartial = snapshot }
    })
  end
end)

RegisterNetEvent('sal_crafting:client:toast', function(payload)
  SendNUIMessage({
    action = 'sal_crafting:toast',
    data = payload
  })
end)

RegisterNetEvent('sal_crafting:client:queue_updated', function()
  if State.IsOpen() then
    TriggerServerEvent('sal_crafting:server:request_queue', State.token)
  end
end)

RegisterNetEvent('sal_crafting:client:queue', function(queue)
  SendNUIMessage({
    action = 'sal_crafting:updateSnapshot',
    data = { snapshotPartial = { queue = queue } }
  })
end)

RegisterNetEvent('sal_crafting:client:progression', function(payload)
  SendNUIMessage({
    action = 'sal_crafting:updateSnapshot',
    data = { snapshotPartial = { player = payload } }
  })
end)

RegisterCommand(Config.Commands.OpenUI, function()
  if not Config.CommandsEnabled then
    return
  end
  TriggerServerEvent('sal_crafting:server:open', {})
end, false)

RegisterCommand(Config.Commands.Admin, function()
  if not Config.CommandsEnabled then
    return
  end
  TriggerServerEvent('sal_crafting:server:open', { admin = true })
end, false)
