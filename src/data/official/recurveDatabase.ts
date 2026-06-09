import { ARCHERY_TYPE } from '../../constants'
import type { ArrowSpecs, BowSpecs, StringWeights } from '../../utils/archeryCalculator'
import type { OfficialSourceId } from './compoundDatabase'

export const OFFICIAL_RECURVE_DATABASE_VERSION = 'official-recurve-v1'

// Casos derivados celda a celda de la carta Easton Hunting 2023 (doc
// 301055-A), columnas RECURVE y LONGBOW, leída del PDF oficial. Cada rango
// aceptable es la celda impresa (spine débil/rígido) con un margen del ±4.5%
// por la cuantización de la carta (filas de 5 lb y columnas de 1": ±3.1% cada
// una, combinadas en cuadratura). matchIndex = spineEstático / spineRequerido.
export type OfficialRecurveCaseDefinition = {
  id: string
  sourceIds: OfficialSourceId[]
  source: string
  confidence: 'high' | 'medium'
  expectedMatchIndex?: number
  acceptableMatchRange: {
    min: number
    max: number
  }
  calibrationWeight: number
  bow: BowSpecs
  arrow: ArrowSpecs
  stringWeights: StringWeights
}

export const OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS: StringWeights = {
  peep: '0',
  dLoop: '0',
  nockPoint: '2',
  silencers: '0',
  silencerDfc: '0',
  releaseType: 'fingers',
  stringMaterial: 'dacron',
}

const baseRecurveBow = (drawWeight: string, drawLength = '28'): BowSpecs => ({
  iboVelocity: '',
  drawLength,
  drawWeight,
  braceHeight: '8',
  axleToAxle: '',
  percentLetoff: '',
  archeryType: ARCHERY_TYPE.RECURVO,
})

const baseRecurveArrow = (shaftLength: string, staticSpine: string, pointWeight = '100'): ArrowSpecs => ({
  shaftLength,
  pointWeight,
  insertWeight: '0',
  shaftGpi: '8.0',
  fletchQuantity: '3',
  weightEach: '3',
  fletchLength: '3',
  fletchHeight: '0.5',
  wrapWeight: '0',
  nockWeight: '7',
  bushingPin: '0',
  staticSpine,
  shaftMaterial: 'carbon',
})

export const OFFICIAL_RECURVE_CASES_V1: OfficialRecurveCaseDefinition[] = [
  {
    id: 'easton_recurve_28lb_28in_600',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 24-28 lb, flecha 28in -> celda 600-500',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.955, max: 1.254 },
    calibrationWeight: 0.8,
    bow: baseRecurveBow('28'),
    arrow: baseRecurveArrow('28', '0.600'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_31lb_28in_500',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 29-32 lb, flecha 28in -> celda 600-500 (extremo rígido)',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.796, max: 1.045 },
    calibrationWeight: 0.8,
    bow: baseRecurveBow('31'),
    arrow: baseRecurveArrow('28', '0.500'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_35lb_28in_500',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 33-36 lb, flecha 28in -> celda 500-400',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.955, max: 1.306 },
    calibrationWeight: 1,
    bow: baseRecurveBow('35'),
    arrow: baseRecurveArrow('28', '0.500'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_40lb_28in_450',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 37-41 lb, flecha 28in -> celda 500-400 (centro)',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.86, max: 1.176 },
    calibrationWeight: 1,
    bow: baseRecurveBow('40'),
    arrow: baseRecurveArrow('28', '0.450'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_45lb_26in_500',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 42-46 lb, flecha 26in -> celda 500-400',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.955, max: 1.306 },
    calibrationWeight: 0.9,
    bow: baseRecurveBow('45'),
    arrow: baseRecurveArrow('26', '0.500'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_50lb_28in_400',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 47-51 lb, flecha 28in -> celda 400-350',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.955, max: 1.194 },
    calibrationWeight: 1,
    bow: baseRecurveBow('50'),
    arrow: baseRecurveArrow('28', '0.400'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_55lb_30in_350',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 52-56 lb, flecha 30in -> celda 350-300',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.955, max: 1.219 },
    calibrationWeight: 0.9,
    bow: baseRecurveBow('55'),
    arrow: baseRecurveArrow('30', '0.350'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_60lb_28in_400',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 57-61 lb, flecha 28in -> celda 400-350 (extremo débil)',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.955, max: 1.194 },
    calibrationWeight: 0.9,
    bow: baseRecurveBow('60'),
    arrow: baseRecurveArrow('28', '0.400'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_65lb_28in_340',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 62-66 lb, flecha 28in -> celda 350-300',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.928, max: 1.184 },
    calibrationWeight: 0.9,
    bow: baseRecurveBow('65'),
    arrow: baseRecurveArrow('28', '0.340'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_70lb_29in_300',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 67-72 lb, flecha 29in -> celda 350-300 (extremo rígido)',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.819, max: 1.045 },
    calibrationWeight: 0.8,
    bow: baseRecurveBow('70'),
    arrow: baseRecurveArrow('29', '0.300'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_76lb_28in_340',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 73-78 lb, flecha 28in -> celda 350-300 (extremo débil)',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.928, max: 1.184 },
    calibrationWeight: 0.7,
    bow: baseRecurveBow('76'),
    arrow: baseRecurveArrow('28', '0.340'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_82lb_28in_300',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo: fila 79-84 lb, flecha 28in -> celda 300-250',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.955, max: 1.254 },
    calibrationWeight: 0.7,
    bow: baseRecurveBow('82'),
    arrow: baseRecurveArrow('28', '0.300'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_40lb_28in_125gr_450',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo + regla de puntas: 40 lb con 125 gr (+3 lb) -> fila 42-46, 28in -> celda 500-400',
    confidence: 'high',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.86, max: 1.176 },
    calibrationWeight: 0.9,
    bow: baseRecurveBow('40'),
    arrow: baseRecurveArrow('28', '0.450', '125'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_recurve_45lb_28in_fastflight_400',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 recurvo + cuerda de bajo estiramiento (+3 lb): 45 lb -> fila 47-51, 28in -> celda 400-350',
    confidence: 'medium',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.955, max: 1.194 },
    calibrationWeight: 0.7,
    bow: baseRecurveBow('45'),
    arrow: baseRecurveArrow('28', '0.400'),
    stringWeights: { ...OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS, stringMaterial: 'fastflight' },
  },
  {
    id: 'easton_longbow_45lb_28in_350',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 longbow (mapeo impreso +20 lb): 45 lb longbow ≙ fila 62-66, 28in -> celda 350-300',
    confidence: 'medium',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.955, max: 1.219 },
    calibrationWeight: 0.6,
    bow: { ...baseRecurveBow('45'), archeryType: ARCHERY_TYPE.TRADITIONAL },
    arrow: baseRecurveArrow('28', '0.350'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
  {
    id: 'easton_longbow_30lb_28in_400',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 longbow (mapeo impreso +20 lb): 30 lb longbow ≙ fila 47-51, 28in -> celda 400-350',
    confidence: 'medium',
    expectedMatchIndex: 1,
    acceptableMatchRange: { min: 0.955, max: 1.194 },
    calibrationWeight: 0.6,
    bow: { ...baseRecurveBow('30'), archeryType: ARCHERY_TYPE.TRADITIONAL },
    arrow: baseRecurveArrow('28', '0.400'),
    stringWeights: OFFICIAL_DEFAULT_RECURVE_STRING_WEIGHTS,
  },
]
