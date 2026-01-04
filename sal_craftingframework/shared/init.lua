local resourceName = 'sal_craftingframework'

if not package then
  package = { loaded = {} }
end

if not package.loaded then
  package.loaded = {}
end

local function loadModule(moduleName)
  local file = ('%s.lua'):format(moduleName)
  local initFile = ('%s/init.lua'):format(moduleName)
  local content = LoadResourceFile(resourceName, file)
  local chunkName = ('@%s/%s'):format(resourceName, file)
  if not content then
    content = LoadResourceFile(resourceName, initFile)
    chunkName = ('@%s/%s'):format(resourceName, initFile)
  end
  if not content then
    return nil
  end
  local chunk, err = load(content, chunkName, 't', _ENV)
  if not chunk then
    error(err)
  end
  return chunk()
end

local originalRequire = _G.require

function _G.require(moduleName)
  if package.loaded[moduleName] then
    return package.loaded[moduleName]
  end
  local loaded = loadModule(moduleName)
  if loaded ~= nil then
    package.loaded[moduleName] = loaded
    return loaded
  end
  if originalRequire then
    return originalRequire(moduleName)
  end
  error(('module %q not found'):format(moduleName))
end
