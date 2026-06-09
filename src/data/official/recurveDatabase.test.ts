import { describe, expect, it } from 'vitest'
import {
  evaluateOfficialRecurveBenchmarks,
  evaluateRecurveMonotonicity,
  summarizeOfficialRecurveBenchmarks,
} from '../../utils/spineCalibration'
import { OFFICIAL_COMPOUND_SOURCES } from './compoundDatabase'
import { OFFICIAL_RECURVE_CASES_V1, OFFICIAL_RECURVE_DATABASE_VERSION } from './recurveDatabase'

describe('official recurve database', () => {
  it('mantiene una base versionada con cobertura amplia de la carta Easton', () => {
    expect(OFFICIAL_RECURVE_DATABASE_VERSION).toBe('official-recurve-v1')
    expect(OFFICIAL_RECURVE_CASES_V1.length).toBeGreaterThanOrEqual(14)

    const drawWeights = OFFICIAL_RECURVE_CASES_V1.map((entry) => Number(entry.bow.drawWeight))
    expect(Math.min(...drawWeights)).toBeLessThanOrEqual(30)
    expect(Math.max(...drawWeights)).toBeGreaterThanOrEqual(80)

    const traditionalCases = OFFICIAL_RECURVE_CASES_V1.filter((entry) => entry.bow.archeryType === 'traditional')
    expect(traditionalCases.length).toBeGreaterThanOrEqual(2)
  })

  it('todos los casos recurvo referencian fuentes válidas y rangos coherentes', () => {
    for (const recurveCase of OFFICIAL_RECURVE_CASES_V1) {
      expect(recurveCase.sourceIds.length).toBeGreaterThan(0)
      for (const sourceId of recurveCase.sourceIds) {
        expect(OFFICIAL_COMPOUND_SOURCES[sourceId]).toBeDefined()
      }
      expect(recurveCase.acceptableMatchRange.min).toBeLessThan(recurveCase.acceptableMatchRange.max)
      expect(recurveCase.acceptableMatchRange.min).toBeGreaterThan(0.5)
      expect(recurveCase.acceptableMatchRange.max).toBeLessThan(1.7)
    }
  })

  it('el modelo non-compound cae dentro de todas las celdas verificadas de la carta', () => {
    const results = evaluateOfficialRecurveBenchmarks()

    for (const result of results) {
      expect(result.absoluteError, `${result.id} matchIndex=${result.actualMatchIndex.toFixed(4)}`).toBe(0)
    }

    const summary = summarizeOfficialRecurveBenchmarks()
    expect(summary.inRangeRate).toBe(1)
    expect(summary.maxAbsoluteError).toBe(0)
  })

  it('mantiene las direcciones físicas del modelo recurvo/tradicional', () => {
    const checks = evaluateRecurveMonotonicity()
    for (const check of checks) {
      expect(check.passed, `${check.id}: ${check.details}`).toBe(true)
    }
  })
})
