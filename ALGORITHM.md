# Archery Spine Algorithm

## Scope

The compound path in [src/utils/archeryCalculator.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/archeryCalculator.ts) is now an `SFAX-first` port based on the reverse engineering work documented in [scripts/sfax-databases/SFAX-REVERSE-ENGINEERING.md](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/sfax-databases/SFAX-REVERSE-ENGINEERING.md) and benchmarked with [src/data/sfax/compoundReference.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/sfax/compoundReference.ts).

Official charts from Easton, Gold Tip, Victory, and Black Eagle remain in the repo as secondary sanity checks through [src/data/official/compoundDatabase.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/official/compoundDatabase.ts). They no longer define the core compound equation.

## Result Semantics

The app exposes three main values:

- `spineRequired`: the reverse-engineered SFAX dynamic-spine target for the current bow + arrow build.
- `spineDynamic`: the selected static spine from the shaft, with optional temperature correction for carbon.
- `matchIndex = spineDynamic / spineRequired`

Interpretation:

- `< 0.90`: stiff
- `0.90 - 1.10`: good
- `> 1.10`: weak

This means the calculator compares the shaft you selected against the SFAX target that the rest of the setup demands.

## Unit Model

- Internal math runs in canonical imperial units.
- The UI converts globally between imperial and metric.
- Speed can come from the SFAX model or from an optional chronograph reading.

## Compound Pipeline

### 1. Total Arrow Weight

The calculator first builds `TAW` from:

- measured total arrow weight, if provided
- otherwise shaft GPI + shaft length + point + insert + fletch + wrap + nock + bushing

This same weight is then reused by the velocity model, `gr/lb`, `KE`, and match evaluation.

### 2. SFAX Velocity Model

The compound velocity path follows the reverse-engineered `FUN_0047bf60` / `FUN_0047c410` / `FUN_0046e540` flow:

```text
adjustedVelocity = IBO + (DW - 70) * 0.325 + (BH - 7) * 10.2
efficiency = ((adjustedVelocity - 325) / 5.35 + 82) / 100
```

Then:

- apply the SFAX weight-class decay by 10-grain buckets from `300gr`
- derive `drawWeightFactor` and `drawLengthFactor`
- compute the 350-grain reference speed
- derive the weight-correction factor
- subtract the SFAX drag bundle for string-side mass and fletch geometry

The final model output is:

- `calculatedFPS`
- `effectiveFPS`
- `KE = TAW * FPS² / 450240`

### 3. SFAX Dynamic-Spine Target

Compound target spine comes from the reverse-engineered `FUN_0046da20` branch.

In simplified form:

```text
base = (IBO / 290) * (drawCurve(DW) + DW)
base -= a2aCurve(A2A)

lengthFactor = (2.75 / 80) * (base - 50) + 20.75
velocityRatio = (BH / powerStroke) * IBO * (powerStroke / lengthFactor)

adjusted = base + (velocityRatio / 30) * (powerStroke - lengthFactor)
adjusted += letoffAdjustment
adjusted += releaseAdjustment
```

Then both compound and non-compound paths share the same post-processing:

```text
adjusted
  - (75 - frontMass) * 0.12
  - ((wrap + totalFletchWeight) - 30) * 0.12
  - ((bushing + nock) - 12) * 0.12
  - fletchLength * 0.12
  - (stringAccessoryWeight + stringOffset + fletchHeight) * 0.12
  - dacronAdjustment?
```

Final conversion:

```text
dynamicSpineTarget = (28 / adjusted) * (28 / shaftLength) + shaftCategoryConstant
```

Where `shaftCategoryConstant` is one of:

- `0.00421875` base
- `0.01265625` hunting
- `0.02109375` target

### 4. Exact Directional Behavior

With the exact SFAX port, these are the expected directions:

- faster bows -> smaller target spine number
- lower brace height -> smaller target spine number
- more front mass -> smaller target spine number
- finger release -> smaller target spine number
- more rear mass -> larger target spine number
- longer fletch -> larger target spine number
- more string-side mass -> larger target spine number
- dacron -> larger target spine number

Those directions are enforced in [src/utils/spineCalibration.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibration.ts).

## FOC

`FOC` uses the SFAX moment model:

- total length = `shaftLength + 0.5`
- front CG depends on insert depth
- fletch CG = `shaftLength - fletchLength / 3 - 1`
- wrap CG = `shaftLength - 3`

Implementation: [src/utils/archeryCalculator.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/archeryCalculator.ts)

## Chronograph Correction

If the user enters measured FPS:

```text
targetSpine = targetSpine / clamp(measuredFPS / calculatedFPS, 0.85, 1.15)
```

This does not replace SFAX. It refines the target with real launch speed from the actual bow.

## Datasets and Validation

Primary benchmark:

- [src/data/sfax/compoundReference.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/sfax/compoundReference.ts)

Secondary sanity dataset:

- [src/data/official/compoundDatabase.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/official/compoundDatabase.ts)

Analysis helpers:

- [src/utils/spineCalibrationDataset.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibrationDataset.ts)
- [src/utils/spineCalibration.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibration.ts)
- [scripts/calibrate-compound.mjs](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/calibrate-compound.mjs)
- [scripts/analyze-compound-calibration.mjs](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/analyze-compound-calibration.mjs)

`pnpm run calibrate:compound` is now an audit script, not a grid search. It reports:

- SFAX fidelity
- official-chart sanity
- monotonicity checks

`pnpm run analyze:compound` breaks error down by buckets and worst cases.

## Current Validation Targets

The repo currently expects compound to stay roughly within:

- SFAX dynamic spine MAE well below `0.02`
- SFAX FPS MAE below about `5 fps`
- FOC very close to the SFAX reference outputs

Use the commands above instead of hard-coding those numbers elsewhere.

## Limitations

- Compound has real SFAX benchmark coverage; recurve/traditional are ported from the same function family but have much less reference data.
- Bow-reference values used by the SFAX velocity sub-function fall back to the current UI brace height and letoff when extra metadata is unavailable.
- The app still does not auto-populate all SFAX database fields from a bow/shaft selector.
- Paper tune, bareshaft, and broadhead feedback are still not fed back into the model.
