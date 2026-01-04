local Cache = require('server/cache')
local Blueprints = require('server/blueprints')
local Progression = require('server/progression')
local Admin = require('server/admin')

exports('openUI', function(source, benchContext)
  TriggerClientEvent('sal_crafting:client:open', source, benchContext or {})
end)

exports('grantBlueprint', function(identifier, blueprintId)
  Blueprints.Grant(identifier, blueprintId)
end)

exports('revokeBlueprint', function(identifier, blueprintId)
  Blueprints.Revoke(identifier, blueprintId)
end)

exports('addRecipe', function(recipeData)
  Admin.SaveRecipe(recipeData)
end)

exports('updateRecipe', function(recipeData)
  Admin.SaveRecipe(recipeData)
end)

exports('deleteRecipe', function(recipeId)
  Admin.DeleteRecipe(recipeId)
end)

exports('addBenchLocation', function(locationData)
  Admin.SaveBenchLocation(locationData)
end)

exports('removeBenchLocation', function(locationId)
  Admin.DeleteBenchLocation(locationId)
end)

exports('giveXP', function(identifier, amount)
  return Progression.AddXP(identifier, amount)
end)

exports('getPlayerLevel', function(identifier)
  local xp, level = Progression.GetPlayerProgress(identifier)
  return level, xp
end)
