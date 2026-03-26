# SFAX Reverse Engineering - Findings & Analysis

## 1. Application Overview

**SoftwareForArchers Xpert (SFAX)** v2.5.34
- Qt5 C++ application (`SFA.exe`, 32-bit PE)
- Licensing/DRM via `tms.dll` (Delphi DCPcrypt2, MD5/SHA256)
- Database files XOR-encrypted with key `TrustInGod`
- Device fingerprinting via `MachineGuid` registry key

## 2. Database Decryption

### Method
Each `e-*.csv` line is hex-encoded. Decode hex to bytes, then XOR each byte with the repeating key.

```
Key: TrustInGod (0x54 0x72 0x75 0x73 0x74 0x49 0x6e 0x47 0x6f 0x64)
```

### Decrypted Databases

| File | Records | Description |
|------|---------|-------------|
| Bow Data (2002-2022) | 7,298 | IBO, A2A, BH, DL, DW, PLO, Cam type |
| Shaft Data | 3,845 | Spine, GPI, OD, insert/bushing/nock weights |
| Fletch Data | 321 | Weight, length, height, type (vane/feather) |
| Nock Data | 434 | Weight, bushing/pin weight |
| Sight Data | 340 | Sight specifications |

### CSV Format
```
*,DatasetName       <- identifies the dataset
=,COL1,COL2,...     <- column headers
-,ManufacturerName  <- section separator (group header)
data,data,data,...  <- data rows
```

## 3. Ghidra Decompilation Results

**Method**: Ghidra 12.0.4 headless analysis on SFA.exe (32-bit PE, x86:LE:32).
11,967 functions identified. Custom scripts decompiled all functions matching
floating-point calculation patterns and known address ranges.

### 3.1 Data Structures

SFAX uses two primary structs passed via `__thiscall` (ECX):

#### Arrow Struct (param_1 in most calculation functions)

| Offset | Type | Field | Source |
|--------|------|-------|--------|
| +0x08 | double | TAW (total arrow weight) | Computed |
| +0x10 | double | GRLB (grains per pound) | Computed |
| +0x18 | double | KE / Stored Energy | Computed |
| +0x28 | double | FOC (front of center %) | Computed |
| +0x38 | double | Dynamic spine result | Computed |
| +0x40 | double | Stored energy | Computed |
| +0x50 | QString | Shaft type/category string | UI input |
| +0x58 | double | Insert weight (PI) | UI input |
| +0x60 | double | Point weight | UI input |
| +0x6c | QString | Shaft USE code | UI input |
| +0x78 | double | Shaft GPI | UI input |
| +0x88 | double | Shaft length (inches) | UI input |
| +0x98 | double | Wrap weight | UI input |
| +0xa8 | QString | Fletch manufacturer | UI input |
| +0xac | QString | Fletch model | UI input |
| +0xb0 | QString | Fletch type (Vane/Feather) | UI input |
| +0xb4 | int | Fletch quantity | UI input |
| +0xb8 | double | Fletch weight (each) | UI input |
| +0xc0 | double | Fletch length | UI input |
| +0xc8 | double | Fletch height | UI input |
| +0xd0 | double | Fletch offset from nock | UI input |
| +0xd8 | QString | Nock manufacturer | UI input |
| +0xdc | QString | Nock model | UI input |
| +0xe0 | double | Nock weight | UI input |
| +0xe8 | double | Bushing/pin weight | UI input |

#### Bow Struct (param_2 in FUN_0046da20, param_1 in FUN_0047bf60)

