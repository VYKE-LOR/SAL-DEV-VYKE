local fadeDurationMs = 1100
local esxLoaded = false
local ESX = nil

RegisterNetEvent('esx:playerLoaded', function()
  esxLoaded = true
end)

local function tryGetESX()
  if ESX ~= nil then
    return
  end

  if GetResourceState('es_extended') ~= 'started' then
    return
  end

  if exports['es_extended'] and exports['es_extended'].getSharedObject then
    ESX = exports['es_extended']:getSharedObject()
  else
    TriggerEvent('esx:getSharedObject', function(obj)
      ESX = obj
    end)
  end
end

CreateThread(function()
  while not NetworkIsSessionStarted() do
    Wait(250)
  end

  while not NetworkIsPlayerActive(PlayerId()) do
    Wait(250)
  end

  local attempts = 0
  while ESX == nil and attempts < 20 do
    tryGetESX()
    attempts = attempts + 1
    if ESX == nil then
      Wait(250)
    end
  end

  if ESX ~= nil then
    if ESX.IsPlayerLoaded and ESX.IsPlayerLoaded() then
      esxLoaded = true
    end

    while not esxLoaded do
      if ESX.IsPlayerLoaded and ESX.IsPlayerLoaded() then
        esxLoaded = true
        break
      end
      Wait(250)
    end
  end

  SendLoadingScreenMessage(json.encode({ eventName = 'sal:finish' }))
  Wait(fadeDurationMs)
  ShutdownLoadingScreenNui()
  ShutdownLoadingScreen()
  SetNuiFocus(false, false)
  SetMouseCursorVisible(false)
end)
