local State = require('client/state')
local Types = require('shared/types')

local function sendNui(name, payload)
  SendNUIMessage({
    action = name,
    data = payload
  })
end

local function sendOpenFromState()
  if not State.IsOpen() then
    return
  end
  SendNUIMessage({
    action = 'sal_crafting:open',
    data = {
      token = State.token,
      player = State.player,
      bench = State.bench,
      admin = State.IsAdmin(),
      snapshot = State.GetSnapshot(),
    }
  })
end

RegisterNUICallback(Types.NuiCallbacks.Ready, function(data, cb)
  State.SetNuiReady(true)
  if State.IsOpen() then
    SetNuiFocus(true, true)
  end
  if not data.token and State.token then
    sendOpenFromState()
  end
  local token = data.token or State.token
  if token then
    TriggerServerEvent('sal_crafting:server:request_snapshot', token)
  end
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.RequestSnapshot, function(data, cb)
  TriggerServerEvent('sal_crafting:server:request_snapshot', data.token)
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.SelectBench, function(data, cb)
  State.bench = data.benchId or data.locationId
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.CraftNow, function(data, cb)
  TriggerServerEvent('sal_crafting:server:craft_now', data.token, data)
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.QueueAdd, function(data, cb)
  TriggerServerEvent('sal_crafting:server:queue_add', data.token, data)
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.QueueClaim, function(data, cb)
  TriggerServerEvent('sal_crafting:server:queue_claim', data.token, data)
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.QueueCancel, function(data, cb)
  TriggerServerEvent('sal_crafting:server:queue_cancel', data.token, data)
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.AdminSaveRecipe, function(data, cb)
  TriggerServerEvent('sal_crafting:server:admin_save', data.token, { type = 'recipe', data = data.recipeData })
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.AdminDeleteRecipe, function(data, cb)
  TriggerServerEvent('sal_crafting:server:admin_delete', data.token, { type = 'recipe', id = data.recipeId })
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.AdminSaveCategory, function(data, cb)
  TriggerServerEvent('sal_crafting:server:admin_save', data.token, { type = 'category', data = data.categoryData })
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.AdminDeleteCategory, function(data, cb)
  TriggerServerEvent('sal_crafting:server:admin_delete', data.token, { type = 'category', id = data.categoryId })
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.AdminSaveBlueprint, function(data, cb)
  TriggerServerEvent('sal_crafting:server:admin_save', data.token, { type = 'blueprint', data = data.blueprintData })
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.AdminDeleteBlueprint, function(data, cb)
  TriggerServerEvent('sal_crafting:server:admin_delete', data.token, { type = 'blueprint', id = data.blueprintId })
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.AdminSaveBenchType, function(data, cb)
  TriggerServerEvent('sal_crafting:server:admin_save', data.token, { type = 'benchType', data = data.benchTypeData })
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.AdminDeleteBenchType, function(data, cb)
  TriggerServerEvent('sal_crafting:server:admin_delete', data.token, { type = 'benchType', id = data.benchTypeId })
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.AdminSaveBenchLocation, function(data, cb)
  TriggerServerEvent('sal_crafting:server:admin_save', data.token, { type = 'benchLocation', data = data.benchLocationData })
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.AdminDeleteBenchLocation, function(data, cb)
  TriggerServerEvent('sal_crafting:server:admin_delete', data.token, { type = 'benchLocation', id = data.benchLocationId })
  cb({ ok = true })
end)

RegisterNUICallback(Types.NuiCallbacks.AdminTeleportBenchLocation, function(data, cb)
  TriggerServerEvent('sal_crafting:server:admin_teleport', data.token, { id = data.locationId })
  cb({ ok = true })
end)

RegisterNUICallback('close', function(data, cb)
  SetNuiFocus(false, false)
  State.SetOpen(false)
  State.SetNuiReady(false)
  TriggerServerEvent('sal_crafting:server:close')
  cb({ ok = true })
end)

return {
  sendNui = sendNui
}
