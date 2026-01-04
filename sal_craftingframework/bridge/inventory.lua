local Inventory = {}

local function ensureInventory()
  if GetResourceState('jaksam_inventory') ~= 'started' then
    error('[sal_craftingframework] jaksam_inventory is not running. Resource cannot start.')
  end
end

function Inventory.HasItem(source, item, amount, metadata)
  ensureInventory()
  return exports['jaksam_inventory']:hasItem(source, item, amount or 1, metadata)
end

function Inventory.GetItemCount(source, item, metadata)
  ensureInventory()
  return exports['jaksam_inventory']:getTotalItemAmount(source, item, metadata)
end

function Inventory.RemoveItem(source, item, amount, metadata)
  ensureInventory()
  return exports['jaksam_inventory']:removeItem(source, item, amount, metadata)
end

function Inventory.AddItem(source, item, amount, metadata)
  ensureInventory()
  return exports['jaksam_inventory']:addItem(source, item, amount, metadata)
end

function Inventory.CanCarryItem(source, item, amount, metadata)
  ensureInventory()
  return exports['jaksam_inventory']:canCarryItem(source, item, amount, metadata)
end

function Inventory.GetItemImagePath(item)
  ensureInventory()
  return exports['jaksam_inventory']:getItemImagePath(item)
end

return Inventory
