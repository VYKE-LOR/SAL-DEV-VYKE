Visuals = {}

local COMPONENT_UNDERSHIRT = 8
local COMPONENT_MASK = 1
local COMPONENT_CHAIN = 7

local OUTFIT_SCBA_ONLY = {
    undershirt = { drawable = 228, texture = 0 },
    mask = nil,
    chain = nil
}

local OUTFIT_SCBA_MASK = {
    undershirt = { drawable = 223, texture = 0 },
    mask = { drawable = 317, texture = 0 },
    chain = { drawable = 207, texture = 2 }
}

local originals = {
    captured = false,
    undershirt = nil,
    mask = nil,
    chain = nil
}

local lastApplied = {
    scbaEquipped = nil,
    maskOn = nil
}

local function captureComponent(ped, componentId)
    return {
        drawable = GetPedDrawableVariation(ped, componentId),
        texture = GetPedTextureVariation(ped, componentId)
    }
end

local function restoreComponent(ped, componentId, data)
    if not data then
        return
    end

    SetPedComponentVariation(ped, componentId, data.drawable, data.texture, 0)
end

function Visuals:CaptureOriginalOutfit()
    local ped = PlayerPedId()
    originals.undershirt = captureComponent(ped, COMPONENT_UNDERSHIRT)
    originals.mask = captureComponent(ped, COMPONENT_MASK)
    originals.chain = captureComponent(ped, COMPONENT_CHAIN)
    originals.captured = true
end

function Visuals:RestoreOriginalOutfit(forceRecapture)
    if not originals.captured then
        if forceRecapture then
            self:CaptureOriginalOutfit()
        end
        return
    end

    local ped = PlayerPedId()
    restoreComponent(ped, COMPONENT_UNDERSHIRT, originals.undershirt)
    restoreComponent(ped, COMPONENT_MASK, originals.mask)
    restoreComponent(ped, COMPONENT_CHAIN, originals.chain)

    if forceRecapture then
        originals.captured = false
    end
end

function Visuals:ApplyOutfitState(scbaEquipped, maskOn)
    if lastApplied.scbaEquipped == scbaEquipped and lastApplied.maskOn == maskOn then
        return
    end

    local ped = PlayerPedId()

    if scbaEquipped and not originals.captured then
        self:CaptureOriginalOutfit()
    end

    if not scbaEquipped then
        self:RestoreOriginalOutfit(false)
        lastApplied.scbaEquipped = scbaEquipped
        lastApplied.maskOn = maskOn
        return
    end

    local target = maskOn and OUTFIT_SCBA_MASK or OUTFIT_SCBA_ONLY

    SetPedComponentVariation(ped, COMPONENT_UNDERSHIRT, target.undershirt.drawable, target.undershirt.texture, 0)

    if target.mask then
        SetPedComponentVariation(ped, COMPONENT_MASK, target.mask.drawable, target.mask.texture, 0)
    else
        restoreComponent(ped, COMPONENT_MASK, originals.mask)
    end

    if target.chain then
        SetPedComponentVariation(ped, COMPONENT_CHAIN, target.chain.drawable, target.chain.texture, 0)
    else
        restoreComponent(ped, COMPONENT_CHAIN, originals.chain)
    end

    lastApplied.scbaEquipped = scbaEquipped
    lastApplied.maskOn = maskOn
end

function Visuals:ResetToCurrentPedOutfit()
    originals.captured = false
    lastApplied.scbaEquipped = nil
    lastApplied.maskOn = nil
    self:CaptureOriginalOutfit()
    self:RestoreOriginalOutfit(false)
end
