fx_version 'cerulean'
game 'gta5'

lua54 'yes'

name 'sal_public_alerts'
author 'SAL'
description 'DESPS Public Alert lb-phone app'
version '1.0.0'

shared_scripts {
    'shared/config.lua',
    'shared/locales/de.lua'
}

client_scripts {
    'client/cl_main.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/sv_db.lua',
    'server/sv_main.lua'
}

files {
    'ui/index.html',
    'ui/styles.css',
    'ui/app.js',
    'ui/assets/*',
    'ui/sounds/*'
}

dependencies {
    'lb-phone',
    'es_extended',
    'oxmysql'
}

optional_dependencies {
    'xsound'
}
