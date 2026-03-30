# SFAX Algorithm Reverse Engineering

Reverse-engineered from `SFA.exe` (SoftwareForArchers Xpert v2534-3, 32-bit PE x86:LE:32)
via Ghidra 12.0.4 headless decompilation.

---

## Methodology

1. Opened `SFA.exe` in Ghidra with auto-analysis enabled.
2. Wrote targeted Java scripts (`DecompileVelocity.java`, `DumpMoreConstants.java`, `DecompileInit.java`) to decompile specific functions and dump constants by address.
3. Cross-referenced Ghidra decompilation with calibration benchmarks to verify formulas.

---

## Bow Struct Layout (C++ class, 32-bit offsets)

The main bow model object has the following double fields (8 bytes each):

| Offset | Field name | Source |
|--------|-----------|--------|
| +0x00 | htlBowYear (QString) | FUN_0047c820 |
| +0x04 | htlBowMfg (QString) | FUN_0047c820 |
| +0x08 | htlBowMdl (QString) | FUN_0047c820 |
| +0x0C | cbBowType (QString, "Compound"/"Recurve"/…) | FUN_0047c820 |
| +0x10 | cbReleaseType (QString) | FUN_0047c820 |
| +0x18 | stored aero drag (computed, FUN_0046e370) | FUN_0046e370 |
| +0x20 | **referenceBraceHeight** (from bow database) | UI spinbox |
| +0x28 | **referenceLetoff** (from bow database) | UI spinbox / FUN_0046d570 |
| +0x30 | dsbIBOVelocity (fps) | FUN_0047cb00 |
| +0x38 | adjustedVelocity (computed) | FUN_0047bf60 |
| +0x40 | baseEfficiency (computed) | FUN_0047bf60 |
| +0x48 | weightDecay (computed) | FUN_0047bf60 |
| +0x50 | totalEfficiency = baseEfficiency + weightDecay | FUN_0047bf60 |
| +0x58 | equivalentWeight correction (computed) | FUN_0047bf60 |
| +0x60 | dsbDrawWeight (lbs) | FUN_0047cb00 |
| +0x68 | dsbDrawLength (inches) | FUN_0047cb00 |
| +0x70 | dsbAxleToAxle (inches) | FUN_0047cb00 |
| +0x78 | dsbBraceHeight (inches) | FUN_0047cb00 |
| +0x80 | dsbPercentLetoff (%) | FUN_0047cb00 |
| +0x88 | lebHoldingWeight (lbs, computed) | FUN_0047cb00 |
| +0x90 | weightCorrectionFactor (computed) | FUN_0047bf60 |
| +0x98 | drawLengthFactor (computed) | FUN_0047bf60 |
| +0xA0 | drawWeightFactor (computed) | FUN_0047bf60 |
| +0xB0 | fletching name (QString) | constructor |
| +0xB4 | fletch quantity (int) | |
| +0xB8 | dsbPeep (grains) | FUN_0047cea0 |
| +0xC0 | dsbDLoop (grains) | FUN_0047cea0 |
| +0xC8 | dsbNockPoint (grains) | FUN_0047cea0 |
| +0xD0 | dsbSilencers (grains) | FUN_0047cea0 |
| +0xD8 | dsbSilencerDFC (distance from cam, inches) | FUN_0047cea0 |
| +0xE0 | cbStringType (QString, "FastFlight"/…) | FUN_0047cea0 |
| +0xE8 | lebTillerUpper | FUN_0047c570 |
| +0xF0 | lebTillerLower | FUN_0047c570 |
| +0xF8 | lebStringLength | FUN_0047c570 |
| +0x100 | lebCable1Length | FUN_0047c570 |
| +0x108 | lebCable2Length | FUN_0047c570 |
| +0x110 | previous weightCorrectionFactor (saved) | FUN_0047bf60 |
| +0x118 | arrow weight used for last model build | FUN_0047bf60 |

**Default values** (from init functions, used when creating a new bow without database):

| Field | Default |
|-------|---------|
| dsbIBOVelocity | 312.0 |
| dsbDrawWeight | 53.0 |
| dsbDrawLength | 29.75 |
| dsbAxleToAxle | 40.25 |
| dsbBraceHeight | 7.785 |
| dsbPercentLetoff | 65.0 |
| dsbPeep | 10.0 |
| dsbDLoop | 6.0 |
| dsbNockPoint | 2.0 |
| dsbSilencers | 0.0 |
| dsbSilencerDFC | 0.0 |

---

## Constants (all confirmed from memory dump)

