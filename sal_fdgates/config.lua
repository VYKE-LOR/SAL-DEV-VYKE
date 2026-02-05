Config = {}

Config.FireJob = 'firefighter'
Config.MinGrade = 0
Config.AdminGroups = { 'admin', 'superadmin' }

Config.DefaultDoorRate = 1.0
Config.DefaultOpenRatio = 1.0
Config.DefaultDoorMode = 'doorsystem'

Config.MenuCommand = 'fdgates'

Config.Sound = {
    Url = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
    Identifier = 'fdgate_beep',
    Volume = 0.45,
    Distance = 20.0,
    DestroyMs = 1800
}

Config.PanelProps = {
    doorPanelModel = `prop_button_01`,
    allPanelModel = `prop_cs_elecbox_01`,
    bigRedButtonModel = `xm3_prop_xm3_button_01a`,
    zOffset = 0.0
}

Config.StationAlarm = {
    enabled = true,
    coords = vec3(1200.0, -1470.0, 34.0),
    distance = 120.0,
    url = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
    volume = 0.7,
    destroyMs = 12000
}

Config.Editor = {
    Enabled = true,
    AllowEveryone = false,
    AllowJob = true
}
