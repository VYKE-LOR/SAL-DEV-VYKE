local Cache = require('server/cache')
local MySQL = require('bridge/mysql')
local Util = require('shared/util')

local Admin = {}

local function upsert(cacheName, dbTable, payload)
  local id = payload.id
  payload.updatedAt = os.time()
  local data = json.encode(payload)
  if Cache[cacheName][id] then
    MySQL.Execute(('UPDATE %s SET data = ?, updatedAt = NOW() WHERE id = ?'):format(dbTable), { data, id })
  else
    MySQL.Execute(('INSERT INTO %s (id, data, updatedAt) VALUES (?, ?, NOW())'):format(dbTable), { id, data })
  end
  Cache.Update(cacheName, id, payload)
end

local function deleteRow(cacheName, dbTable, id)
  MySQL.Execute(('DELETE FROM %s WHERE id = ?'):format(dbTable), { id })
  Cache.Delete(cacheName, id)
end

function Admin.SaveRecipe(payload)
  upsert('recipes', 'sal_craft_recipes', payload)
end

function Admin.DeleteRecipe(id)
  deleteRow('recipes', 'sal_craft_recipes', id)
end

function Admin.SaveCategory(payload)
  upsert('categories', 'sal_craft_categories', payload)
end

function Admin.DeleteCategory(id)
  deleteRow('categories', 'sal_craft_categories', id)
end

function Admin.SaveBlueprint(payload)
  upsert('blueprints', 'sal_craft_blueprints', payload)
end

function Admin.DeleteBlueprint(id)
  deleteRow('blueprints', 'sal_craft_blueprints', id)
end

function Admin.SaveBenchType(payload)
  upsert('benchTypes', 'sal_craft_bench_types', payload)
end

function Admin.DeleteBenchType(id)
  deleteRow('benchTypes', 'sal_craft_bench_types', id)
end

function Admin.SaveBenchLocation(payload)
  upsert('benchLocations', 'sal_craft_bench_locations', payload)
end

function Admin.DeleteBenchLocation(id)
  deleteRow('benchLocations', 'sal_craft_bench_locations', id)
end

return Admin