| Address | Value | Purpose |
|---------|-------|---------|
| DAT_004f5098 | 0.325 | fps-per-lb draw weight adjust |
| DAT_004f9f18 | 10.2 | fps-per-inch brace height adjust |
| DAT_004f50f0 | 7.0 | IBO reference brace height |
| DAT_004f70e8 | 70.0 | IBO reference draw weight |
| DAT_004f5130 | 30.0 | IBO reference draw length |
| DAT_004f7100 | 350.0 | IBO reference arrow weight |
| DAT_004f9f10 | 5.35 | velocity efficiency divisor |
| DAT_004f9f28 | 82.0 | compound base efficiency offset |
| DAT_004f9f20 | 76.0 | non-compound base efficiency offset |
| DAT_004f9f30 | 290.0 | lowest cam-lookup velocity |
| DAT_004f9f38 | 348.0 | weight correction lower bound |
| DAT_004f9f40 | 352.0 | weight correction upper bound |
| DAT_004f9f20/28 | 325/220 | compound/non-compound speed base offset |
| DAT_004f8c90 | 1.5 | velocity efficiency scale |
| DAT_004f8c78 | 0.45 | efficiency decay HIGH (index ≥ 21) |
| DAT_004f9ad8 | 0.55 | efficiency decay MID (10 ≤ index < 21) |
| DAT_004f8c48 | 0.01 | draw-weight micro factor |
| DAT_004f9ef8 | 0.03175 | draw-length micro factor |
| DAT_004f7048 | 0.2 | default/low-IBO weight correction factor |
| DAT_004f50a0 | 0.33 | drag multiplier in FPS formula |
| DAT_004f50c8 | 2.0 | default draw-weight factor (low IBO) |
| DAT_004f5188 | 200.0 | low IBO threshold |
| DAT_004f5170 | 100.0 | percent reference (100%) |
| DAT_004f50f8 | 10.0 | arrow weight class step |
| DAT_004f5190 | 300.0 | arrow weight class base |
| DAT_004f9f00 | 0.04 | weight correction energy offset |
| DAT_004f9f08 | 1.05 | weight correction energy scale |
| DAT_004f8fe0 | 7000.0 | grains per pound |
| DAT_004f50c0 | 1.0 | unity constant |
| DAT_004f2f58 | 0.5 | half constant |

---

## FPS Algorithm

### 1. Build Velocity Model — `FUN_0047bf60`

Called with (bow*, arrowTotalWeight).

```
adjustedVelocity = IBO + (drawWeight - 70) * 0.325 + (braceHeight - 7.0) * 10.2

isCompound = bowType.contains("compound")
speedBaseOffset = isCompound ? 325 : 220
efficiencyOffset = isCompound ? 82 : 76

baseEfficiency = ((adjustedVelocity - speedBaseOffset) / 5.35 + efficiencyOffset) / 100.0

weightClassIndex = trunc((arrowWeight - 300) / 10)
scaledEfficiency = baseEfficiency * 1.5 / 10

for i in 0..weightClassIndex-1:
    if i % 10 == 0 && i > 9:
        scaledEfficiency *= (i < 21 ? 0.55 : 0.45)
    cumulativeDecay += scaledEfficiency

weightDecay = cumulativeDecay / 100.0
totalEfficiency = baseEfficiency + weightDecay

if IBO > 200:
    drawWeightFactor = baseEfficiency * adjustedVelocity * 0.01
    drawLengthFactor = adjustedVelocity * 0.03175 * baseEfficiency
else:
    drawWeightFactor = 2.0
    drawLengthFactor = 10.2

# Compute speedAt350 using current model (no rebuild)
speedAt350 = velocityAdjustment(referenceBraceHeight, braceHeight, referenceLetoff, letoff,
                                 drawWeight, drawLength, drawWeightFactor, drawLengthFactor) + IBO

# Weight correction factor
energyLike = speedAt350^2 * 350 / (drawWeight * 2 * 7000)
adjustedEnergy = energyLike / ((baseEfficiency - 0.04) + weightDecay)
equivalentWeight = (adjustedEnergy / energyLike - 1) * 350
projectedSpeed = sqrt(((1 - weightDecay * 1.05) * adjustedEnergy) / (equivalentWeight + arrowWeight))
                 * sqrt(drawWeight * 7000 * 2)

if arrowWeight == 350:
    weightCorrectionFactor = 0
elif arrowWeight < 348 or arrowWeight > 352:
    weightCorrectionFactor = abs(speedAt350 - projectedSpeed) / abs(arrowWeight - 350)
# else: keep previous value (defaults to 0.2 from constructor)

if IBO <= 200:
    weightCorrectionFactor = 0.2
```

### 2. Velocity Adjustment — `FUN_0047c410`

Called with (bow*, arrowWeight, rebuildFlag). When rebuildFlag=true, calls buildVelocityModel first.

```
# Letoff correction
if letoff == referenceLetoff or letoff == 0:
    letoffCorr = 0
else:
    letoffCorr = (referenceLetoff - letoff) * 0.2

# Draw length term
velDL = (referenceBraceHeight - braceHeight + drawLength - 30.0) * drawLengthFactor

# Draw weight term
velDW = ((letoffCorr * 0.2 * drawWeightFactor + drawWeight) - 70.0) * drawWeightFactor

return velDL + velDW
```

> **Note**: `referenceBraceHeight` (+0x20) and `referenceLetoff` (+0x28) come from SFAX's bow database. When no database entry is loaded, they default to 0.0. When a bow is loaded from the database, these hold the manufacturer's spec values. Our app sets reference = actual (correction = 0) since we don't have a bow database.

