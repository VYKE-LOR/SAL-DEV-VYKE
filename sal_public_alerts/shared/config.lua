Config = {}

Config.Locale = 'de'

Config.App = {
    Identifier = 'sal_desps_public_alert',
    Label = 'DESPS Public Alert',
    ShortName = 'Public Alert',
    Description = 'Offizielle Notfallmeldungen des Department of Emergency Services & Public Safety.',
    Icon = 'fa-triangle-exclamation',
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
    SeverityOptions = { 'critical', 'warning', 'info' },
    DefaultCategory = 'general',
    Categories = { 'general', 'weather', 'fire', 'police', 'medical', 'test' }
}

Config.HistoryLimit = 25

Config.OfflineReplayNotification = true

Config.Scenarios = {
    {
        id = 'emergency_warning',
        label = 'Notfallwarnung',
        severity = 'CRITICAL',
        defaultTitle = 'NOTFALLWARNUNG',
        template = 'DESPS NOTFALLWARNUNG – {AREA}. {INSTRUCTIONS} Folgen Sie Anweisungen der Behörden. Weitere Updates folgen.',
        defaultInstructions = 'Verlassen Sie gefährdete Bereiche und suchen Sie Schutz.'
    },
    {
        id = 'disaster_alarm',
        label = 'Katastrophenalarm',
        severity = 'CRITICAL',
        defaultTitle = 'KATASTROPHENALARM',
        template = 'DESPS KATASTROPHENALARM – {AREA}. {INSTRUCTIONS} Meiden Sie Straßen und halten Sie Notfallvorräte bereit.',
        defaultInstructions = 'Bleiben Sie in sicheren Gebäuden und vermeiden Sie unnötige Fahrten.'
    },
    {
        id = 'evacuation_order',
        label = 'Evakuierungsanordnung',
        severity = 'CRITICAL',
        defaultTitle = 'EVAKUIERUNG',
        template = 'EVAKUIERUNG – {AREA}. {INSTRUCTIONS} Nutzen Sie ausgewiesene Routen und helfen Sie Nachbarn, wenn möglich.',
        defaultInstructions = 'Verlassen Sie das Gebiet sofort. Folgen Sie den Evakuierungsrouten.'
    },
    {
        id = 'severe_weather',
        label = 'Unwetterwarnung',
        severity = 'WARNING',
        defaultTitle = 'UNWETTERWARNUNG',
        template = 'UNWETTERWARNUNG – {AREA}. {INSTRUCTIONS} Sichern Sie lose Gegenstände. Vermeiden Sie Küsten- und Bergregionen.',
        defaultInstructions = 'Suchen Sie Schutz und vermeiden Sie offene Flächen.'
    },
    {
        id = 'hazmat_incident',
        label = 'Gefahrstofflage',
        severity = 'CRITICAL',
        defaultTitle = 'GEFAHRSTOFFWARNUNG',
        template = 'GEFAHRSTOFFWARNUNG – {AREA}. {INSTRUCTIONS} Fenster/Türen schließen. Lüftung ausschalten. Warten Sie auf Entwarnung.',
        defaultInstructions = 'Bleiben Sie innen. Schließen Sie Fenster/Türen. Warten Sie auf Updates.'
    },
    {
        id = 'test_warning',
        label = 'Testwarnung',
        severity = 'TEST',
        defaultTitle = 'TESTWARNUNG',
        template = 'TESTWARNUNG – {AREA}. Dies ist ein Test des öffentlichen Warnsystems. Es besteht keine Gefahr.',
        defaultInstructions = 'Keine Aktion erforderlich.'
    }
}

Config.Sound = {
    UseNativeAudio = true,
    NativeAudioName = 'desps_critical_alarm',
    UseXSound = true,
    File = 'ui/sounds/alert.ogg',
    Volume = 0.8
}

Config.Logging = {
    Enabled = true,
    Debug = false,
    Webhook = ''
}
