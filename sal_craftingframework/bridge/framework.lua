local Bridge = {}

local framework = nil
local qbCoreName = nil
local isServer = IsDuplicityVersion()

local function detectFramework()
  if GetResourceState('es_extended') == 'started' then
    framework = 'esx'
    return
  end
  if GetResourceState('qbx_core') == 'started' then
    framework = 'qbx'
    qbCoreName = 'qbx_core'
    return
  end
  if GetResourceState('qb-core') == 'started' then
    framework = 'qb'
    qbCoreName = 'qb-core'
    return
  end
end

detectFramework()

function Bridge.GetFramework()
  return framework
end

if isServer then
  local ESX = nil

  if framework == 'esx' then
    ESX = exports['es_extended']:getSharedObject()
  end

  function Bridge.GetPlayer(source)
    if framework == 'esx' then
      return ESX.GetPlayerFromId(source)
    end
    if framework == 'qb' or framework == 'qbx' then
      return exports[qbCoreName]:GetPlayer(source)
    end
    return nil
  end

  function Bridge.GetIdentifier(player)
    if not player then
      return nil
    end
    if framework == 'esx' then
      return player.identifier
    end
    if framework == 'qb' or framework == 'qbx' then
      return player.PlayerData.citizenid
    end
    return nil
  end

  function Bridge.GetJob(player)
    if not player then
      return { name = 'unknown', grade = 0 }
    end
    if framework == 'esx' then
      return { name = player.job.name, grade = player.job.grade }
    end
    if framework == 'qb' or framework == 'qbx' then
      return { name = player.PlayerData.job.name, grade = player.PlayerData.job.grade.level }
    end
    return { name = 'unknown', grade = 0 }
  end

  function Bridge.AddMoney(player, account, amount)
    if not player then
      return false
    end
    if framework == 'esx' then
      player.addAccountMoney(account, amount)
      return true
    end
    if framework == 'qb' or framework == 'qbx' then
      player.Functions.AddMoney(account, amount)
      return true
    end
    return false
  end

  function Bridge.HasGroupAccess(player, access)
    if not access then
      return true
    end
    if access.public then
      return true
    end
    local job = Bridge.GetJob(player)
    if access.jobs and access.jobs[job.name] then
      local minGrade = access.jobs[job.name]
      return job.grade >= minGrade
    end
    if access.grades and access.grades[job.name] then
      local required = access.grades[job.name]
      return job.grade >= required
    end
    if access.permissionKeys and access.permissionKeys[job.name] then
      return true
    end
    return false
  end
else
  function Bridge.GetPlayer()
    return nil
  end
end

return Bridge
