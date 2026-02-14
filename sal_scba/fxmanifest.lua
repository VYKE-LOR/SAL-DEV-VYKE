fx_version 'cerulean'
game 'gta5'

lua54 'yes'

author 'SAL'
description 'sal_scba - Standalone SCBA system for ESX Legacy'
version '1.0.0'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/config.lua'
}

client_scripts {
    'client/sound.lua',
    'client/ui.lua',
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/app.js'
    -- If you want custom sounds later, add your own files in this resource
    -- and reference their names/paths in shared/config.lua (Config.Sound.Files).
}