| Offset | Type | Field | Evidence |
|--------|------|-------|----------|
| +0x0c | QString | Bow type string ("compound") | String match in code |
| +0x10 | QString | Release type string | "finger"/"rope"/"post" checks |
| +0x20 | double | IBO velocity (base) | Used in velocity calc |
| +0x30 | double | IBO velocity | Referenced as base value |
| +0x38 | double | Adjusted velocity (computed) | Result of velocity model |
| +0x60 | double | Draw weight (DW) | (DW - 70) adjustment |
| +0x68 | double | Draw length (DL) | Used in spine calc |
| +0x70 | double | A2A (axle-to-axle) | Used in string calc |
| +0x78 | double | Brace height (BH) | (BH - 7) adjustment |
| +0x80 | double | Percent letoff | Used in holding weight |
| +0x90 | double | Dynamic efficiency factor | Computed |
| +0x98 | double | DL adjustment factor | Computed |
| +0xa0 | double | DW adjustment factor | Computed |
| +0xb8 | double | String accessory weight | From string setup |
| +0xc0 | double | Fletch length (bow-side) | Used in spine |
| +0xc8 | double | Fletch height | Used in KE drag calc |
| +0xd0 | double | Fletch offset | Used in drag calc |
| +0xd8 | double | Nock/peep weight | String accessories |
| +0xe0 | QString | String material ("dacron") | String type check |

### 3.2 Resolved Constants (from .rdata section)

All constants verified via Ghidra memory dump of the .rdata section.

#### Core Reference Constants

| Address | Value | Meaning |
|---------|-------|---------|
| 004f8fe0 | 7000.0 | Grains per pound |
| 004f7100 | 350.0 | IBO reference arrow weight (gr) |
| 004f70e8 | 70.0 | IBO reference draw weight (lbs) |
| 004f50f0 | 7.0 | Reference brace height (inches) |
| 004f5130 | 30.0 | IBO reference draw length / reference fletch weight |
| 004f5128 | 28.0 | AMO spine test span (inches) |
| 004f5170 | 100.0 | Percentage multiplier |

#### Velocity Model Constants

| Address | Value | Meaning |
|---------|-------|---------|
| 004f5098 | 0.325 | FPS per pound of draw weight deviation |
| 004f9f18 | 10.2 | FPS per inch of brace height deviation |
| 004f9f10 | 5.35 | Velocity-to-efficiency divisor |
| 004f9f20 | 76.0 | Non-compound base efficiency offset |
| 004f9f28 | 82.0 | Compound base efficiency offset |
| 004f8c90 | 1.5 | Efficiency scaling factor |
| 004f9ad8 | 0.55 | Decay factor (for weight classes 10-20) |
| 004f8c78 | 0.45 | Decay factor (for weight classes 21+) |
| 004f9ef8 | 0.03175 | DL efficiency factor |
| 004f9f00 | 0.04 | Efficiency offset |
| 004f9f08 | 1.05 | Weight class correction |
| 004f9f38 | 348.0 | Lower bound for IBO-like range |
| 004f9f40 | 352.0 | Upper bound for IBO-like range |
| 004f8c48 | 0.01 | DW efficiency micro-factor |
| 004f7048 | 0.2 | Default low-IBO efficiency |

#### Spine Adjustment Constants

| Address | Value | Meaning |
|---------|-------|---------|
| 004f8f70 | 0.12 | **Spine sensitivity: spine units per grain of deviation** |
| 004f8fd0 | 75.0 | Reference front mass (point + insert, grains) |
| 004f5130 | 30.0 | Reference fletch weight (total, grains) |
| 004f5108 | 12.0 | Reference rear mass (nock + bushing, grains) |
| 004f5110 | 15.0 | Minimum spine value |

#### Shaft Category Spine Constants (ratio 1:3:5)

| Address | Value | Category | Applied when |
|---------|-------|----------|-------------|
| 004f8f58 | 0.00421875 | Base (= 27/6400) | Default / non-target shafts |
| 004f8f60 | 0.01265625 | Hunting (= 81/6400) | Shaft type contains "&" |
| 004f8f68 | 0.02109375 | Target (= 135/6400) | Shaft type contains "target" |

#### FOC Constants

| Address | Value | Meaning |
|---------|-------|---------|
| 004f2f58 | 0.5 | Nock overhang (adds to total length) |
| 004f7060 | 0.75 | Front mass CG depth multiplier |
| 004f50d0 | 3.0 | Fletch CG divisor / wrap offset |

