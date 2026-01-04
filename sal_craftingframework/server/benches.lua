local Cache = require('server/cache')
local Bridge = require('bridge/framework')

local Benches = {}

function Benches.GetBenchType(benchTypeId)
  return Cache.benchTypes[benchTypeId]
end

function Benches.GetBenchLocation(locationId)
  return Cache.benchLocations[locationId]
end

function Benches.HasAccess(source, access)
  if not access then
    return true
  end
  if access.public then
    return true
  end
  local player = Bridge.GetPlayer(source)
  if not player then
    return false
  end
  local job = Bridge.GetJob(player)
  if access.jobs and access.jobs[job.name] then
    local minGrade = access.jobs[job.name]
    return job.grade >= minGrade
  end
  if access.grades and access.grades[job.name] then
    local minGrade = access.grades[job.name]
    return job.grade >= minGrade
  end
  if access.permissionKeys and access.permissionKeys[job.name] then
    return true
  end
  return false
end

function Benches.IsInRange(source, benchLocation)
  if not benchLocation or not benchLocation.coords then
    return false
  end
  local ped = GetPlayerPed(source)
  if not ped or ped == 0 then
    return false
  end
  local coords = GetEntityCoords(ped)
  local dist = #(coords - vector3(benchLocation.coords.x, benchLocation.coords.y, benchLocation.coords.z))
  return dist <= (benchLocation.radius or Config.BenchDistance)
end

return Benches
