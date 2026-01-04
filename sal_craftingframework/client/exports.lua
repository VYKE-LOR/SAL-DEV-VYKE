local State = require('client/state')

exports('openCraftingUI', function()
  TriggerServerEvent('sal_crafting:server:open', {})
end)

exports('isCraftingOpen', function()
  return State.IsOpen()
end)
