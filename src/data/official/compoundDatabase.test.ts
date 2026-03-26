import { describe, expect, it } from 'vitest'
import { ARCHERY_TYPE } from '../../constants'
import { calculateSpineMatch, type ArrowSpecs, type BowSpecs } from '../../utils/archeryCalculator'
import { analyzeOfficialCompoundBenchmarks } from '../../utils/spineCalibration'
import { OFFICIAL_COMPOUND_BENCHMARK_CASES } from '../../utils/spineCalibrationDataset'
import {
  OFFICIAL_COMPOUND_BOW_SPECS_V1,
  OFFICIAL_COMPOUND_CASES_V1,
  OFFICIAL_COMPOUND_DATABASE_VERSION,
  OFFICIAL_COMPOUND_RULES_V1,
  OFFICIAL_COMPOUND_SHAFT_SPECS_V1,
  OFFICIAL_COMPOUND_SOURCES,
  OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS,
} from './compoundDatabase'

const baseBow: BowSpecs = {
  iboVelocity: '335',
  drawLength: '29',
  drawWeight: '70',
  braceHeight: '6.5',
  axleToAxle: '34',
  percentLetoff: '85',
  archeryType: ARCHERY_TYPE.COMPOUND,
}

const baseArrow: ArrowSpecs = {
  shaftLength: '28',
  pointWeight: '100',
  insertWeight: '25',
  shaftGpi: '8.6',
  fletchQuantity: '3',
  weightEach: '8',
  wrapWeight: '10',
  nockWeight: '8',
  bushingPin: '5',
  staticSpine: '0.340',
  shaftMaterial: 'carbon',
}

describe('official compound database', () => {
  it('mantiene una base versionada con cobertura de fabricantes y fuentes oficiales', () => {
    expect(OFFICIAL_COMPOUND_DATABASE_VERSION).toBe('official-compound-v2')
    expect(OFFICIAL_COMPOUND_CASES_V1.length).toBeGreaterThanOrEqual(18)
    expect(OFFICIAL_COMPOUND_RULES_V1.length).toBeGreaterThanOrEqual(8)
    expect(OFFICIAL_COMPOUND_BOW_SPECS_V1.length).toBeGreaterThanOrEqual(3)
    expect(OFFICIAL_COMPOUND_SHAFT_SPECS_V1.length).toBeGreaterThanOrEqual(3)

    const providers = new Set(Object.values(OFFICIAL_COMPOUND_SOURCES).map((source) => source.provider))

    expect(providers.has('Easton')).toBe(true)
    expect(providers.has('Gold Tip')).toBe(true)
    expect(providers.has('Victory')).toBe(true)
    expect(providers.has('Black Eagle')).toBe(true)
    expect(providers.has('Hoyt')).toBe(true)
  })

  it('mantiene un benchmark oficial ya suficientemente amplio para medir error por categoria', () => {
    expect(OFFICIAL_COMPOUND_BENCHMARK_CASES.length).toBeGreaterThanOrEqual(18)

    const analysis = analyzeOfficialCompoundBenchmarks()

    expect(analysis.worstCases.length).toBeGreaterThan(0)
    expect(analysis.categoryBreakdown.length).toBeGreaterThan(10)
    expect(analysis.categoryBreakdown.some((bucket) => bucket.category === 'drawWeightBand')).toBe(true)
    expect(analysis.categoryBreakdown.some((bucket) => bucket.category === 'frontWeightBand')).toBe(true)
    expect(analysis.categoryBreakdown.some((bucket) => bucket.category === 'releaseTypeBand')).toBe(true)
  })

  it('todos los casos oficiales referencian fuentes válidas', () => {
    for (const calibrationCase of OFFICIAL_COMPOUND_CASES_V1) {
      expect(calibrationCase.sourceIds.length).toBeGreaterThan(0)

      for (const sourceId of calibrationCase.sourceIds) {
        expect(OFFICIAL_COMPOUND_SOURCES[sourceId]).toBeDefined()
      }
    }
  })

  it('respeta la semántica oficial de peso frontal total de Gold Tip/Victory', () => {
    const splitA = calculateSpineMatch(
      baseBow,
      {
        ...baseArrow,
        pointWeight: '100',
        insertWeight: '25',
      },
      OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS,
    )

    const splitB = calculateSpineMatch(
      baseBow,
      {
        ...baseArrow,
        pointWeight: '125',
        insertWeight: '0',
      },
      OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS,
    )

    expect(splitA.arrowTotalWeight).toBeCloseTo(splitB.arrowTotalWeight, 10)
    expect(splitA.spineRequired).toBeCloseTo(splitB.spineRequired!, 10)
    expect(splitA.spineDynamic).toBeCloseTo(splitB.spineDynamic!, 10)
    expect(splitA.matchIndex).toBeCloseTo(splitB.matchIndex!, 10)
  })

  it('sigue la dirección oficial de Black Eagle cuando sube el peso de punta', () => {
    const baseline100 = calculateSpineMatch(
      baseBow,
      {
        ...baseArrow,
        pointWeight: '100',
        insertWeight: '0',
      },
      OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS,
    )

    const heavy125 = calculateSpineMatch(
      baseBow,
      {
        ...baseArrow,
        pointWeight: '125',
        insertWeight: '0',
      },
      OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS,
    )

    const light85 = calculateSpineMatch(
      baseBow,
      {
        ...baseArrow,
        pointWeight: '85',
        insertWeight: '0',
      },
      OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS,
    )

    expect(heavy125.spineRequired).toBeLessThan(baseline100.spineRequired!)
    expect(heavy125.matchIndex).toBeGreaterThan(baseline100.matchIndex!)

    expect(light85.spineRequired).toBeGreaterThan(baseline100.spineRequired!)
    expect(light85.matchIndex).toBeLessThan(baseline100.matchIndex!)
  })

  it('mantiene la regla oficial mínima de 5 grains por libra como guardarraíl de seguridad', () => {
    const unsafeLightArrow = calculateSpineMatch(
      {
        ...baseBow,
        drawWeight: '70',
      },
      {
        ...baseArrow,
        shaftLength: '26',
        shaftGpi: '5.5',
        pointWeight: '85',
        insertWeight: '0',
        weightEach: '4',
        wrapWeight: '0',
        nockWeight: '6',
        bushingPin: '0',
      },
      OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS,
    )

    expect(unsafeLightArrow.arrowTotalWeight / 70).toBeLessThan(5)
    expect(unsafeLightArrow.warnings.join(' ')).toMatch(/Flecha muy ligera|Flecha ligera/i)
  })

  it('mantiene el chart oficial como sanity check secundario, no como fuente primaria exacta', () => {
    const summary = analyzeOfficialCompoundBenchmarks().overall

    expect(summary.meanAbsoluteError).toBeLessThan(0.35)
    expect(summary.weightedMeanAbsoluteError).toBeLessThan(0.35)
    expect(summary.maxAbsoluteError).toBeLessThan(0.75)
    expect(summary.inRangeRate).toBeGreaterThan(0.2)
  })

  it('incluye referencias finger-release derivadas de la regla oficial +5 lbs de Easton', () => {
    expect(OFFICIAL_COMPOUND_CASES_V1.some((entry) => entry.id === 'easton_finger_release_55lb_400_29in')).toBe(true)
    expect(OFFICIAL_COMPOUND_CASES_V1.some((entry) => entry.id === 'easton_finger_release_60lb_340_29in')).toBe(true)
  })
})
