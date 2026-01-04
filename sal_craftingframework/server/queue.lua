local MySQL = require('bridge/mysql')
local Util = require('shared/util')
local Cache = require('server/cache')

local Queue = {
  items = {},
  scheduler = {
    running = false,
    nextDueAt = nil,
  }
}

local function loadQueue()
  local rows = MySQL.Query('SELECT * FROM sal_craft_queue WHERE status IN ("queued", "progress")')
  for _, row in ipairs(rows or {}) do
    Queue.items[row.id] = row
  end
end

local function getEarliest()
  local earliest = nil
  for _, item in pairs(Queue.items) do
    local endAt = tonumber(item.endAt)
    if item.status ~= 'ready' and endAt then
      if not earliest or endAt < earliest.endAt then
        earliest = item
      end
    end
  end
  return earliest
end

local function scheduleNext()
  local nextItem = getEarliest()
  if not nextItem then
    Queue.scheduler.running = false
    Queue.scheduler.nextDueAt = nil
    return
  end

  local now = Util.NowSeconds()
  local dueIn = math.max(0, nextItem.endAt - now)
  Queue.scheduler.running = true
  Queue.scheduler.nextDueAt = nextItem.endAt

  SetTimeout(dueIn * 1000, function()
    local current = getEarliest()
    if not current then
      scheduleNext()
      return
    end
    local nowSeconds = Util.NowSeconds()
    if current.endAt > nowSeconds then
      scheduleNext()
      return
    end
    current.status = 'ready'
    MySQL.Execute('UPDATE sal_craft_queue SET status = "ready", updatedAt = NOW() WHERE id = ?', { current.id })
    scheduleNext()
  end)
end

function Queue.Init()
  loadQueue()
  scheduleNext()
end

function Queue.AddQueueItem(queueData)
  local id = MySQL.Insert('INSERT INTO sal_craft_queue (identifier, recipeId, amount, benchType, status, startedAt, endAt, payload, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())', {
    queueData.identifier,
    queueData.recipeId,
    queueData.amount,
    queueData.benchType,
    queueData.status,
    queueData.startedAt,
    queueData.endAt,
    json.encode(queueData.payload or {}),
  })
  queueData.id = id
  Queue.items[id] = queueData
  if not Queue.scheduler.running or (queueData.endAt and queueData.endAt < (Queue.scheduler.nextDueAt or math.huge)) then
    scheduleNext()
  end
  return id
end

function Queue.Claim(queueId, identifier)
  local item = Queue.items[queueId]
  if not item or item.identifier ~= identifier then
    return false, 'not_found'
  end
  if item.status ~= 'ready' then
    return false, 'not_ready'
  end
  item.status = 'claimed'
  MySQL.Execute('UPDATE sal_craft_queue SET status = "claimed", updatedAt = NOW() WHERE id = ?', { queueId })
  Queue.items[queueId] = item
  return true, item
end

function Queue.Cancel(queueId, identifier)
  local item = Queue.items[queueId]
  if not item or item.identifier ~= identifier then
    return false
  end
  if item.status == 'ready' or item.status == 'claimed' then
    return false
  end
  Queue.items[queueId] = nil
  MySQL.Execute('DELETE FROM sal_craft_queue WHERE id = ?', { queueId })
  scheduleNext()
  return true
end

function Queue.GetPlayerQueue(identifier)
  local rows = MySQL.Query('SELECT * FROM sal_craft_queue WHERE identifier = ? ORDER BY startedAt DESC', { identifier })
  return rows or {}
end

return Queue
