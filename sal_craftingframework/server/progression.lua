local MySQL = require('bridge/mysql')

local Progression = {}

function Progression.GetLevelFromXP(xp)
  local level = 1
  local currentXP = xp or 0
  local base = Config.XPCurve.base
  local multiplier = Config.XPCurve.multiplier
  for i = 1, Config.XPCurve.maxLevel do
    local needed = math.floor(base * (multiplier ^ (i - 1)))
    if currentXP >= needed then
      currentXP = currentXP - needed
      level = i + 1
    else
      break
    end
  end
  if level > Config.XPCurve.maxLevel then
    level = Config.XPCurve.maxLevel
  end
  return level
end

function Progression.GetPlayerProgress(identifier)
  local rows = MySQL.Query('SELECT xp FROM sal_craft_player_progress WHERE identifier = ? LIMIT 1', { identifier })
  local xp = 0
  if rows and rows[1] then
    xp = tonumber(rows[1].xp) or 0
  end
  return xp, Progression.GetLevelFromXP(xp)
end

function Progression.AddXP(identifier, amount)
  local rows = MySQL.Query('SELECT xp FROM sal_craft_player_progress WHERE identifier = ? LIMIT 1', { identifier })
  local xp = amount
  if rows and rows[1] then
    xp = (tonumber(rows[1].xp) or 0) + amount
    MySQL.Execute('UPDATE sal_craft_player_progress SET xp = ?, updatedAt = NOW() WHERE identifier = ?', { xp, identifier })
  else
    MySQL.Execute('INSERT INTO sal_craft_player_progress (identifier, xp, updatedAt) VALUES (?, ?, NOW())', { identifier, xp })
  end
  return xp, Progression.GetLevelFromXP(xp)
end

return Progression