#### FOC Insert Depth Lookup (at 004f8d90, keyed by shaft type)

| Index | Value | Insert Configuration |
|-------|-------|---------------------|
| 0 | 0.65 | Standard deep-set insert (default) |
| 1 | 0.75 | Shallow insert |
| 2 | 1.25 | Half-outsert |
| 3 | 1.50 | Full outsert |
| 4 | 1.75 | Extended outsert |

#### Drag/Energy Lookup Tables

**Velocity efficiency by shaft type** (at 004f8d00):

| Index | Value | Likely Category |
|-------|-------|----------------|
| 0 | 0.0000150 | Base |
| 1 | 0.0000158 | |
| 2 | 0.0000165 | |
| 3 | 0.0000180 | |
| 4 | 0.0000195 | |
| 5 | 0.0000210 | |
| 6 | 0.0000345 | |
| 7 | 0.0000360 | |
| 8 | 0.0000375 | |

**Cam type efficiency** (at 004f8d68, keyed by cam type string):

| Index | Value | Likely Cam Type |
|-------|-------|----------------|
| 0 | 0.00000104 | Default |
| ... | ... | Keyed by cam name |

**Force-Draw Ratio (FDR)** values (at 004f8d78):

| Value | Cam Type |
|-------|----------|
| 0.35 | Round wheel |
| 0.45 | Medium cam |
| 0.55 | Aggressive cam |
| 0.65 | Speed cam |
| 0.75 | Maximum efficiency |

**Release type multipliers** (at 004f8da0):

| Value | Release Type |
|-------|-------------|
| 1.25 | Base |
| 1.50 | Medium |
| 1.75 | Maximum |

#### Stored Energy Constants

| Address | Value | Meaning |
|---------|-------|---------|
| 004f8f78 | 1.234 | Energy scaling factor |
| 004f8f88 | 2.34 | Fletch offset energy addition |
| 004f8fa0 | 9.5 | Letoff energy factor |
| 004f8fb0 | 15.25 | Fletch drag energy factor |
| 004f8f50 | 0.000000385 | Shaft aerodynamic factor |
| 004f8fc8 | 23.45 | Shaft-length energy factor |
| 004f8c80 | 0.65 | Fletch drag coefficient |
| 004f9bc8 | 3.14159... | Pi (used in aerodynamic calc) |

## 4. Decompiled Formulas

### 4.1 Total Arrow Weight (FUN_0046e5f0, 103 bytes)

**Exact formula, verified against all 6 reference points:**

```
TAW = pointWeight + insertWeight + (GPI * shaftLength) +
      (fletchCount * fletchWeightEach) + wrapWeight +
      nockWeight + bushingPinWeight
```

All component weights in grains, shaft length in inches.

### 4.2 FOC - Front of Center (FUN_0046d570, 445 bytes)

**Decompiled formula with all constants resolved:**

```
totalLength = shaftLength + 0.5
midpoint = totalLength * 0.5

insertFactor = lookup(shaftType, insertDepthTable, default=0.65)
frontMassCG = (1.0 - insertFactor * 0.75)  // distance from tip in inches

totalWeight = shaftWeight + frontMass + rearMass + fletchWeight + wrapWeight

// Weighted average distance from FRONT (point tip):
weightedDistFromFront = (
    frontMassCG * (pointWeight + insertWeight) +
    (shaftLength * 0.5) * shaftWeight +
    shaftLength * (nockWeight + bushingWeight) +
    ((shaftLength - fletchLength/3.0) - 1.0) * (fletchCount * fletchWeightEach) +
    (shaftLength - 3.0) * wrapWeight
) / totalWeight

FOC = ((midpoint - weightedDistFromFront) / totalLength) * 100.0
```

