fx_version 'cerulean'

game 'gta5'

lua54 'yes'

name 'sal_craftingframework'
version '1.0.0'

ui_page 'ui/index.html'

files {
  'ui/index.html',
  'ui/package.json',
  'ui/postcss.config.mjs',
  'ui/vite.config.ts',
  'ui/src/**/*',
  'ui/**/*.css',
  'ui/**/*.ts',
  'ui/**/*.tsx',
  'ui/**/*.json'
}

shared_scripts {
  'shared/init.lua',
  'config/config.lua',
  'shared/util.lua',
  'shared/types.lua'
}

client_scripts {
  'bridge/framework.lua',
  'bridge/target.lua',
  'shared/init.lua',
  'client/state.lua',
  'client/nui.lua',
  'client/target.lua',
  'client/main.lua',
  'client/exports.lua'
}

server_scripts {
  'bridge/mysql.lua',
  'bridge/framework.lua',
  'bridge/inventory.lua',
  'shared/init.lua',
  'shared/util.lua',
  'shared/types.lua',
  'server/cache.lua',
  'server/security.lua',
  'server/blueprints.lua',
  'server/progression.lua',
  'server/benches.lua',
  'server/queue.lua',
  'server/crafting.lua',
  'server/admin.lua',
  'server/exports.lua',
  'server/main.lua'
}
