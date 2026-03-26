# Algoritmo de Spine

## Alcance

La ruta `compound` de [src/utils/archeryCalculator.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/archeryCalculator.ts) ahora sigue un modelo `SFAX-first`, basado en la ingeniería inversa documentada en [scripts/sfax-databases/SFAX-REVERSE-ENGINEERING.md](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/sfax-databases/SFAX-REVERSE-ENGINEERING.md) y contrastado con [src/data/sfax/compoundReference.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/sfax/compoundReference.ts).

Los charts oficiales de Easton, Gold Tip, Victory y Black Eagle se conservan como comprobación secundaria en [src/data/official/compoundDatabase.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/official/compoundDatabase.ts). Ya no gobiernan la ecuación principal de compound.

## Semántica del resultado

La app expone tres valores principales:

- `spineRequired`: el objetivo de spine dinámico que devuelve SFAX para la configuración actual de arco + flecha.
- `spineDynamic`: el spine estático seleccionado en el shaft, con corrección opcional por temperatura para carbono.
- `matchIndex = spineDynamic / spineRequired`

Interpretación:

- `< 0.90`: rígida
- `0.90 - 1.10`: buena zona
- `> 1.10`: blanda

Es decir: la app compara la flecha que has elegido contra el objetivo que el resto del setup está pidiendo.

## Modelo de unidades

- Internamente todo se calcula en unidades imperiales canónicas.
- La UI convierte globalmente entre imperial y métrico.
- La velocidad puede venir del modelo SFAX o de un cronógrafo opcional.

## Pipeline Compound

### 1. Peso total de flecha

Primero se construye `TAW` a partir de:

- peso total medido, si el usuario lo aporta
- si no, GPI del shaft + longitud + punta + inserto + plumas + wrap + nock + bushing

Ese mismo peso se reutiliza luego en velocidad, `gr/lb`, `KE` y match.

### 2. Modelo de velocidad SFAX

La ruta de velocidad compound sigue `FUN_0047bf60` / `FUN_0047c410` / `FUN_0046e540`:

```text
adjustedVelocity = IBO + (DW - 70) * 0.325 + (BH - 7) * 10.2
efficiency = ((adjustedVelocity - 325) / 5.35 + 82) / 100
```

Después:

- aplica la caída SFAX por clases de peso desde `300gr`
- deriva `drawWeightFactor` y `drawLengthFactor`
- calcula la velocidad de referencia a `350gr`
- deriva el factor de corrección por peso
- resta el bundle SFAX de drag por cuerda y emplumado

El resultado final de esa rama es:

- `calculatedFPS`
- `effectiveFPS`
- `KE = TAW * FPS² / 450240`

### 3. Objetivo de spine dinámico SFAX

El objetivo compound sale de la rama correspondiente de `FUN_0046da20`.

En forma resumida:

```text
base = (IBO / 290) * (drawCurve(DW) + DW)
base -= a2aCurve(A2A)

lengthFactor = (2.75 / 80) * (base - 50) + 20.75
velocityRatio = (BH / powerStroke) * IBO * (powerStroke / lengthFactor)

adjusted = base + (velocityRatio / 30) * (powerStroke - lengthFactor)
adjusted += letoffAdjustment
adjusted += releaseAdjustment
```

Luego compound y non-compound comparten el mismo post-procesado:

```text
adjusted
  - (75 - frontMass) * 0.12
  - ((wrap + totalFletchWeight) - 30) * 0.12
  - ((bushing + nock) - 12) * 0.12
  - fletchLength * 0.12
  - (stringAccessoryWeight + stringOffset + fletchHeight) * 0.12
  - dacronAdjustment?
```

Conversión final:

```text
dynamicSpineTarget = (28 / adjusted) * (28 / shaftLength) + shaftCategoryConstant
```

Donde `shaftCategoryConstant` es:

- `0.00421875` base
- `0.01265625` caza
- `0.02109375` target

### 4. Direcciones exactas del modelo

Con el port exacto de SFAX, estas son las direcciones esperadas:

- un arco más rápido -> objetivo de spine más pequeño
- menos brace height -> objetivo de spine más pequeño
- más peso frontal -> objetivo de spine más pequeño
- `finger release` -> objetivo de spine más pequeño
- más masa trasera -> objetivo de spine más grande
- pluma más larga -> objetivo de spine más grande
- más masa en cuerda -> objetivo de spine más grande
- `dacron` -> objetivo de spine más grande

Estas relaciones se validan en [src/utils/spineCalibration.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibration.ts).

## FOC

`FOC` usa el modelo de momentos de SFAX:

- longitud total = `shaftLength + 0.5`
- el CG frontal depende de la profundidad del inserto
- CG de plumas = `shaftLength - fletchLength / 3 - 1`
- CG del wrap = `shaftLength - 3`

Implementación: [src/utils/archeryCalculator.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/archeryCalculator.ts)

## Corrección por cronógrafo

Si el usuario introduce FPS medidos:

```text
targetSpine = targetSpine / clamp(measuredFPS / calculatedFPS, 0.85, 1.15)
```

Esto no sustituye SFAX. Solo afina el objetivo con la velocidad real de salida.

## Datasets y validación

Benchmark principal:

- [src/data/sfax/compoundReference.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/sfax/compoundReference.ts)

Dataset secundario de sanity check:

- [src/data/official/compoundDatabase.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/official/compoundDatabase.ts)

Herramientas de análisis:

- [src/utils/spineCalibrationDataset.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibrationDataset.ts)
- [src/utils/spineCalibration.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibration.ts)
- [scripts/calibrate-compound.mjs](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/calibrate-compound.mjs)
- [scripts/analyze-compound-calibration.mjs](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/analyze-compound-calibration.mjs)

`pnpm run calibrate:compound` ahora es un script de auditoría, no una búsqueda en rejilla. Informa de:

- fidelidad frente a SFAX
- compatibilidad secundaria con charts oficiales
- checks de monotonicidad

`pnpm run analyze:compound` desglosa error por buckets y peores casos.

## Objetivos actuales de validación

Ahora mismo el repo intenta mantenerse aproximadamente dentro de:

- MAE de spine dinámico SFAX claramente por debajo de `0.02`
- MAE de FPS SFAX por debajo de `5 fps`
- FOC muy cerca de las salidas de referencia SFAX

Usa esos scripts para ver el estado real actual en vez de repetir números a mano en otros sitios.

## Limitaciones

- Compound tiene benchmark real de SFAX; recurvo/tradicional están portados de la misma familia de funciones pero con menos datos de referencia.
- Los valores de referencia de brace height y letoff que usa la subrutina de velocidad SFAX se degradan al valor actual de UI cuando no hay metadatos extra del arco.
- La app todavía no autocompleta todos los campos internos de SFAX desde un selector de bows/shafts.
- Aún no se retroalimenta el modelo con paper tune, bareshaft o broadhead tune.
