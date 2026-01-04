Config = Config or {}

Config.CommandsEnabled = true
Config.Debug = false
Config.DebugPrints = false

Config.AdminAccess = {
  jobs = {
    ['admin'] = 0,
    ['god'] = 0,
  },
  identifiers = {},
  permissionKeys = {},
}

Config.BlueprintMode = 'db' -- 'db' | 'item' | 'hybrid'
Config.BlueprintItem = 'crafting_blueprint'
Config.BlueprintConsumeOnLearn = false

Config.PortableBench = {
  Enabled = false,
  ItemName = 'portable_bench',
  Model = 'prop_tool_bench02',
  MaxDistance = 3.0,
  Access = {
    public = true,
    jobs = {},
    grades = {},
    permissionKeys = {},
  },
}

Config.RateLimits = {
  craft = { limit = 6, window = 8000 },
  queue = { limit = 6, window = 8000 },
  claim = { limit = 6, window = 8000 },
  admin = { limit = 10, window = 10000 },
}

Config.XPCurve = {
  base = 100,
  multiplier = 1.25,
  maxLevel = 100,
}

Config.BenchDistance = 3.0

Config.DefaultSeeds = {
  Enabled = false,
  Categories = {},
  BenchTypes = {},
  Recipes = {},
  Blueprints = {},
}

Config.Commands = {
  OpenUI = 'crafting',
  Admin = 'craftingadmin',
}

Config.SchedulerGraceSeconds = 2
