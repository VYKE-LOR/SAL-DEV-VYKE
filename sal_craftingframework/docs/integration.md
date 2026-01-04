# sal_craftingframework Integration

## Overview
This resource provides a server-authoritative crafting framework with ESX Legacy support (auto-detects QBCore/QBX), jaksam_inventory integration, ox_target bench interactions, and a secure NUI protocol.

## Installation
1. Import `sql/sql.sql` into your database.
2. Add `ensure sal_craftingframework` to your server.cfg after `es_extended` (or qb-core/qbx_core), `oxmysql`, `jaksam_inventory`, and `ox_target`.
3. Configure `sal_craftingframework/config/config.lua`.

To uninstall, run `sql/uninstall.sql`.

## Exports
### Server Exports
```lua
-- Opens the crafting UI for a player
exports['sal_craftingframework']:openUI(source, { locationId = 'bench_001' })

-- Blueprint ownership
exports['sal_craftingframework']:grantBlueprint(identifier, 'bp_assault_rifle')
exports['sal_craftingframework']:revokeBlueprint(identifier, 'bp_assault_rifle')

-- Recipes
exports['sal_craftingframework']:addRecipe({ id = 'lockpick', name = 'Lockpick', ... })
exports['sal_craftingframework']:updateRecipe({ id = 'lockpick', name = 'Lockpick', ... })
exports['sal_craftingframework']:deleteRecipe('lockpick')

-- Benches
exports['sal_craftingframework']:addBenchLocation({ id = 'bench_001', benchType = 'workbench', coords = { x = 0, y = 0, z = 0 }, heading = 0 })
exports['sal_craftingframework']:removeBenchLocation('bench_001')

-- XP
local xp, level = exports['sal_craftingframework']:giveXP(identifier, 100)
local level, currentXp = exports['sal_craftingframework']:getPlayerLevel(identifier)
```

### Client Exports
```lua
exports['sal_craftingframework']:openCraftingUI()
local open = exports['sal_craftingframework']:isCraftingOpen()
```

## Events
### Server Events (consumed by resource)
- `sal_crafting:server:open` (benchContext)
- `sal_crafting:server:craft_now` (token, payload)
- `sal_crafting:server:queue_add` (token, payload)
- `sal_crafting:server:queue_claim` (token, payload)
- `sal_crafting:server:queue_cancel` (token, payload)
- `sal_crafting:server:admin_save` (token, payload)
- `sal_crafting:server:admin_delete` (token, payload)
- `sal_crafting:server:admin_teleport` (token, payload)

### Client Events (emitted by server)
- `sal_crafting:client:open` (payload)
- `sal_crafting:client:snapshot` (snapshot)
- `sal_crafting:client:toast` (payload)
- `sal_crafting:client:queue` (queue)
- `sal_crafting:client:queue_updated` ()
- `sal_crafting:client:progression` (payload)

## NUI Payload Contracts
### Outbound (Lua -> UI)
- `sal_crafting:open`
  ```json
  {
    "token": "nonce",
    "player": { "identifier": "...", "level": 2, "xp": 100 },
    "bench": { "id": "bench_001", "benchType": "workbench", "coords": { "x": 0, "y": 0, "z": 0 } },
    "snapshot": { "recipes": {}, "categories": {}, "benchTypes": {}, "benchLocations": {}, "blueprints": {} }
  }
  ```
- `sal_crafting:updateSnapshot`
  ```json
  { "snapshotPartial": { "queue": [], "player": { "xp": 120, "level": 3 } } }
  ```
- `sal_crafting:toast`
  ```json
  { "type": "success", "title": "Craft complete", "body": "Assault Rifle" }
  ```
- `sal_crafting:close`

### Inbound (UI -> Lua)
- `ui_ready` `{ token }`
- `request_snapshot` `{ token }`
- `select_bench` `{ token, benchId?, locationId? }`
- `craft_now` `{ token, recipeId, amount, locationId? }`
- `queue_add` `{ token, recipeId, amount, locationId? }`
- `queue_claim` `{ token, queueId }`
- `queue_cancel` `{ token, queueId }`
- `admin_save_recipe` `{ token, recipeData }`
- `admin_delete_recipe` `{ token, recipeId }`
- `admin_save_category` `{ token, categoryData }`
- `admin_delete_category` `{ token, categoryId }`
- `admin_save_blueprint` `{ token, blueprintData }`
- `admin_delete_blueprint` `{ token, blueprintId }`
- `admin_save_benchType` `{ token, benchTypeData }`
- `admin_delete_benchType` `{ token, benchTypeId }`
- `admin_save_benchLocation` `{ token, benchLocationData }`
- `admin_delete_benchLocation` `{ token, benchLocationId }`
- `admin_teleport_benchLocation` `{ token, locationId }`

## Data Registration
### Recipes
```lua
exports['sal_craftingframework']:addRecipe({
  id = 'lockpick',
  name = 'Advanced Lockpick',
  desc = 'High durability lockpick',
  categoryId = 'tools',
  benchType = 'workbench',
  craftTime = 20,
  xpReward = 25,
  levelRequirement = 2,
  blueprintRequired = false,
  ingredients = {
    { item = 'steel_ingot', amount = 10 },
    { item = 'plastic', amount = 5 },
  },
  output = { item = 'lockpick', amount = 1 },
})
```

### Bench Locations
```lua
exports['sal_craftingframework']:addBenchLocation({
  id = 'bench_001',
  label = 'Mechanic Workbench',
  benchType = 'workbench',
  coords = { x = 100.0, y = 200.0, z = 30.0 },
  heading = 180.0,
  radius = 3.0,
  access = { public = false, jobs = { mechanic = 0 } }
})
```

## Blueprint Management
```lua
exports['sal_craftingframework']:grantBlueprint(identifier, 'bp_assault_rifle')
exports['sal_craftingframework']:revokeBlueprint(identifier, 'bp_assault_rifle')
```

## XP / Progression
```lua
exports['sal_craftingframework']:giveXP(identifier, 50)
```

## Opening the UI from Items
```lua
RegisterNetEvent('use_portable_bench', function()
  exports['sal_craftingframework']:openUI(source, { locationId = 'portable_bench_001' })
end)
```

## Config Highlights
- `Config.CommandsEnabled`
- `Config.AdminAccess.jobs / identifiers / permissionKeys`
- `Config.BlueprintMode` (`db` | `item` | `hybrid`)
- `Config.XPCurve`
- `Config.RateLimits`
- `Config.PortableBench`

## Item Images
Use:
```lua
local imagePath = exports['jaksam_inventory']:getItemImagePath('item_name')
```
