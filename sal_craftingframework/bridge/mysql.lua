local MySQL = {}

local adapter = nil

local function detectAdapter()
  if GetResourceState('oxmysql') == 'started' then
    adapter = 'oxmysql'
    return
  end
  if GetResourceState('mysql-async') == 'started' then
    adapter = 'mysql-async'
    return
  end
  if GetResourceState('ghmattimysql') == 'started' then
    adapter = 'ghmattimysql'
    return
  end
end

detectAdapter()

function MySQL.GetAdapter()
  return adapter
end

local function ensureAdapter()
  if not adapter then
    error('[sal_craftingframework] No MySQL adapter detected. Install oxmysql, mysql-async, or ghmattimysql.')
  end
end

function MySQL.Query(query, params)
  ensureAdapter()
  if adapter == 'oxmysql' then
    return exports.oxmysql:query_async(query, params)
  end
  if adapter == 'mysql-async' then
    return exports['mysql-async']:mysql_query_async(query, params)
  end
  if adapter == 'ghmattimysql' then
    return exports.ghmattimysql:executeSync(query, params)
  end
  return {}
end

function MySQL.Execute(query, params)
  ensureAdapter()
  if adapter == 'oxmysql' then
    return exports.oxmysql:update_async(query, params)
  end
  if adapter == 'mysql-async' then
    return exports['mysql-async']:mysql_execute_async(query, params)
  end
  if adapter == 'ghmattimysql' then
    return exports.ghmattimysql:executeSync(query, params)
  end
  return 0
end

function MySQL.Insert(query, params)
  ensureAdapter()
  if adapter == 'oxmysql' then
    return exports.oxmysql:insert_async(query, params)
  end
  if adapter == 'mysql-async' then
    return exports['mysql-async']:mysql_insert_async(query, params)
  end
  if adapter == 'ghmattimysql' then
    return exports.ghmattimysql:executeSync(query, params)
  end
  return nil
end

function MySQL.Transaction(queries)
  ensureAdapter()
  if adapter == 'oxmysql' then
    return exports.oxmysql:transaction_async(queries)
  end
  if adapter == 'mysql-async' then
    return exports['mysql-async']:mysql_transaction_async(queries)
  end
  if adapter == 'ghmattimysql' then
    for _, query in ipairs(queries) do
      exports.ghmattimysql:executeSync(query.query, query.values)
    end
    return true
  end
  return false
end

return MySQL