**Key insights:**
- Uses `shaftLength + 0.5` as total arrow length (0.5" nock overhang)
- Front mass CG position depends on insert type (deep-set vs outsert)
- Default insert factor 0.65: front CG is 0.5125" behind tip
- Fletch CG position: `shaftLength - fletchLength/3 - 1` from front
- Wrap CG position: 3" from nock end (i.e., `shaftLength - 3` from front)

**Verified**: Mathews HalonX case computes to FOC ~16.67% (within 0.07% of SFAX's 16.60%).

### 4.3 Grains Per Pound (FUN_0046d980, 49 bytes)

```
GRLB = TAW / DW
```

Exact match. The `* 7000` factor in the decompiled code applies to a different context
(converting to specific units for internal energy calculations).

### 4.4 Kinetic Energy (confirmed from reference data)

```
KE = TAW * FPS^2 / 450240
```

Where `450240 = 2 * 7000 * 32.174` (grains/lb * gravitational constant).
Verified across all 6 reference points (error < 0.1 ft-lbs).

### 4.5 Holding Weight (FUN_0047c3a0, 44 bytes)

```
holdingWeight = ((100.0 - percentLetoff) / 100.0) * drawWeight
```

### 4.6 Stored Energy / Drag Model (FUN_0046e370, 461 bytes)

Complex aerodynamic energy model incorporating fletch drag and shaft drag:

```
shaftTypeFactor = lookup(shaftType, velocityEfficiencyTable, default=0.0000150)
camTypeFactor = lookup(camType, camEfficiencyTable, default=0.00000104)

storedEnergy =
    // Fletch drag component:
    fletchLength * fletchCount * fletchHeight * 0.65 * camTypeFactor * 15.25 *
    (fletchOffset + 2.34) * 1.234
    +
    // Letoff-dependent energy:
    percentLetoff^2 * shaftTypeFactor * 9.5
    +
    // Shaft aerodynamic component:
    pi * 2.0 * percentLetoff * 0.5 * shaftLength * 0.000000385 * 23.45
```

### 4.7 Velocity Model (FUN_0047bf60, 1084 bytes)

The velocity model is the most complex function. It uses an iterative approach:

#### Step 1: Base velocity from IBO adjustments
```
adjustedVel = IBO + (DW - 70) * 0.325 + (BH - 7.0) * 10.2
```

Note: BH adjustment is `(BH - 7) * 10.2`:
- BH = 6": -10.2 fps (shorter BH = faster, correct)
- BH = 7": 0 fps (reference)
- BH = 8": +10.2 fps (this seems inverted but IBO already accounts for each bow's actual BH)

#### Step 2: Efficiency calculation
```
// Compound bow:
baseOffset = 325  // (non-compound: 220)
efficiencyBase = 82.0  // (non-compound: 76.0)

efficiency = ((adjustedVel - baseOffset) / 5.35 + efficiencyBase) / 100.0
```

#### Step 3: Iterative weight-class velocity decay
```
weightClassIndex = floor((TAW - 300) / 10)
scaledEff = efficiency * 1.5 / 10.0

cumulativeDecay = 0
for i = 1 to weightClassIndex:
    if (i % 10 == 0 and i >= 10):
        if i < 21: scaledEff *= 0.55
        else: scaledEff *= 0.45
    cumulativeDecay += scaledEff

decayFraction = cumulativeDecay / 100.0
```

#### Step 4: Final velocity and efficiency factors
```
totalEfficiency = efficiency + decayFraction

// Factors stored for use by other calculations:
DW_factor = 2.0  // default for IBO <= 200
if IBO > 200:
    DW_factor = efficiency * adjustedVel * 0.01

DL_factor = 10.2  // default for IBO <= 200
if IBO > 200:
    DL_factor = adjustedVel * 0.03175 * efficiency
```

### 4.8 Velocity Sub-Calculations (FUN_0047c410, 206 bytes)

```
// Letoff adjustment
if letoff == DW or letoff == 0:
    letoffAdj = 0
else:
    letoffAdj = (DW - letoff) * 0.2

// Velocity from DW and DL:
velFromDL = ((IBO - BH) + DL) - 30.0) * DL_factor
velFromDW = ((letoffAdj * 0.2 * DW_factor + DW) - 70.0) * DW_factor

velocity = velFromDL + velFromDW
```

### 4.9 Dynamic Spine (FUN_0046da20, 2378 bytes) - THE CORE ALGORITHM

This is the most important and complex function. It computes the dynamic spine
of an arrow given bow and arrow parameters.

#### Structure

The function has two major branches: **compound** and **non-compound** (recurve/longbow).
Both paths share a common post-processing step.

#### Compound Branch (simplified pseudocode)

```
// Step 1: Base spine from draw weight using polynomial
baseSpine = polynomial(DW, coefficients=[-70, 110])  // FUN_0046fa90

// Step 2: Apply efficiency correction
adjustedSpine = FUN_0047bf50() * (baseSpine + DW)

// Step 3: Brace height polynomial correction
bhCorrection = polynomial(BH, coefficients=[24, 45])  // different poly

// Step 4: Negate BH correction and add to spine
adjustedSpine = adjustedSpine - bhCorrection  // XOR with sign bit

// Step 5: Length-based scaling
lengthFactor = (2.75 / sqrt(80)) * (adjustedSpine - 50) + 20.75
velocityRatio = (DL / (DL - lengthFactor)) * bowIBO_factor * ((DL - lengthFactor) / lengthFactor)

if lengthFactor == 0: lengthFactor = 20

// Step 6: Combine with velocity ratio
adjustedSpine = (velocityRatio / sqrt(30)) * (DL - lengthFactor) + adjustedSpine

// Step 7: Letoff adjustment
letoffDelta = 0
if letoff != 65 and letoff != 0:
    letoffDelta = (65 - letoff) * 0.2

adjustedSpine = (0.25 / sqrt(30)) * (letoff - 70) + adjustedSpine

// Step 8: Release type adjustment
releaseMultiplier = 5.0  // finger
if release == "finger": goto apply
if release == "rope": releaseMultiplier = 1.75
if release == "post": releaseMultiplier = 1.0
// else: releaseMultiplier = 5.0

adjustedSpine = (releaseMultiplier / sqrt(30)) * (letoff - 70) + adjustedSpine
```

#### Common Post-Processing (both compound and non-compound)

```
// Minimum spine floor
if adjustedSpine <= 0: adjustedSpine = 15.0

// String accessories effect
stringEffect = (stringAccessoryWeight + fletchHeight) * 0.12

// Arrow component adjustments (CRITICAL - 0.12 spine units per grain)
adjustedSpine = adjustedSpine
    - (75.0 - (pointWeight + insertWeight)) * 0.12    // heavier front = stiffer
    - ((wrapWeight + fletchCount * fletchWeightEach) - 30.0) * 0.12  // heavier total = stiffer
    - ((bushingWeight + nockWeight) - 12.0) * 0.12    // heavier rear = stiffer
    - fletchLength * 0.12                               // longer fletch = stiffer
    + negate(stringEffect)                              // string accessories

// Dacron string correction (weakens by 3-5 spine units)
if stringType == "dacron":
    if DL > 35: dacronAdj = 5.0
    elif DL >= 14: dacronAdj = (2/sqrt(21)) * sqrt(35 - DL) + 3.0
    else: dacronAdj = 3.0
    adjustedSpine -= dacronAdj

// Shaft category correction constant
if "&" in shaftType:
    spineConstant = 0.01265625   // hunting (81/6400)
elif "target" in shaftType:
    spineConstant = 0.02109375   // target (135/6400)
else:
    spineConstant = 0.00421875   // base (27/6400)

// Final dynamic spine conversion
dynamicSpine = (28.0 / adjustedSpine) * (28.0 / shaftLength) + spineConstant
```

#### Key Insights from Dynamic Spine Algorithm

1. **0.12 spine units per grain**: Every grain of deviation from reference weights
   shifts the dynamic spine by 0.12 units. This is THE key sensitivity factor.

2. **Reference weights**: The algorithm uses 75gr front mass, 30gr fletch weight,
   and 12gr rear mass as the neutral reference point.

3. **Heavier = stiffer**: All component weight increases REDUCE the spine number
   (stiffer acting). This confirms the SFAX observation that heavier front mass
   makes arrows act stiffer.

4. **Shaft length effect**: Appears in the final conversion as `28/shaftLength`,
   creating a direct ratio with the AMO test length.

5. **Three spine constants** (1:3:5 ratio): These are additive corrections for
   different shaft categories - hunting, target, and base.

6. **Compound vs non-compound**: Compound bows use a different base spine polynomial
   and include brace height and letoff adjustments.

## 5. SFAX Reference Data Points (from XML UserRecords)

6 configurations with full input + calculated output:

| ID | IBO | DW | DL | BH | PLO | Spine | FPS | DynSpine | TAW | FOC | KE |
|----|-----|-----|-----|-----|-----|-------|-----|----------|-----|-----|-----|
| Mathews HalonX | 330 | 59 | 30 | 7.0 | 75% | 0.350 | 269.91 | 0.341 | 431.77 | 16.60 | 69.78 |
| PSE AXE 6 | 337 | 71.5 | 29 | 6.0 | 75% | 0.300 | 295.31 | 0.307 | 448.78 | 11.98 | 86.82 |
| OK Smoke (ACC360) | 335 | 60.5 | 30 | 7.25 | 70% | 0.390 | 279.05 | 0.341 | 414.24 | 12.96 | 71.55 |
| OK Smoke (CE350) | 325 | 60 | 30 | 7.25 | 70% | 0.345 | 284.27 | 0.351 | 378.24 | 15.82 | 67.80 |
| OK Smoke (RIPXV) | 335 | 57 | 30 | 7.25 | 60% | 0.350 | 290.84 | 0.350 | 352.60 | 16.68 | 66.16 |
| Podium X40 | 335 | 57 | 29.875 | 7.25 | 70% | 0.400 | 292.47 | 0.375 | 333.50 | 13.09 | 63.28 |

## 6. Database Statistics (for Algorithm Calibration)

### Shaft Database: Spine vs GPI (most common compound spines)

| Spine | Count | GPI Range | GPI Avg | Avg Insert (PI) | Avg Bushing (BPC) | Avg Nock |
|-------|-------|-----------|---------|-----------------|-------------------|----------|
| 0.250 | 103 | 7.1 - 17.7 | 10.20 | 44.2 | 16.7 | 8.1 |
| 0.300 | 391 | 7.0 - 16.0 | 9.85 | 26.3 | 12.5 | 9.5 |
| 0.340 | 217 | 6.9 - 12.0 | 9.33 | 22.4 | 10.1 | 10.2 |
| 0.350 | 254 | 6.0 - 12.0 | 8.73 | 33.8 | 13.0 | 9.0 |
| 0.400 | 542 | 5.9 - 13.4 | 8.36 | 25.7 | 11.6 | 9.5 |
| 0.500 | 392 | 5.0 - 10.6 | 7.45 | 24.2 | 10.8 | 9.6 |
| 0.600 | 150 | 5.3 - 12.8 | 6.87 | 24.3 | 8.4 | 9.0 |

### Bow Database: IBO vs Brace Height

| Brace Height | Avg IBO | Std Dev | Count |
|-------------|---------|---------|-------|
| 5.0" | 354.7 | 22.5 | 48 |
| 6.0" | 317.6 | 31.8 | 810 |
| 7.0" | 316.4 | 59.3 | 2,822 |
| 7.5" | 306.2 | 17.5 | 1,065 |
| 8.0" | 302.4 | 15.6 | 1,094 |
| 8.5" | 290.1 | 13.9 | 303 |
| 9.0" | 285.3 | 11.2 | 187 |

### Cam Type Distribution
| Type | Count | % |
|------|-------|---|
| Single | 2,243 | 32% |
| Hybrid | 2,050 | 29% |
| Twin | 1,841 | 26% |
| Binary1 | 506 | 7% |
| Binary2 | 373 | 5% |

### Component Weight Ranges (from all databases)

| Component | Min | Median | Max | Typical Range |
|-----------|-----|--------|-----|---------------|
| Vane (each) | 0.8 | 5.7 | 54.0 | 3-9 gr |
| Feather (each) | 1.3 | 2.6 | 5.2 | 1.5-4 gr |
| Nock | 2.0 | 9.8 | 54.0 | 5-15 gr |
| Bushing/Pin | 3.6 | 11.6 | 27.1 | 4-20 gr |
| Point Insert (from shaft DB) | varies by shaft diameter | | | 12-50 gr |

## 7. Actionable Improvements for Our Algorithm

Based on the Ghidra decompilation, these are the specific changes needed:

### 7.1 Dynamic Spine: Component Weight Sensitivity

**SFAX uses 0.12 spine units per grain** for all component weight deviations from reference:
- Reference front mass: 75 gr (point + insert)
- Reference fletch weight: 30 gr (total)
- Reference rear mass: 12 gr (nock + bushing)

**Our algorithm should implement:**
```typescript
const SPINE_GRAINS_SENSITIVITY = 0.12;  // spine units per grain
const REF_FRONT_MASS = 75;   // grains
const REF_FLETCH_WEIGHT = 30; // grains
const REF_REAR_MASS = 12;    // grains

// Adjustments (heavier = MORE STIFF = lower spine number):
frontMassAdj = (REF_FRONT_MASS - (pointWeight + insertWeight)) * SPINE_GRAINS_SENSITIVITY;
fletchAdj = (REF_FLETCH_WEIGHT - totalFletchWeight) * SPINE_GRAINS_SENSITIVITY;
rearMassAdj = (REF_REAR_MASS - (nockWeight + bushingWeight)) * SPINE_GRAINS_SENSITIVITY;
```

### 7.2 Front Mass Direction: CONFIRMED STIFFENING

SFAX subtracts `(75 - frontMass) * 0.12` from the spine value:
- If frontMass > 75: subtraction is NEGATIVE, spine decreases = stiffer
- If frontMass < 75: subtraction is POSITIVE, spine increases = weaker

**Our `FRONT_MASS_SENSITIVITY` must be INVERTED** (currently set to weaken).

### 7.3 Shaft Length Effect

SFAX uses `28.0 / shaftLength` as a direct ratio in the final conversion:
```
dynamicSpine = (28 / intermediateSpine) * (28 / shaftLength) + constant
```

This is simpler than our current exponential model with `DYNAMIC_SPINE_LENGTH_EXPONENT = 1.5`.

### 7.4 Shaft Category Constants (1:3:5)

The three constants add a small correction based on shaft use category:
- Hunting shafts: +0.01266
- Target shafts: +0.02109
- Basic shafts: +0.00422

These are tiny additive terms that fine-tune the dynamic spine.

### 7.5 FOC Formula Enhancement

Replace the simplified FOC with the SFAX moment-based calculation:
- Account for insert depth (deep-set vs outsert) via shaft type lookup
- Use `shaftLength + 0.5` as total length (nock overhang)
- Position fletch CG at `shaftLength - fletchLength/3 - 1` from front
- Position wrap CG at `shaftLength - 3` from front

### 7.6 Velocity Model

The SFAX velocity model uses:
- `(DW - 70) * 0.325` fps per pound (we had 2.75 - much higher)
- `(BH - 7) * 10.2` fps per inch of BH
- An iterative weight-class decay system (not a simple linear TAW adjustment)
- Separate compound/non-compound paths with different base offsets

### 7.7 FDR (Force-Draw Ratio) Values

SFAX uses FDR values of 0.35, 0.45, 0.55, 0.65, 0.75 keyed by cam type.
Our model uses 0.80-0.90 which are too high and too narrow a range.
