# Archery Metrics

Aplicación web para evaluar compatibilidad de flecha y arco a partir de `spine requerido`, `spine dinámico` y `match index`.

La app está orientada a uso rápido en móvil, pero mantiene un modelo matemático calibrado para `compound`, `recurve` y `traditional`. Todo el cálculo interno usa unidades canónicas imperiales; la interfaz convierte globalmente entre `Imperial` y `Metric`.

## Qué hace

- Calcula `spineRequired`, `spineDynamic`, `matchIndex`, `FOC`, peso total de flecha y velocidad estimada.
- Permite introducir `velocidad medida por cronógrafo` para recalibrar la severidad real del arco.
- Muestra advertencias de seguridad por `GPP`, velocidad extrema y desajustes severos de spine.
- Incluye `asistente de tuning` con cambios sugeridos por impacto.
- Incluye `comparador de setups` contra slots guardados en `localStorage`.
- Soporta `ES/EN` y `Imperial/Métrico` a nivel global.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Vitest

## Scripts

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm run calibrate:compound
```

## Estructura útil

- [src/App.tsx](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/App.tsx): composición principal de UI, formularios, presets y flujo de pantalla.
- [src/utils/archeryCalculator.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/archeryCalculator.ts): núcleo del algoritmo.
- [src/constants.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/constants.ts): constantes físicas y de calibración.
- [src/data/official/compoundDatabase.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/official/compoundDatabase.ts): base versionada de fuentes oficiales, reglas, bows, shafts y casos compound.
- [src/utils/spineCalibrationDataset.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibrationDataset.ts): dataset compound de calibración.
- [src/utils/spineCalibration.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibration.ts): evaluación de error y checks de monotonicidad.
- [scripts/calibrate-compound.mjs](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/calibrate-compound.mjs): búsqueda en rejilla para recalibrar compound.
- [src/utils/tuningAssistant.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/tuningAssistant.ts): sugerencias de tuning.
- [src/utils/setupComparison.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/setupComparison.ts): heurística de comparación entre setups.

## Modelo actual

El modelo separa dos lados:

1. `spineRequired`: lo que exige el arco.
2. `spineDynamic`: cómo actúa realmente la flecha.

La relación es:

```text
matchIndex = spineDynamic / spineRequired
```

Interpretación:

- `< 0.90`: flecha rígida
- `0.90 – 1.10`: buena zona
- `> 1.10`: flecha blanda

Para compound, `spineRequired` mezcla:

- peso de tiro
- energía disponible del arco
- longitud de flecha
- correcciones continuas de chart por `IBO`, `brace height` corto y peso frontal total

Para `spineDynamic`, el modelo combina:

- static spine
- longitud de shaft
- masa frontal
- método de suelta
- emplumado
- wrap
- masa trasera cerca del nock
- masa/material en la cuerda
- temperatura, si se aporta

Si el usuario mete `FPS de cronógrafo`, la app recalibra la energía efectiva del arco usando la relación entre velocidad estimada y medida, lo que reduce bastante el error del lado del arco.

## Calibración

El proyecto ya no depende de archivos de reproducción manual. La calibración viva está en:

- `src/data/official/compoundDatabase.ts`
- dataset compound con casos reales y casos tipo chart
- checks de monotonicidad física
- script `pnpm run calibrate:compound`

El calibrador evalúa:

- error absoluto medio
- error absoluto ponderado
- error máximo
- monotonicidad de velocidad, brace, peso frontal, finger release y masa trasera

## Tests

La suite cubre:

- cálculo principal de spine
- validación con casos reales
- conversiones de unidades
- asistente de tuning
- comparador de setups
- calibración compound y monotonicidad

## Documentación técnica

- Inglés: [ALGORITHM.md](/mnt/c/users/izerg/desktop/personal/archery-metrics/ALGORITHM.md)
- Español: [ALGORITMO.md](/mnt/c/users/izerg/desktop/personal/archery-metrics/ALGORITMO.md)

## Limpieza realizada

Se eliminaron archivos legacy de reproducción manual (`repro_*`, `.txt` de salida) y componentes de UI que ya no estaban conectados a la app actual. El source of truth ahora es el código en `src/`, la suite de tests y el dataset de calibración.
