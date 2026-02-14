Sound = {}

local backend = 'none'

local function resourceStarted(name)
    return GetResourceState(name) == 'started'
end

local function pickBackend()
    if not Config.Sound.Enabled then
        return 'none'
    end

    local desired = tostring(Config.Sound.Backend or 'none'):lower()
    if desired == 'xsound' and resourceStarted('xsound') then
        return 'xsound'
    end

    if desired == 'interactsound' and resourceStarted('interact-sound') then
        return 'interactsound'
    end

    if desired == 'native' then
        return 'native'
    end

    return 'none'
end

CreateThread(function()
    backend = pickBackend()
end)

local function validName(name)
    return name and Config.Sound.Names[name]
end

function Sound:PlayFrontend(name, volume)
    if backend == 'none' then
        return
    end

    if not validName(name) then
        return
    end

    local snd = Config.Sound.Names[name]
    local vol = volume or 0.25

    if backend == 'xsound' then
        exports.xsound:PlayUrlPos(snd, Config.Sound.Files[snd] or snd, vol, GetEntityCoords(PlayerPedId()), false)
        exports.xsound:Distance(snd, 1.0)
        return
    end

    if backend == 'interactsound' then
        TriggerServerEvent('InteractSound_SV:PlayOnSource', snd, vol)
        return
    end

    if backend == 'native' then
        PlaySoundFrontend(-1, 'NAV_UP_DOWN', 'HUD_FRONTEND_DEFAULT_SOUNDSET', false)
    end
end

function Sound:PlaySpatial(name, coords, volume, radius)
    if backend == 'none' or not coords or not validName(name) then
        return
    end

    local snd = Config.Sound.Names[name]
    local vol = volume or 0.3

    if backend == 'xsound' then
        exports.xsound:PlayUrlPos(snd, Config.Sound.Files[snd] or snd, vol, coords, false)
        exports.xsound:Distance(snd, radius or 10.0)
        return
    end

    if backend == 'interactsound' then
        TriggerServerEvent('InteractSound_SV:PlayWithinDistance', radius or 10.0, snd, vol)
        return
    end

    if backend == 'native' then
        PlaySoundFromCoord(-1, '10_SEC_WARNING', coords.x, coords.y, coords.z, 'HUD_MINI_GAME_SOUNDSET', false, 0, false)
    end
end

function Sound:Stop(name)
    if backend == 'none' or not validName(name) then
        return
    end

    local snd = Config.Sound.Names[name]
    if backend == 'xsound' then
        exports.xsound:Destroy(snd)
    end
end
