import { ARCHERY_TYPE } from '../../constants'
import type { ArrowSpecs, BowSpecs, StringWeights } from '../../utils/archeryCalculator'

export type SfaxShaftUseCategory = 'base' | 'hunting' | 'target'
export type SfaxInsertType = 'default' | 'shallow' | 'halfOutsert' | 'fullOutsert' | 'extendedOutsert'

export type SfaxReferenceCase = {
  id: string
  label: string
  source: string
  completeness: 'full' | 'partial'
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

const DEFAULT_STRING: StringWeights = {
  peep: '8',
  dLoop: '4',
  nockPoint: '2',
  silencers: '0',
  silencerDfc: '0',
  releaseType: 'Post Gate Release',
  stringMaterial: 'fastflight',
}

const DEFAULT_ARROW_ADVANCED = {
  shaftUseCategory: 'base' as const,
  insertType: 'default' as const,
  fletchLength: '2',
  fletchHeight: '0.5',
  measuredArrowTotalWeight: '',
}

export const SFAX_COMPOUND_REFERENCE_CASES_V1: SfaxReferenceCase[] = [
  {
    id: 'mathews-halonx-vap350',
    label: 'Mathews Halon X + VAP Elite 350',
    source: 'SoftwareForArchers Xpert V2.5.22',
    completeness: 'full',
    bow: {
      iboVelocity: '330',
      drawLength: '30',
      drawWeight: '59',
      braceHeight: '7',
      axleToAxle: '35',
      percentLetoff: '75',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      staticSpine: '0.350',
      shaftLength: '27.75',
      shaftGpi: '8.1',
      pointWeight: '125',
      insertWeight: '50',
      fletchQuantity: '3',
      weightEach: '6',
      wrapWeight: '0',
      nockWeight: '4',
      bushingPin: '10',
      shaftMaterial: 'carbon',
      fletchLength: '2',
      fletchHeight: '0.5',
      shaftUseCategory: 'base',
      insertType: 'default',
      measuredArrowTotalWeight: '431.77',
    },
    stringWeights: {
      ...DEFAULT_STRING,
      peep: '8',
      dLoop: '4',
      releaseType: 'Post Gate Release',
    },
    sfaxResults: {
      fps: 269.91,
      ke: 69.78,
      foc: 16.6,
      totalArrowWeight: 431.77,
      grlb: 7.32,
      staticSpine: 0.35,
      dynamicSpine: 0.341,
    },
  },
  {
    id: 'pse-axe6-acc371',
    label: 'PSE X-Force AXE 6 + Easton ACC 3-71',
    source: 'SoftwareForArchers Xpert V2.5.15',
    completeness: 'full',
    bow: {
      iboVelocity: '337',
      drawLength: '29',
      drawWeight: '71.5',
      braceHeight: '6',
      axleToAxle: '32.5',
      percentLetoff: '75',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      staticSpine: '0.300',
      shaftLength: '27.75',
      shaftGpi: '9.92',
      pointWeight: '125',
      insertWeight: '14',
      fletchQuantity: '3',
      weightEach: '6.5',
      wrapWeight: '0',
      nockWeight: '7',
      bushingPin: '8',
      shaftMaterial: 'carbon',
      fletchLength: '2',
      fletchHeight: '0.5',
      shaftUseCategory: 'base',
      insertType: 'default',
      measuredArrowTotalWeight: '448.78',
    },
    stringWeights: {
      ...DEFAULT_STRING,
      peep: '10',
      dLoop: '6',
      nockPoint: '0',
      releaseType: 'Caliper Release',
    },
    sfaxResults: {
      fps: 295.31,
      ke: 86.82,
      foc: 11.98,
      totalArrowWeight: 448.78,
      grlb: 6.28,
      staticSpine: 0.3,
      dynamicSpine: 0.307,
    },
  },
  {
    id: 'smoke-lgcam-acc360',
    label: 'OK Smoke LG-Cam + Easton ACC 360',
    source: 'SoftwareForArchers Xpert',
    completeness: 'partial',
    bow: {
      iboVelocity: '335',
      drawLength: '30',
      drawWeight: '60.5',
      braceHeight: '7.25',
      axleToAxle: '34.5',
      percentLetoff: '70',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      staticSpine: '0.390',
      shaftLength: '28',
      shaftGpi: '0',
      pointWeight: '125',
      insertWeight: '11',
      fletchQuantity: '3',
      weightEach: '6',
      wrapWeight: '0',
      nockWeight: '7',
      bushingPin: '6',
      shaftMaterial: 'carbon',
      ...DEFAULT_ARROW_ADVANCED,
      measuredArrowTotalWeight: '414.24',
    },
    stringWeights: {
      ...DEFAULT_STRING,
      peep: '0',
    },
    sfaxResults: {
      fps: 279.05,
      ke: 71.55,
      foc: 12.96,
      totalArrowWeight: 414.24,
      grlb: 6.85,
      staticSpine: 0.39,
      dynamicSpine: 0.341,
    },
  },
  {
    id: 'smoke-lgcam-ce350',
    label: 'OK Smoke LG-Cam + Carbon Express 350',
    source: 'SoftwareForArchers Xpert',
    completeness: 'partial',
    bow: {
      iboVelocity: '325',
      drawLength: '30',
      drawWeight: '60',
      braceHeight: '7.25',
      axleToAxle: '34.5',
      percentLetoff: '70',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      staticSpine: '0.345',
      shaftLength: '27.6875',
      shaftGpi: '0',
      pointWeight: '125',
      insertWeight: '11',
      fletchQuantity: '0',
      weightEach: '6',
      wrapWeight: '0',
      nockWeight: '5',
      bushingPin: '10.2',
      shaftMaterial: 'carbon',
      ...DEFAULT_ARROW_ADVANCED,
      measuredArrowTotalWeight: '378.24',
    },
    stringWeights: {
      ...DEFAULT_STRING,
      peep: '8',
    },
    sfaxResults: {
      fps: 284.27,
      ke: 67.8,
      foc: 15.82,
      totalArrowWeight: 378.24,
      grlb: 6.3,
      staticSpine: 0.345,
      dynamicSpine: 0.351,
    },
  },
  {
    id: 'smoke-lgcam-ripxv350',
    label: 'OK Smoke LG-Cam + Victory RIP XV 350',
    source: 'SoftwareForArchers Xpert',
    completeness: 'partial',
    bow: {
      iboVelocity: '335',
      drawLength: '30',
      drawWeight: '57',
      braceHeight: '7.25',
      axleToAxle: '34.5',
      percentLetoff: '60',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      staticSpine: '0.350',
      shaftLength: '27.75',
      shaftGpi: '0',
      pointWeight: '125',
      insertWeight: '21',
      fletchQuantity: '3',
      weightEach: '6',
      wrapWeight: '0',
      nockWeight: '7',
      bushingPin: '4',
      shaftMaterial: 'carbon',
      ...DEFAULT_ARROW_ADVANCED,
      measuredArrowTotalWeight: '352.60',
    },
    stringWeights: {
      ...DEFAULT_STRING,
      peep: '8',
    },
    sfaxResults: {
      fps: 290.84,
      ke: 66.16,
      foc: 16.68,
      totalArrowWeight: 352.6,
      grlb: 6.19,
      staticSpine: 0.35,
      dynamicSpine: 0.35,
    },
  },
  {
    id: 'podium-x40-twistedx',
    label: 'Podium X 40 70lbs + Twisted X 400',
    source: 'SoftwareForArchers Xpert',
    completeness: 'partial',
    bow: {
      iboVelocity: '335',
      drawLength: '29.875',
      drawWeight: '57',
      braceHeight: '7.25',
      axleToAxle: '34.5',
      percentLetoff: '70',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      staticSpine: '0.400',
      shaftLength: '28',
      shaftGpi: '0',
      pointWeight: '110',
      insertWeight: '0',
      fletchQuantity: '3',
      weightEach: '5.9',
      wrapWeight: '0',
      nockWeight: '7',
      bushingPin: '0',
      shaftMaterial: 'carbon',
      ...DEFAULT_ARROW_ADVANCED,
      measuredArrowTotalWeight: '333.50',
    },
    stringWeights: {
      ...DEFAULT_STRING,
      peep: '10',
      dLoop: '6',
    },
    sfaxResults: {
      fps: 292.47,
      ke: 63.28,
      foc: 13.09,
      totalArrowWeight: 333.5,
      grlb: 5.85,
      staticSpine: 0.4,
      dynamicSpine: 0.375,
    },
  },
]
