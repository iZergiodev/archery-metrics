# Algoritmo de Spine

## Alcance

Este documento describe el modelo actual implementado en [src/utils/archeryCalculator.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/archeryCalculator.ts) y calibrado mediante [src/utils/spineCalibrationDataset.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibrationDataset.ts).

La base de fuentes oficiales que alimenta esa calibración vive en [src/data/official/compoundDatabase.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/official/compoundDatabase.ts).

La app calcula tres valores principales:

- `spineRequired`: la rigidez que exige el arco.
- `spineDynamic`: cómo actúa realmente la flecha.
- `matchIndex = spineDynamic / spineRequired`

Interpretación:

- `< 0.90`: rígida
- `0.90 - 1.10`: buena zona
- `> 1.10`: blanda

## Modelo de unidades

- Internamente todo se calcula en unidades imperiales canónicas.
- La UI convierte globalmente entre imperial y métrico.
- La velocidad puede venir del modelo o de una lectura opcional de cronógrafo.

## Modelo del arco

### 1. Energía almacenada y disponible

Para compound:

```text
storedEnergy = drawWeight * (drawLength - braceHeight) * camEfficiency * letOffRatio / 12
availableEnergy = storedEnergy * bowEfficiency
```

Entradas clave:

- `drawWeight`
- `drawLength`
- `braceHeight`
- `percentLetoff`
- `camAggressiveness`
- `iboVelocity`

Para recurvo/tradicional se usa una aproximación lineal más simple y una eficiencia base fija.

### 2. Corrección por cronógrafo

Si el usuario introduce FPS medidos, la energía disponible se recalibra con el cuadrado de la relación de velocidades:

```text
energyRatio = clamp((measuredFPS / estimatedFPS)^2, 0.65, 1.5)
calibratedAvailableEnergy = availableEnergy * energyRatio
```

Eso hace que la severidad del arco dependa del rendimiento real medido y no solo de la ficha técnica.

### 3. Spine requerido en compound

```text
spineRequired =
  K
  * (adjustedDrawWeight / 70)^drawWeightExponent
  * (arrowLength / 28)^lengthExponent
  * (availableEnergy / referenceEnergy)^energyExponent
```

Donde `adjustedDrawWeight` añade correcciones suaves de tipo chart:

```text
adjustedDrawWeight =
  drawWeight
  + blend * (
      iboAdjustment
      + shortBraceAdjustment
      + frontWeightAdjustment
    )
```

Las correcciones actuales son continuas, no por buckets:

- más `IBO` pide spine más rígido
- menos `brace height` pide spine más rígido
- más peso frontal total pide spine más rígido

Para recurvo/tradicional el spine requerido usa una ley de potencias calibrada:

```text
spineRequired =
  K_recurve
  * (drawWeight / 40)^(-0.85)
  * sqrt(arrowLength / 28)
  / (drawLength / 28)^0.3
```

## Modelo de la flecha

El spine dinámico se construye multiplicando factores:

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

### Factores dinámicos

- `lengthFactor`: un shaft más largo actúa más blando.
- `frontMassFactor`: más masa frontal actúa más blando.
- `fletchingFactor`: más pluma o más peso atrás endurece ligeramente la reacción.
- `releaseFactor`: soltar con dedos debilita el spine dinámico; `pre-gate` lo endurece un poco.
- `wrapFactor`: el wrap escala por peso, ya no es binario.
- `rearMassFactor`: más masa en el nock endurece ligeramente la reacción.
- `stringDynamicFactor`: más masa en cuerda y `dacron` hacen que la flecha actúe más rígida.
- `temperatureFactor`: solo se aplica a shafts de carbono.

El `FOC` se calcula con momentos de masa y se usa para feedback, no como multiplicador directo del spine.

## Modelo de velocidad

La app devuelve:

- `calculatedFPS`: velocidad estimada por el modelo
- `measuredFPS`: velocidad introducida desde cronógrafo
- `effectiveFPS`: velocidad usada realmente por el resultado

Si hay cronógrafo, `effectiveFPS = measuredFPS`; si no, usa la estimación del modelo.

## Seguridad y feedback

El resultado final también emite:

- intervalos de confianza para `spineRequired`, `spineDynamic` y `matchIndex`
- advertencias por `GPP`, velocidad extrema y casos severos de rigidez/blandura
- recomendaciones por baja velocidad, peso de flecha, FOC, temperatura y casos límite

## Flujo de calibración

La calibración vive en:

- [src/data/official/compoundDatabase.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/official/compoundDatabase.ts)
- [src/utils/spineCalibrationDataset.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibrationDataset.ts)
- [src/utils/spineCalibration.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibration.ts)
- [scripts/calibrate-compound.mjs](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/calibrate-compound.mjs)

Flujo actual:

1. evaluar un dataset compound ponderado con casos exactos y casos tipo chart
2. penalizar soluciones que rompan monotonicidad física
3. ejecutar una búsqueda en rejilla sobre las constantes compound

Las checks de monotonicidad exigen:

- un arco más rápido debe pedir más rigidez
- menos brace height debe pedir más rigidez
- más peso frontal debe pedir más rigidez y debilitar la flecha
- finger release debe debilitar la flecha
- más masa trasera debe endurecer ligeramente la flecha

Para ejecutar la calibración:

```bash
pnpm run calibrate:compound
```

## Referencias de contraste

El código se contrasta sobre todo con:

- lógica del selector y charts de Easton
- charts de Gold Tip y semántica de peso frontal total
- guías de seguridad de Hoyt

El modelo sigue siendo una inferencia continua construida encima de esas referencias; no es una ecuación oficial publicada por los fabricantes.

## Limitaciones

- Compound es la vía mejor calibrada; recurvo/tradicional siguen siendo más simples.
- La calidad del input sigue mandando mucho sobre la precisión final.
- Un FPS real de cronógrafo mejora más el resultado que otra heurística pequeña.
- Aún no se incorpora feedback de paper tune, bareshaft o broadhead tune al modelo.
