# Archery Spine Algorithm

## Scope

This document describes the current model implemented in [src/utils/archeryCalculator.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/archeryCalculator.ts) and calibrated through [src/utils/spineCalibrationDataset.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibrationDataset.ts).

The official source database that feeds those calibration inputs lives in [src/data/official/compoundDatabase.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/official/compoundDatabase.ts).

The app computes three primary values:

- `spineRequired`: how stiff the arrow needs to be for the bow.
- `spineDynamic`: how the selected arrow behaves dynamically.
- `matchIndex = spineDynamic / spineRequired`

Target interpretation:

- `< 0.90`: stiff
- `0.90 - 1.10`: good
- `> 1.10`: weak

## Unit Model

- Internal calculations use imperial canonical units.
- The UI converts globally between imperial and metric.
- Speed can come from the model or from an optional chronograph reading.

## Bow-Side Model

### 1. Stored and available energy

For compound bows:

```text
storedEnergy = drawWeight * (drawLength - braceHeight) * camEfficiency * letOffRatio / 12
availableEnergy = storedEnergy * bowEfficiency
```

Key inputs:

- `drawWeight`
- `drawLength`
- `braceHeight`
- `percentLetoff`
- `camAggressiveness`
- `iboVelocity`

For recurve/traditional, the model uses a simpler linear stored-energy approximation and a fixed efficiency baseline.

### 2. Chronograph correction

If the user enters measured FPS, available energy is recalibrated with the squared speed ratio:

```text
energyRatio = clamp((measuredFPS / estimatedFPS)^2, 0.65, 1.5)
calibratedAvailableEnergy = availableEnergy * energyRatio
```

This makes the bow-side severity depend on measured launch performance instead of relying only on catalog specs.

### 3. Compound required spine

```text
spineRequired =
  K
  * (adjustedDrawWeight / 70)^drawWeightExponent
  * (arrowLength / 28)^lengthExponent
  * (availableEnergy / referenceEnergy)^energyExponent
```

Where `adjustedDrawWeight` injects smooth chart-style corrections:

```text
adjustedDrawWeight =
  drawWeight
  + blend * (
      iboAdjustment
      + shortBraceAdjustment
      + frontWeightAdjustment
    )
```

Current chart-side corrections are continuous, not bucketed:

- higher `IBO` pushes required spine stiffer
- lower `brace height` pushes required spine stiffer
- higher total front weight pushes required spine stiffer

Recurve/traditional required spine uses a simpler calibrated power law:

```text
spineRequired =
  K_recurve
  * (drawWeight / 40)^(-0.85)
  * sqrt(arrowLength / 28)
  / (drawLength / 28)^0.3
```

## Arrow-Side Model

Dynamic spine is built multiplicatively:

```text
spineDynamic =
  staticSpine
  * lengthFactor
  * frontMassFactor
  * fletchingFactor
  * releaseFactor
  * wrapFactor
  * rearMassFactor
  * stringDynamicFactor
  * temperatureFactor?
```

### Dynamic factors

- `lengthFactor`: longer shafts behave weaker.
- `frontMassFactor`: more total front mass behaves weaker.
- `fletchingFactor`: more or heavier vanes slightly stiffen the dynamic reaction.
- `releaseFactor`: finger release weakens dynamic spine; pre-gate release slightly stiffens it.
- `wrapFactor`: wrap weight is proportional, not binary.
- `rearMassFactor`: extra nock-side mass slightly stiffens the dynamic reaction.
- `stringDynamicFactor`: heavier string-side accessories and `dacron` make the arrow act dynamically stiffer.
- `temperatureFactor`: only applied to carbon shafts.

FOC is computed from component moments and used for feedback, not as a direct multiplicative spine factor.

## Velocity Model

The app returns:

- `calculatedFPS`: model-estimated speed after bow and string adjustments
- `measuredFPS`: chronograph speed provided by the user
- `effectiveFPS`: the value actually used by the final result

If a chronograph value is present, `effectiveFPS = measuredFPS`; otherwise it uses the model estimate.

## Safety and Guidance

The final result also emits:

- confidence intervals for required spine, dynamic spine, and match index
- warnings for unsafe `GPP`, extreme speed, and severe weak/stiff setups
- recommendations for low speed, heavy/light arrows, FOC issues, temperature drift, and edge cases

## Calibration Workflow

Calibration lives in three files:

- [src/data/official/compoundDatabase.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/official/compoundDatabase.ts)
- [src/utils/spineCalibrationDataset.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibrationDataset.ts)
- [src/utils/spineCalibration.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibration.ts)
- [scripts/calibrate-compound.mjs](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/calibrate-compound.mjs)

The current workflow:

1. Evaluate a weighted compound dataset of exact and chart-style cases.
2. Penalize solutions that break physical monotonicity.
3. Run a grid search over the compound calibration constants.

Monotonicity checks currently enforce:

- faster bows require stiffer spine
- lower brace height requires stiffer spine
- heavier front weight requires stiffer spine and weakens dynamic spine
- finger release weakens dynamic spine
- heavier rear mass slightly stiffens dynamic spine

Run the calibrator with:

```bash
pnpm run calibrate:compound
```

## Source References

The code is contrasted primarily against:

- Easton selector logic and hunting spine charts
- Gold Tip selection charts and front-weight semantics
- Hoyt safety guidance

The model is still an inference layer built on top of those references, not a manufacturer-published continuous equation.

## Limitations

- Compound is the most calibrated path; recurve/traditional remain simpler.
- The model still depends heavily on input quality.
- Real chronograph FPS improves the result more than any extra heuristic.
- Paper tune, bareshaft and broadhead feedback are not yet fed back into the model.
