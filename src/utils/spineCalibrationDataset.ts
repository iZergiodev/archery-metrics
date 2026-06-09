import { OFFICIAL_COMPOUND_CASES_V1, OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS, type OfficialSourceId } from '../data/official/compoundDatabase'
import { OFFICIAL_RECURVE_CASES_V1, OFFICIAL_RECURVE_DATABASE_VERSION } from '../data/official/recurveDatabase'
import { SFAX_COMPOUND_REFERENCE_CASES_V1 } from '../data/sfax/compoundReference'
import type { ArrowSpecs, BowSpecs, StringWeights } from './archeryCalculator'

export type CompoundCalibrationCase = {
  id: string
  source: string
  sourceType: 'sfax_reference' | 'official_chart'
  sourceIds: OfficialSourceId[]
  confidence: 'high' | 'medium'
  datasetVersion: string
  expectedMatchIndex?: number
  acceptableMatchRange?: {
    min: number
    max: number
  }
  weight: number
  bow: BowSpecs
  arrow: ArrowSpecs
  stringWeights?: StringWeights
}

export type SfaxReferenceBenchmarkCase = {
  id: string
  label: string
  source: string
  completeness: 'full' | 'partial'
  weight: number
  bow: BowSpecs
  arrow: ArrowSpecs
  stringWeights: StringWeights
  sfaxResults: {
    fps: number
    ke: number
    foc: number
    totalArrowWeight: number
    grlb: number
    staticSpine: number
    dynamicSpine: number
  }
}

export const DEFAULT_CALIBRATION_STRING_WEIGHTS: StringWeights = OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS

export const SFAX_REFERENCE_DATASET_VERSION = 'sfax-reference-v1'

export const SFAX_PRIMARY_REFERENCE_CASES: SfaxReferenceBenchmarkCase[] = SFAX_COMPOUND_REFERENCE_CASES_V1.map((entry) => ({
  ...entry,
  weight: entry.completeness === 'full' ? 1 : 0.7,
}))

export const OFFICIAL_COMPOUND_SANITY_CASES: CompoundCalibrationCase[] = OFFICIAL_COMPOUND_CASES_V1.map((entry) => ({
  id: entry.id,
  source: entry.source,
  sourceType: 'official_chart' as const,
  sourceIds: entry.sourceIds,
  confidence: entry.confidence,
  datasetVersion: 'official-compound-v2',
  expectedMatchIndex: entry.expectedMatchIndex,
  acceptableMatchRange: entry.acceptableMatchRange,
  weight: entry.calibrationWeight,
  bow: entry.bow,
  arrow: entry.arrow,
  stringWeights: entry.stringWeights,
}))

export const OFFICIAL_COMPOUND_CALIBRATION_CASES = OFFICIAL_COMPOUND_SANITY_CASES.filter((entry) => {
  const sourceEntry = OFFICIAL_COMPOUND_CASES_V1.find((candidate) => candidate.id === entry.id)
  return sourceEntry?.usage !== 'benchmark'
})

export const OFFICIAL_COMPOUND_BENCHMARK_CASES = OFFICIAL_COMPOUND_SANITY_CASES

export const COMPOUND_CALIBRATION_CASES = OFFICIAL_COMPOUND_CALIBRATION_CASES

// Benchmark non-compound (recurvo/longbow) derivado celda a celda de la carta
// Easton Hunting 2023. Reutiliza la forma de CompoundCalibrationCase para que
// la maquinaria de evaluación sirva para ambos tipos de arco.
export const OFFICIAL_RECURVE_BENCHMARK_CASES: CompoundCalibrationCase[] = OFFICIAL_RECURVE_CASES_V1.map((entry) => ({
  id: entry.id,
  source: entry.source,
  sourceType: 'official_chart' as const,
  sourceIds: entry.sourceIds,
  confidence: entry.confidence,
  datasetVersion: OFFICIAL_RECURVE_DATABASE_VERSION,
  expectedMatchIndex: entry.expectedMatchIndex,
  acceptableMatchRange: entry.acceptableMatchRange,
  weight: entry.calibrationWeight,
  bow: entry.bow,
  arrow: entry.arrow,
  stringWeights: entry.stringWeights,
}))
