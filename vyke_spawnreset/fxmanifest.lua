fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'vyke_spawnreset'
author 'VYKE'
description 'Fixes first spawn falling through map by re-grounding the player after multicharacter spawn.'
version '1.0.0'

dependencies {
    'es_extended'
}

shared_script 'config.lua'
client_script 'client.lua'
