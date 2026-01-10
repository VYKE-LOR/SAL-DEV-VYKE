Config = {}

Config.Locale = 'de'

Config.App = {
    Identifier = 'sal_desps_public_alert',
    Label = 'DESPS Public Alert',
    ShortName = 'Public Alert',
    Description = 'Offizielle Notfallmeldungen des Department of Emergency Services & Public Safety.',
    Icon = 'assets/desps_alert.png',
    FixBlur = true
}

Config.Senders = {
    { job = 'gov', grade = 9 }
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
    DefaultSeverity = 'critical',
    DefaultExpiresHours = 48,
    SeverityOptions = { 'critical', 'warning', 'info' }
}

Config.HistoryLimit = 25

Config.OfflineReplayNotification = true

Config.Sound = {
    UseXSound = true,
    File = 'ui/sounds/alert.ogg',
    Volume = 0.8
}

Config.Logging = {
    Enabled = true,
    Debug = false,
    Webhook = ''
}
