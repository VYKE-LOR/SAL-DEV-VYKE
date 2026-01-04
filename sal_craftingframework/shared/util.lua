local Util = {}

function Util.Debug(message, ...)
  if not Config or not Config.DebugPrints then
    return
  end
  local formatted = message
  if select('#', ...) > 0 then
    formatted = string.format(message, ...)
  end
  print(('[sal_craftingframework] %s'):format(formatted))
end

function Util.TableCopy(tbl)
  local copy = {}
  for k, v in pairs(tbl or {}) do
    if type(v) == 'table' then
      copy[k] = Util.TableCopy(v)
    else
      copy[k] = v
    end
  end
  return copy
end

function Util.NowSeconds()
  return os.time()
end

function Util.MakeIdentifier(player)
  if not player then
    return nil
  end
  if player.identifier then
    return player.identifier
  end
  if player.citizenid then
    return player.citizenid
  end
  return nil
end

function Util.HasValue(list, value)
  if not list then
    return false
  end
  for _, entry in ipairs(list) do
    if entry == value then
      return true
    end
  end
  return false
end

function Util.StringSplit(input, separator)
  if not input or input == '' then
    return {}
  end
  separator = separator or ','
  local fields = {}
  local pattern = string.format('([^%s]+)', separator)
  input:gsub(pattern, function(c)
    fields[#fields + 1] = c
  end)
  return fields
end

return Util
