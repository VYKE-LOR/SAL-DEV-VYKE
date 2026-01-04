local MySQL = require('bridge/mysql')
local Inventory = require('bridge/inventory')
local Util = require('shared/util')

local Blueprints = {}

local function hasBlueprintItem(source, blueprintId)
  if not Config.BlueprintItem or Config.BlueprintItem == '' then
    return false
  end
  return Inventory.HasItem(source, Config.BlueprintItem, 1, { blueprintId = blueprintId })
end

function Blueprints.HasBlueprint(source, identifier, blueprintId)
  if Config.BlueprintMode == 'item' then
    return hasBlueprintItem(source, blueprintId)
  end
  if Config.BlueprintMode == 'hybrid' then
    if hasBlueprintItem(source, blueprintId) then
      return true
    end
  end
  local rows = MySQL.Query('SELECT 1 FROM sal_craft_player_blueprints WHERE identifier = ? AND blueprintId = ? LIMIT 1', {
    identifier,
    blueprintId,
  })
  return rows and rows[1] ~= nil
end

function Blueprints.Grant(identifier, blueprintId)
  MySQL.Execute('INSERT IGNORE INTO sal_craft_player_blueprints (identifier, blueprintId, learnedAt, updatedAt) VALUES (?, ?, NOW(), NOW())', {
    identifier,
    blueprintId,
  })
end

function Blueprints.Revoke(identifier, blueprintId)
  MySQL.Execute('DELETE FROM sal_craft_player_blueprints WHERE identifier = ? AND blueprintId = ?', {
    identifier,
    blueprintId,
  })
end

function Blueprints.TryLearnFromItem(source, identifier, blueprintId)
  if Config.BlueprintMode == 'db' then
    return false
  end
  if not hasBlueprintItem(source, blueprintId) then
    return false
  end
  Blueprints.Grant(identifier, blueprintId)
  if Config.BlueprintConsumeOnLearn then
    Inventory.RemoveItem(source, Config.BlueprintItem, 1, { blueprintId = blueprintId })
  end
  return true
end

return Blueprints
