local Target = {}

local function ensureTarget()
  if GetResourceState('ox_target') ~= 'started' then
    return false
  end
  return true
end

function Target.IsAvailable()
  return ensureTarget()
end

function Target.AddSphereZone(data)
  if not ensureTarget() then
    return nil
  end
  return exports.ox_target:addSphereZone(data)
end

function Target.RemoveZone(id)
  if not ensureTarget() then
    return
  end
  exports.ox_target:removeZone(id)
end

return Target
