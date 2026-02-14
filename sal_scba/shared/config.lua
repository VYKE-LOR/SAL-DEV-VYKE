Config = {}

Config.Debug = false
Config.UsePercent = true

Config.Keys = {
    ToggleSCBA = 38,   -- E
    ToggleMask = 47,   -- G
    Refill = 74,       -- H
    ToggleHUD = 311,   -- K
    TogglePASS = 182   -- L
}

Config.Framework = {
    JobRestricted = false,
    AllowedJobs = {
        firefighter = 0,
        ambulance = 2
    }
}

Config.SCBA = {
    ItemName = 'scba',
    MaxPressure = 100,
    ConsumptionPerSecond = 0.35,
    SprintMultiplier = 1.45,
    SwimMultiplier = 1.6,
    LowThreshold = 35,
    VeryLowThreshold = 15,
    EmptyThreshold = 1,
    OutOfAirDamage = 2,
    OutOfAirDamageIntervalMs = 2000
}

Config.PASS = {
    Enabled = true,
    ArmAfterSeconds = 20,
    AlarmAfterSeconds = 32
}

Config.HUD = {
    Enabled = true,
    ShowNumericPressure = true,
    WarnFlash = true
}

Config.AudioMuffle = {
    Enabled = true,
    FilterStrength = 0.35
}

Config.Sound = {
    Enabled = false,
    Backend = 'none', -- xsound | interactsound | native | none
    Files = {
        -- breathing = 'sounds/scba_breathing.ogg'
    },
    Names = {
        Breathing = 'scba_breathing',
        LowAir = 'scba_lowair',
        VeryLowAir = 'scba_verylow',
        PassAlarm = 'scba_pass',
        Cough = 'scba_cough',
        MaskOn = 'scba_mask_on',
        MaskOff = 'scba_mask_off',
        Refill = 'scba_refill'
    }
}

Config.Refill = {
    Enabled = true,
    RequireJob = false,
    Jobs = {
        firefighter = true,
        ambulance = true
    },
    Distance = 2.4,
    RatePerSecond = 12,
    DurationPerUnitMs = 50,
    VehicleClasses = { 18 },
    AllowedModels = {
        -- `firetruk`,
        -- `lguard`
    },
    VehicleBoneCandidates = {
        'boot',
        'platelight',
        'chassis'
    },
    FallbackOffsets = {
        vector3(0.0, -2.6, 0.0),
        vector3(0.0, -2.0, 0.8)
    }
}

Config.Hazards = {
    FireDetection = {
        Enabled = true,
        CheckIntervalMs = 1400,
        Radius = 6.5
    },
    CustomZones = {
        -- {
        --     type = 'sphere',
        --     center = vector3(1200.0, -1470.0, 34.8),
        --     radius = 12.0,
        --     level = 2
        -- }
    },
    Damage = {
        IntervalMs = 1800,
        Base = 2,
        LevelMultiplier = 1.2,
        MaskReduction = 0.9
    },
    Cough = {
        CooldownMs = 6000,
        MinLevel = 1
    }
}

Config.Props = {
    EnableBackProp = false -- deprecated: visuals now use clothing component swaps only
}

Config.Locales = {
    RefillSuccess = 'SCBA refill complete.',
    RefillInvalid = 'No compatible refill connection here.',
    NoScbaItem = 'You need an SCBA pack.',
    JobDenied = 'You are not authorized for this SCBA.',
    Empty = 'Cylinder empty.',
    Equipped = 'SCBA equipped.',
    Unequipped = 'SCBA removed.',
    MaskOn = 'Mask sealed.',
    MaskOff = 'Mask removed.'
}
