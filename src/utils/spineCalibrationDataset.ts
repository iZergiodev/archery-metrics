import { ARCHERY_TYPE } from '../constants'
import {
  OFFICIAL_COMPOUND_CASES_V1,
  OFFICIAL_COMPOUND_DATABASE_VERSION,
  OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS,
  type OfficialSourceId,
} from '../data/official/compoundDatabase'
import type { ArrowSpecs, BowSpecs, StringWeights } from './archeryCalculator'

export type CompoundCalibrationCase = {
  id: string
  source: string
  sourceType: 'official_chart' | 'project_reference'
  sourceIds: OfficialSourceId[]
  confidence: 'high' | 'medium'
  datasetVersion: string
  expectedMatchIndex: number
  acceptableMatchRange?: {
    min: number
    max: number
  }
  weight: number
  bow: BowSpecs
  arrow: ArrowSpecs
  stringWeights?: StringWeights
}

export const DEFAULT_CALIBRATION_STRING_WEIGHTS: StringWeights = OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS

export const OFFICIAL_COMPOUND_CALIBRATION_CASES: CompoundCalibrationCase[] = OFFICIAL_COMPOUND_CASES_V1.map((entry) => ({
  id: entry.id,
  source: entry.source,
  sourceType: 'official_chart',
  sourceIds: entry.sourceIds,
  confidence: entry.confidence,
  datasetVersion: OFFICIAL_COMPOUND_DATABASE_VERSION,
  expectedMatchIndex: entry.expectedMatchIndex,
  acceptableMatchRange: entry.acceptableMatchRange,
  weight: entry.calibrationWeight,
  bow: entry.bow,
  arrow: entry.arrow,
  stringWeights: entry.stringWeights,
}))

export const PROJECT_REFERENCE_COMPOUND_CALIBRATION_CASES: CompoundCalibrationCase[] = [
  {
    id: 'mathews_v3x_33_easton_300',
    source: 'Mathews specs + Easton selector-aligned 300 spine setup',
    sourceType: 'project_reference',
    sourceIds: ['easton_hunting_selector_2023'],
    confidence: 'medium',
    datasetVersion: OFFICIAL_COMPOUND_DATABASE_VERSION,
    expectedMatchIndex: 1,
    weight: 1.2,
    bow: {
      iboVelocity: '350',
      drawLength: '30',
      drawWeight: '75',
      braceHeight: '6.5',
      axleToAxle: '33',
      percentLetoff: '85',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '31',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '9.8',
      fletchQuantity: '4',
      weightEach: '8',
      wrapWeight: '15',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.300',
      shaftMaterial: 'aluminum',
    },
  },
  {
    id: 'hoyt_rexon_easton_340',
    source: 'Hoyt specs + Easton selector-aligned 340 spine setup',
    sourceType: 'project_reference',
    sourceIds: ['easton_hunting_selector_2023'],
    confidence: 'medium',
    datasetVersion: OFFICIAL_COMPOUND_DATABASE_VERSION,
    expectedMatchIndex: 1,
    weight: 1,
    bow: {
      iboVelocity: '350',
      drawLength: '30',
      drawWeight: '70',
      braceHeight: '7',
      axleToAxle: '36',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '31',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '8.4',
      fletchQuantity: '3',
      weightEach: '6',
      wrapWeight: '10',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.340',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'bowtech_realm_easton_400',
    source: 'Bowtech specs + Easton selector-aligned 400 spine setup',
    sourceType: 'project_reference',
    sourceIds: ['easton_hunting_selector_2023'],
    confidence: 'medium',
    datasetVersion: OFFICIAL_COMPOUND_DATABASE_VERSION,
    expectedMatchIndex: 1,
    weight: 1,
    bow: {
      iboVelocity: '340',
      drawLength: '28',
      drawWeight: '60',
      braceHeight: '7',
      axleToAxle: '32',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '32',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '7.4',
      fletchQuantity: '4',
      weightEach: '6',
      wrapWeight: '12',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.400',
      shaftMaterial: 'carbon',
    },
  },
]

export const COMPOUND_CALIBRATION_CASES: CompoundCalibrationCase[] = [
  ...PROJECT_REFERENCE_COMPOUND_CALIBRATION_CASES,
  ...OFFICIAL_COMPOUND_CALIBRATION_CASES,
]