### 3. Drag Bundle — `FUN_0047c4e0`

Reads from bow struct string accessories:

```
halfA2A = axleToAxle * 0.5
dragBundle = (1 - (halfA2A - silencerDFC) / halfA2A) * silencerWeight
             + nockPointWeight + peepWeight + dLoopWeight
```

Simplifies to: `(silencerDFC / halfA2A) * silencerWeight + nockPointWeight + peepWeight + dLoopWeight`

### 4. Final FPS — `FUN_0046e540`

```
fps = velocityAdjustment(arrowWeight, rebuildFlag=true)
      + IBO
      + (350 - arrowWeight) * weightCorrectionFactor
      - dragBundle * 0.33 * totalEfficiency
```

---

## Stored Drag / Kinetic Energy — `FUN_0046e370`

Used for **spine and KE calculation**, NOT for FPS. Reads:
- Shaft type factor (via string lookup table `DAT_004f8d00`, FUN_0046f910)
- Cam efficiency factor (via string lookup table `DAT_004f8d68`)
- dLoop, nockPoint, letoff, holdingWeight, silencers from bow struct

---

## Dynamic Spine Calculation — `FUN_0046da20`

The largest function (2378 bytes). Used to compute dynamic spine from draw setup.
See `src/utils/archeryCalculator.ts → calculateCompoundTargetSpine()` for the TypeScript implementation.

---

## Lookup Tables

### Shaft velocity factor — `DAT_004f8d00` (13 entries, string → double)

Used in stored drag calculation (FUN_0046e370 → FUN_0046f910):

| Shaft category | Factor |
|---|---|
| (base/default) | ~0.00000015 |
| hunting | ~0.000001575 |
| target | ~0.00000165 |
| (others) | 0.000018–0.0000375 |

### Cam efficiency factor — `DAT_004f8d68` (9 entries, string → double)

Used in stored drag (FUN_0046e370):

| Cam type | Factor |
|---|---|
| round | 0.35 |
| medium | 0.45 |
| aggressive | 0.55 |
| speed | 0.65 |
| max | 0.75 |
| (others) | 1.0–1.75 |

---

## Key Findings Summary

| Finding | Impact |
|---------|--------|
| FPS formula uses bow string accessories for drag, not arrow fletch | **Critical** — fixed major FPS bug |
| `referenceBraceHeight` (+0x20) and `referenceLetoff` (+0x28) come from bow database | Explains residual ~3-5 fps error (data limitation) |
| All stored drag constants verified exact | Confirms spine/KE calculation is correct |
| `FUN_0046e370` (stored drag) is used for KE/spine only, NOT for FPS | Important distinction |
| Default string accessories: peep=10, dLoop=6, nockPoint=2, silencers=0 | Calibration data reference |

---

## Decompiled Function Map

| Address | Name | Size | Purpose |
|---------|------|------|---------|
| FUN_0047bf60 | buildVelocityModel | 1084 | Main velocity model builder |
| FUN_0047c410 | velocityAdjustment | 206 | Draw length/weight correction |
| FUN_0047c4e0 | dragBundle | 91 | String accessory drag |
| FUN_0046e540 | calculateFPS | 163 | Final fps formula |
| FUN_0047be60 | bowConstructor | 205 | Bow object initialization |
| FUN_0047bf50 | iboHelper | 10 | IBO/290 reference helper |
| FUN_0047c3a0 | holdingWeight | 44 | Holding weight calculation |
| FUN_0047c3d0 | partialDrag | 63 | Partial drag calculation |
| FUN_0046e370 | storedAeroDrag | 461 | Aero drag (KE/spine only) |
| FUN_0046e5f0 | arrowTotalWeight | 103 | Arrow weight summation |
| FUN_0046e660 | wrapWeightHandler | 238 | Wrap weight from UI |
| FUN_0046d4d0 | sfaxPositiveCurve | 148 | Signed curve helper |
| FUN_0046d570 | focCalculation | 445 | FOC computation |
| FUN_0046d730 | focWithParams | 352 | FOC with parameter override |
| FUN_0046d890 | grainsPerPound | 105 | GPP ratio |
| FUN_0046d900 | kineticEnergy | 121 | KE formula |
| FUN_0046d980 | momentum | 49 | Momentum formula |
| FUN_0046d9c0 | efficiency | 79 | Efficiency metric |
| FUN_0046da20 | dynamicSpine | 2378 | Dynamic spine (largest fn) |
| FUN_0046fd90 | lookupTableSearch | 131 | Binary tree lookup (string→double) |
| FUN_0046f910 | shaftVelocityFactor | 129 | Shaft type → drag factor |
| FUN_0047c820 | initStringFields | 549 | Init bow name/type strings |
| FUN_0047cb00 | initNumericFields | 922 | Init bow numeric fields |
| FUN_0047cea0 | initAccessoryFields | 801 | Init peep/dloop/etc |
| FUN_0047c570 | initCableFields | 685 | Init tiller/cable/string fields |
