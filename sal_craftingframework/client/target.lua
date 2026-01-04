local Target = require('bridge/target')

local Targeting = {
  zones = {}
}

local function clearZones()
  for _, zoneId in pairs(Targeting.zones) do
    Target.RemoveZone(zoneId)
  end
  Targeting.zones = {}
end

local function addBenchZone(bench)
  local zoneId = Target.AddSphereZone({
    coords = vector3(bench.coords.x, bench.coords.y, bench.coords.z),
    radius = bench.radius or Config.BenchDistance,
    debug = Config.Debug,
    options = {
      {
        label = bench.label or 'Crafting Bench',
        icon = 'hammer',
        onSelect = function()
          TriggerServerEvent('sal_crafting:server:open', { locationId = bench.id })
        end
      }
    }
  })
  if zoneId then
    Targeting.zones[bench.id] = zoneId
  end
end

function Targeting.Refresh(benchLocations)
  if not Target.IsAvailable() then
    return
  end
  clearZones()
  for _, bench in pairs(benchLocations or {}) do
    addBenchZone(bench)
  end
end

RegisterNetEvent('sal_crafting:client:update_targets', function(benchLocations)
  Targeting.Refresh(benchLocations)
end)

return Targeting
