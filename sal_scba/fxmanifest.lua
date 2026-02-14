fx_version 'cerulean'
game 'gta5'

lua54 'yes'

author 'SAL'
description 'sal_scba - Standalone SCBA system for ESX Legacy'
version '1.0.1'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/config.lua'
}

client_scripts {
    'client/sound.lua',
    'client/ui.lua',
    'client/visuals.lua',
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}

ui_page 'ui/index.html'

files {
    'ui/index.html',
    'ui/style.css',
    'ui/app.js'
    -- If you want custom sounds later, add your own files in this resource
    -- and reference their names/paths in shared/config.lua (Config.Sound.Files).
}
