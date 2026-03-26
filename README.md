# Archery Metrics

Aplicación web para analizar compatibilidad de flecha y arco con foco en `compound` usando el algoritmo reverse-engineered de `SoftwareForArchers Xpert / OnTarget2!-SFAX`.

La UI está pensada primero para móvil, pero todo el cálculo corre en unidades imperiales canónicas y la interfaz convierte globalmente entre `Imperial` y `Metric`.

## Qué hace

- Calcula el objetivo de spine SFAX para el setup actual.
- Compara ese objetivo con el `static spine` seleccionado y devuelve `matchIndex`.
- Calcula `FPS`, `TAW`, `gr/lb`, `KE` y `FOC`.
- Acepta `FPS medido por cronógrafo` para corregir el objetivo con velocidad real.
- Incluye `asistente de tuning` y `comparador de setups`.
- Soporta `ES/EN` y `Imperial/Métrico` a nivel global.

## Semántica del resultado

La app usa estos tres valores:

1. `spineRequired`: objetivo SFAX de spine dinámico para la configuración actual.
2. `spineDynamic`: spine estático seleccionado en la flecha.
3. `matchIndex = spineDynamic / spineRequired`

Interpretación:

- `< 0.90`: rígida
- `0.90 – 1.10`: buena zona
- `> 1.10`: blanda

## Source of Truth

Para `compound`, la fuente principal ya no es un modelo heurístico propio. Ahora es:

- [scripts/sfax-databases/SFAX-REVERSE-ENGINEERING.md](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/sfax-databases/SFAX-REVERSE-ENGINEERING.md)
- [src/data/sfax/compoundReference.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/sfax/compoundReference.ts)
- [src/utils/archeryCalculator.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/archeryCalculator.ts)

Los charts oficiales en [src/data/official/compoundDatabase.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/official/compoundDatabase.ts) siguen en el repo como sanity check secundario.

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
pnpm run analyze:compound
```

## Estructura útil

- [src/App.tsx](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/App.tsx): UI principal, formularios, presets y flujo de pantalla.
- [src/utils/archeryCalculator.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/archeryCalculator.ts): port principal del algoritmo.
- [src/constants.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/constants.ts): constantes compartidas.
- [src/data/sfax/compoundReference.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/sfax/compoundReference.ts): benchmark primario SFAX.
- [src/data/official/compoundDatabase.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/data/official/compoundDatabase.ts): sanity checks y referencias oficiales.
- [src/utils/spineCalibration.ts](/mnt/c/users/izerg/desktop/personal/archery-metrics/src/utils/spineCalibration.ts): análisis de error y monotonicidad.
- [scripts/calibrate-compound.mjs](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/calibrate-compound.mjs): auditoría de fidelidad SFAX y compatibilidad secundaria.
- [scripts/analyze-compound-calibration.mjs](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/analyze-compound-calibration.mjs): breakdown por categorías y peores casos.
- [scripts/run-vitest-portable.mjs](/mnt/c/users/izerg/desktop/personal/archery-metrics/scripts/run-vitest-portable.mjs): runner portátil para Vitest.

## Validación

Verificación actual del repo:

- `pnpm exec tsc --noEmit -p tsconfig.app.json`
- `pnpm test`
- `pnpm run analyze:compound`

En el estado actual del código:

- la fidelidad SFAX de `dynamic spine` está en error medio muy bajo
- la fidelidad SFAX de `FPS` ya cae en un margen corto, de pocos fps
- el benchmark oficial queda como compatibilidad secundaria, no como objetivo principal

Usa `pnpm run analyze:compound` para ver las métricas exactas del commit actual.

## Documentación técnica

- Inglés: [ALGORITHM.md](/mnt/c/users/izerg/desktop/personal/archery-metrics/ALGORITHM.md)
- Español: [ALGORITMO.md](/mnt/c/users/izerg/desktop/personal/archery-metrics/ALGORITMO.md)
