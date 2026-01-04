local Util = require('shared/util')
local Bridge = require('bridge/framework')

local Security = {
  nonces = {},
  rateLimits = {},
}

local function nowMs()
  return GetGameTimer()
end

function Security.NewNonce(source)
  local nonce = tostring(math.random(100000, 999999)) .. tostring(os.time()) .. tostring(source)
  Security.nonces[source] = {
    token = nonce,
    createdAt = nowMs(),
  }
  return nonce
end

function Security.ValidateNonce(source, token)
  local entry = Security.nonces[source]
  if not entry then
    return false
  end
  return entry.token == token
end

function Security.ClearNonce(source)
  Security.nonces[source] = nil
end

function Security.RateLimit(source, key)
  local limitConfig = Config.RateLimits[key]
  if not limitConfig then
    return true
  end
  local bucket = Security.rateLimits[source]
  if not bucket then
    bucket = {}
    Security.rateLimits[source] = bucket
  end
  local entry = bucket[key]
  if not entry then
    entry = { count = 0, windowStart = nowMs() }
    bucket[key] = entry
  end
  local now = nowMs()
  if now - entry.windowStart > limitConfig.window then
    entry.count = 0
    entry.windowStart = now
  end
  entry.count = entry.count + 1
  return entry.count <= limitConfig.limit
end

function Security.IsAdmin(source)
  local player = Bridge.GetPlayer(source)
  if not player then
    return false
  end
  local identifier = Bridge.GetIdentifier(player)
  if identifier then
    for _, allowed in ipairs(Config.AdminAccess.identifiers or {}) do
      if allowed == identifier then
        return true
      end
    end
    for _, allowed in ipairs(Config.AdminAccess.permissionKeys or {}) do
      if allowed == identifier then
        return true
      end
    end
  end

  local job = Bridge.GetJob(player)
  local allowedJobs = Config.AdminAccess.jobs or {}
  if allowedJobs[job.name] and job.grade >= allowedJobs[job.name] then
    return true
  end

  for _, allowed in ipairs(Config.AdminAccess.permissionKeys or {}) do
    if allowed == job.name then
      return true
    end
  end

  return false
end

return Security
