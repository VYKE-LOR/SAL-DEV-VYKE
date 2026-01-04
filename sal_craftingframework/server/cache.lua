local MySQL = require('bridge/mysql')
local Util = require('shared/util')

local Cache = {
  recipes = {},
  categories = {},
  blueprints = {},
  benchTypes = {},
  benchLocations = {},
  loaded = false,
}

local function decodeRow(row)
  if not row then
    return nil
  end
  if row.data and type(row.data) == 'string' then
    local decoded = json.decode(row.data)
    if decoded then
      decoded.id = row.id
      decoded.updatedAt = row.updatedAt
      return decoded
    end
  end
  return row
end

local function loadTable(tableName)
  local rows = MySQL.Query(('SELECT * FROM %s'):format(tableName))
  local data = {}
  for _, row in ipairs(rows or {}) do
    local decoded = decodeRow(row)
    if decoded and decoded.id then
      data[decoded.id] = decoded
    end
  end
  return data
end

function Cache.LoadAll()
  Cache.recipes = loadTable('sal_craft_recipes')
  Cache.categories = loadTable('sal_craft_categories')
  Cache.blueprints = loadTable('sal_craft_blueprints')
  Cache.benchTypes = loadTable('sal_craft_bench_types')
  Cache.benchLocations = loadTable('sal_craft_bench_locations')
  Cache.loaded = true
  Util.Debug('Cache loaded: recipes=%s categories=%s blueprints=%s benchTypes=%s benchLocations=%s',
    tostring(#Cache.recipes), tostring(#Cache.categories), tostring(#Cache.blueprints), tostring(#Cache.benchTypes), tostring(#Cache.benchLocations))
end

function Cache.GetSnapshot()
  return {
    recipes = Util.TableCopy(Cache.recipes),
    categories = Util.TableCopy(Cache.categories),
    blueprints = Util.TableCopy(Cache.blueprints),
    benchTypes = Util.TableCopy(Cache.benchTypes),
    benchLocations = Util.TableCopy(Cache.benchLocations),
  }
end

function Cache.Update(tableName, id, payload)
  Cache[tableName][id] = payload
end

function Cache.Delete(tableName, id)
  Cache[tableName][id] = nil
end

return Cache
