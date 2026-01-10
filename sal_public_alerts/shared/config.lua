Config = {}

Config.Locale = 'de'

Config.App = {
    Identifier = 'sal_desps_public_alert',
    Label = 'DESPS Public Alert',
    ShortName = 'Public Alert',
    Description = 'Offizielle Notfallmeldungen des Department of Emergency Services & Public Safety.',
    Icon = 'fa-triangle-exclamation'
}

Config.Senders = {
    { job = 'gov', minGrade = 9 }
}

Config.AcePermission = 'sal.publicalerts.send'

Config.RateLimit = {
    SenderLimit = 3,
    SenderWindowSeconds = 60,
    GlobalCooldownSeconds = 15
}

Config.Alert = {
    TitleMax = 60,
    MessageMax = 600,
    DefaultSeverity = 5,
    DefaultExpiresHours = 48,
    Categories = { 'critical', 'weather', 'fire', 'police', 'medical', 'test' }
}

Config.OfflineReplayNotification = true

Config.Sound = {
    system = 'native',
    name = 'desps_critical_alarm',
    url = '',
    volume = 0.8,
    durationMs = 8000,
    repeatSound = {
        enabled = true,
        times = 2,
        intervalMs = 1200
    },
    respectPhoneMute = true
}

Config.Logging = {
    Enabled = true,
    Webhook = ''
}
