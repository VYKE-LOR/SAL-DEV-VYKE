fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'sal_fdgates'
author 'SAL'
description 'Fire Department gate control with sync + editor'
version '1.0.0'

dependencies {
    'es_extended',
    'xsound'
}

shared_script 'config.lua'
server_script 'server.lua'
client_script 'client.lua'
