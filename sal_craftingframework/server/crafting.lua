local Cache = require('server/cache')
local Inventory = require('bridge/inventory')
local Bridge = require('bridge/framework')
local Progression = require('server/progression')
local Blueprints = require('server/blueprints')
local Benches = require('server/benches')
local Queue = require('server/queue')

local Crafting = {}

local function canCraftOnBench(recipe, benchType)
  if not recipe then
    return false
  end
  if recipe.benchTypes and recipe.benchTypes.allow then
    return recipe.benchTypes.allow[benchType] == true
  end
  if recipe.benchTypes and recipe.benchTypes.deny then
    return recipe.benchTypes.deny[benchType] ~= true
  end
  return true
end

local function validateIngredients(source, ingredients, craftAmount)
  for _, ingredient in ipairs(ingredients or {}) do
    local required = (ingredient.amount or 1) * craftAmount
    local count = Inventory.GetItemCount(source, ingredient.item, ingredient.metadata)
    if count < required then
      return false
    end
  end
  return true
end

local function removeIngredients(source, ingredients, craftAmount)
  for _, ingredient in ipairs(ingredients or {}) do
    local required = (ingredient.amount or 1) * craftAmount
    local ok = Inventory.RemoveItem(source, ingredient.item, required, ingredient.metadata)
    if not ok then
      return false
    end
  end
  return true
end

local function canCarryOutput(source, output, amount)
  local totalAmount = (output.amount or 1) * amount
  return Inventory.CanCarryItem(source, output.item, totalAmount, output.metadata)
end

function Crafting.Validate(source, benchLocation, recipeId, amount)
  local recipe = Cache.recipes[recipeId]
  if not recipe then
    return false, 'recipe_not_found'
  end
  if benchLocation and not Benches.IsInRange(source, benchLocation) then
    return false, 'bench_too_far'
  end
  if benchLocation and not Benches.HasAccess(source, benchLocation.access) then
    return false, 'bench_access_denied'
  end
  if benchLocation and not canCraftOnBench(recipe, benchLocation.benchType) then
    return false, 'bench_type_denied'
  end

  local player = Bridge.GetPlayer(source)
  if not player then
    return false, 'player_not_found'
  end
  local identifier = Bridge.GetIdentifier(player)
  local xp, level = Progression.GetPlayerProgress(identifier)
  local requiredLevel = recipe.level or 1
  if level < requiredLevel then
    return false, 'level_too_low'
  end

  if recipe.blueprintId and recipe.blueprintRequired then
    local hasBlueprint = Blueprints.HasBlueprint(source, identifier, recipe.blueprintId)
    if not hasBlueprint then
      return false, 'blueprint_missing'
    end
  end

  if not validateIngredients(source, recipe.ingredients, amount or 1) then
    return false, 'ingredients_missing'
  end

  return true, recipe
end

function Crafting.CraftNow(source, benchLocation, recipeId, amount)
  amount = math.max(1, tonumber(amount) or 1)
  local ok, recipeOrReason = Crafting.Validate(source, benchLocation, recipeId, amount)
  if not ok then
    return false, recipeOrReason
  end
  local recipe = recipeOrReason

  if not canCarryOutput(source, recipe.output, amount) then
    return false, 'cannot_carry'
  end
  if not removeIngredients(source, recipe.ingredients, amount) then
    return false, 'remove_failed'
  end
  local totalAmount = (recipe.output.amount or 1) * amount
  local added = Inventory.AddItem(source, recipe.output.item, totalAmount, recipe.output.metadata)
  if not added then
    return false, 'add_failed'
  end
  return true, recipe
end

function Crafting.QueueAdd(source, benchLocation, recipeId, amount)
  amount = math.max(1, tonumber(amount) or 1)
  local ok, recipeOrReason = Crafting.Validate(source, benchLocation, recipeId, amount)
  if not ok then
    return false, recipeOrReason
  end
  local recipe = recipeOrReason

  if not removeIngredients(source, recipe.ingredients, amount) then
    return false, 'remove_failed'
  end
  local duration = math.max(1, tonumber(recipe.craftTime) or 1) * amount
  local now = os.time()

  local queueId = Queue.AddQueueItem({
    identifier = Bridge.GetIdentifier(Bridge.GetPlayer(source)),
    recipeId = recipeId,
    amount = amount,
    benchType = benchLocation and benchLocation.benchType or recipe.benchType,
    status = 'queued',
    startedAt = now,
    endAt = now + duration,
    payload = { output = recipe.output, xp = recipe.xpReward or 0 },
  })

  return true, queueId
end

return Crafting
