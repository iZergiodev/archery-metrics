import { ARCHERY_TYPE } from '../../constants'
import type { ArrowSpecs, BowSpecs, StringWeights } from '../../utils/archeryCalculator'

export const OFFICIAL_COMPOUND_DATABASE_VERSION = 'official-compound-v3'

export type OfficialSourceId =
  | 'easton_hunting_selector_2023'
  | 'gold_tip_selector_2025'
  | 'gold_tip_force_foc_specs'
  | 'gold_tip_traditional_classic_specs'
  | 'victory_arrow_guide'
  | 'black_eagle_spine_chart'
  | 'black_eagle_spine_specs'
  | 'three_rivers_dynamic_spine'
  | 'hoyt_compound_safety'
  | 'mathews_lift_x_33'
  | 'hoyt_alpha_ax_2_32'
  | 'bowtech_core_ss'

export type OfficialSource = {
  id: OfficialSourceId
  provider: string
  title: string
  kind: 'chart' | 'selector' | 'product_specs' | 'calculator' | 'safety' | 'model_specs'
  url: string
  summary: string
}

export type OfficialRule = {
  id: string
  sourceId: OfficialSourceId
  title: string
  summary: string
}

export type OfficialBowSpecReference = {
  id: string
  manufacturer: string
  model: string
  sourceId: OfficialSourceId
  iboVelocity: number
  braceHeight: number
  axleToAxle: number
  drawLengthMin: number
  drawLengthMax: number
  drawWeightOptions: number[]
  letOffOptions?: number[]
}

export type OfficialShaftSpecReference = {
  id: string
  manufacturer: string
  model: string
  sourceId: OfficialSourceId
  category: 'compound_hunting' | 'traditional'
  rows: Array<{
    spine: number
    gpi: number
    shaftLength: number
  }>
}

export type OfficialCompoundCaseDefinition = {
  id: string
  sourceIds: OfficialSourceId[]
  source: string
  confidence: 'high' | 'medium'
  usage?: 'calibration' | 'benchmark' | 'both'
  expectedMatchIndex: number
  acceptableMatchRange?: {
    min: number
    max: number
  }
  calibrationWeight: number
  bow: BowSpecs
  arrow: ArrowSpecs
  stringWeights?: StringWeights
}

export const OFFICIAL_COMPOUND_SOURCES: Record<OfficialSourceId, OfficialSource> = {
  easton_hunting_selector_2023: {
    id: 'easton_hunting_selector_2023',
    provider: 'Easton',
    title: 'Hunting Arrow Size Selection',
    kind: 'chart',
    url: 'https://eastonarchery.com/wp-content/uploads/2023/08/301055-A-Arrow-Shaft-Selection-Hunting.pdf',
    summary:
      'Defines the compound hunting baseline chart and explicit setup adjustments for speed, release type, point weight, and inserts/outserts.',
  },
  gold_tip_selector_2025: {
    id: 'gold_tip_selector_2025',
    provider: 'Gold Tip',
    title: 'Spine Selector Tool',
    kind: 'selector',
    url: 'https://www.goldtip.com/spine-selector-page.html',
    summary:
      'Defines arrow length measurement from throat of nock to end of insert and treats point weight as the total combined front-end weight.',
  },
  gold_tip_force_foc_specs: {
    id: 'gold_tip_force_foc_specs',
    provider: 'Gold Tip',
    title: 'Force F.O.C. Hunting Arrows Specs',
    kind: 'product_specs',
    url: 'https://www.goldtip.com/hunting-arrows/force-foc-high-front-of-center/force-f.o.c.-hunting-arrows/PG3398798.html',
    summary:
      'Provides official spine-to-GPI rows and included component weights for a modern high-FOC hunting shaft family.',
  },
  gold_tip_traditional_classic_specs: {
    id: 'gold_tip_traditional_classic_specs',
    provider: 'Gold Tip',
    title: 'Traditional Classic Hunting Arrows Specs',
    kind: 'product_specs',
    url: 'https://www.goldtip.com/hunting-arrows/traditional-series/traditional-classic-hunting-arrows/P01368.html',
    summary:
      'Provides official traditional shaft spine/GPI rows and included insert mass for heavier small-diameter shafts.',
  },
  victory_arrow_guide: {
    id: 'victory_arrow_guide',
    provider: 'Victory',
    title: 'Arrow Guide',
    kind: 'calculator',
    url: 'https://victoryarchery.com/arrow-guide/',
    summary:
      'Uses bow IBO speed, draw weight, shaft length, point weight, and insert weight as explicit inputs for compound spine selection.',
  },
  black_eagle_spine_chart: {
    id: 'black_eagle_spine_chart',
    provider: 'Black Eagle',
    title: 'Arrow Sizing Spine Chart',
    kind: 'chart',
    url: 'https://blackeaglearrows.com/arrow-sizing-spine-chart/',
    summary:
      'States that charts are based on a 100gr point, 125gr often needs a stiffer spine, 85gr a weaker spine, and recommends at least 5 grains per pound.',
  },
  black_eagle_spine_specs: {
    id: 'black_eagle_spine_specs',
    provider: 'Black Eagle',
    title: 'Arrow Spines & Weights',
    kind: 'product_specs',
    url: 'https://blackeaglearrows.com/arrow-spines-weights/',
    summary:
      'Provides official shaft tables with spine, diameter, and GPI for multiple Black Eagle families.',
  },
  three_rivers_dynamic_spine: {
    id: 'three_rivers_dynamic_spine',
    provider: '3Rivers',
    title: 'Dynamic Spine Arrow Calculator',
    kind: 'calculator',
    url: 'https://www.3riversarchery.com/dynamic-spine-arrow-calculator-from-3rivers-archery.html',
    summary:
      'Makes total nock weight and personal form calibration explicit, useful references for future recurve/traditional modeling.',
  },
  hoyt_compound_safety: {
    id: 'hoyt_compound_safety',
    provider: 'Hoyt',
    title: 'Compound Bow Safety and Warnings',
    kind: 'safety',
    url: 'https://hoyt.com/pages/compound-bow-safety-and-warnings',
    summary:
      'States that arrows below five grains per pound are unsafe and that incorrect spine or arrow length can break arrows and damage the bow.',
  },
  mathews_lift_x_33: {
    id: 'mathews_lift_x_33',
    provider: 'Mathews',
    title: 'LIFT X 33 Specs',
    kind: 'model_specs',
    url: 'https://mathewsinc.com/products/lift-x-33',
    summary:
      'Official current compound bow specs page including IBO, brace height, axle-to-axle, draw weights, draw lengths, and let-off options.',
  },
  hoyt_alpha_ax_2_32: {
    id: 'hoyt_alpha_ax_2_32',
    provider: 'Hoyt',
    title: 'Alpha AX-2 32 Specs',
    kind: 'model_specs',
    url: 'https://hoyt.com/index.php/hunting-bows',
    summary:
      'Official hunting bows page listing the Alpha AX-2 32 with IBO, brace height, axle-to-axle, draw length range, and draw weight range.',
  },
  bowtech_core_ss: {
    id: 'bowtech_core_ss',
    provider: 'Bowtech',
    title: 'Core SS Specs',
    kind: 'model_specs',
    url: 'https://bowtecharchery.com/bows/core-ss/',
    summary:
      'Official model page including speed, draw length range, draw weight options, axle-to-axle, and brace height.',
  },
}

export const OFFICIAL_COMPOUND_RULES_V1: OfficialRule[] = [
  {
    id: 'easton_chart_uses_release_aid_baseline',
    sourceId: 'easton_hunting_selector_2023',
    title: 'Easton chart baseline assumes release aid',
    summary: 'Mechanical release is the baseline; finger release adds +5 lbs of bow weight to the chart selection.',
  },
  {
    id: 'easton_chart_adjusts_for_speed_and_front_weight',
    sourceId: 'easton_hunting_selector_2023',
    title: 'Easton adjusts for speed, points, and inserts',
    summary:
      'Up to 300 FPS subtracts weight, 341-350 adds weight, 351+ adds more, and point plus insert/outsert mass can push the selection stiffer.',
  },
  {
    id: 'gold_tip_uses_total_front_weight',
    sourceId: 'gold_tip_selector_2025',
    title: 'Gold Tip point weight means total front weight',
    summary: 'Point weight includes point, insert, Ballistic Collar, and FACT weight.',
  },
  {
    id: 'gold_tip_length_is_throat_to_insert_end',
    sourceId: 'gold_tip_selector_2025',
    title: 'Gold Tip arrow length semantics',
    summary: 'Arrow length is measured from the throat of the nock to the end of the insert.',
  },
  {
    id: 'victory_inputs_point_and_insert_separately',
    sourceId: 'victory_arrow_guide',
    title: 'Victory models point and insert separately',
    summary: 'Victory asks for IBO, draw weight, shaft length, point weight, and insert weight in the same selector flow.',
  },
  {
    id: 'black_eagle_100gr_baseline_and_point_weight_direction',
    sourceId: 'black_eagle_spine_chart',
    title: 'Black Eagle front-weight direction',
    summary: 'Charts are based on 100gr; 125gr may need a stiffer spine and 85gr may need a weaker spine.',
  },
  {
    id: 'black_eagle_and_hoyt_minimum_5gpp',
    sourceId: 'hoyt_compound_safety',
    title: 'Minimum 5 GPP safety floor',
    summary: 'Hoyt and Black Eagle both state that setups should not go below five grains per pound of peak draw weight.',
  },
  {
    id: 'three_rivers_tracks_total_nock_weight_and_form',
    sourceId: 'three_rivers_dynamic_spine',
    title: '3Rivers exposes total nock weight and personal form',
    summary: 'Useful for future recurvo/traditional expansion and for understanding rear-mass and shooter-form sensitivity.',
  },
]

export const OFFICIAL_COMPOUND_BOW_SPECS_V1: OfficialBowSpecReference[] = [
  {
    id: 'mathews_lift_x_33',
    manufacturer: 'Mathews',
    model: 'LIFT X 33',
    sourceId: 'mathews_lift_x_33',
    iboVelocity: 343,
    braceHeight: 6.5,
    axleToAxle: 33,
    drawLengthMin: 26,
    drawLengthMax: 31.5,
    drawWeightOptions: [55, 60, 65, 70, 75, 80],
    letOffOptions: [80, 85],
  },
  {
    id: 'hoyt_alpha_ax_2_32',
    manufacturer: 'Hoyt',
    model: 'Alpha AX-2 32',
    sourceId: 'hoyt_alpha_ax_2_32',
    iboVelocity: 336,
    braceHeight: 6.5,
    axleToAxle: 32.3125,
    drawLengthMin: 26,
    drawLengthMax: 31,
    drawWeightOptions: [40, 50, 60, 70, 80],
  },
  {
    id: 'bowtech_core_ss',
    manufacturer: 'Bowtech',
    model: 'Core SS',
    sourceId: 'bowtech_core_ss',
    iboVelocity: 337,
    braceHeight: 6.25,
    axleToAxle: 31.5,
    drawLengthMin: 26,
    drawLengthMax: 31,
    drawWeightOptions: [50, 60, 70],
  },
]

export const OFFICIAL_COMPOUND_SHAFT_SPECS_V1: OfficialShaftSpecReference[] = [
  {
    id: 'gold_tip_force_foc',
    manufacturer: 'Gold Tip',
    model: 'Force F.O.C.',
    sourceId: 'gold_tip_force_foc_specs',
    category: 'compound_hunting',
    rows: [
      { spine: 0.4, gpi: 7.4, shaftLength: 32 },
      { spine: 0.34, gpi: 8.2, shaftLength: 32 },
      { spine: 0.3, gpi: 8.8, shaftLength: 32 },
      { spine: 0.25, gpi: 9.8, shaftLength: 32 },
    ],
  },
  {
    id: 'gold_tip_traditional_classic',
    manufacturer: 'Gold Tip',
    model: 'Traditional Classic',
    sourceId: 'gold_tip_traditional_classic_specs',
    category: 'traditional',
    rows: [
      { spine: 0.6, gpi: 9.1, shaftLength: 32 },
      { spine: 0.5, gpi: 10.2, shaftLength: 32 },
      { spine: 0.4, gpi: 11.3, shaftLength: 32 },
      { spine: 0.34, gpi: 12, shaftLength: 32 },
    ],
  },
  {
    id: 'black_eagle_carnivore',
    manufacturer: 'Black Eagle',
    model: 'Carnivore',
    sourceId: 'black_eagle_spine_specs',
    category: 'compound_hunting',
    rows: [
      { spine: 0.4, gpi: 6.8, shaftLength: 32 },
      { spine: 0.35, gpi: 7.5, shaftLength: 32 },
      { spine: 0.3, gpi: 8.5, shaftLength: 32 },
      { spine: 0.25, gpi: 9.7, shaftLength: 32 },
    ],
  },
]

export const OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS: StringWeights = {
  peep: '12',
  dLoop: '7',
  nockPoint: '4',
  silencers: '10',
  silencerDfc: '0',
  releaseType: 'Post Gate Release',
  stringMaterial: 'fastflight',
}

export const OFFICIAL_COMPOUND_CASES_V1: OfficialCompoundCaseDefinition[] = [
  {
    id: 'easton_standard_70lb_340',
    sourceIds: ['easton_hunting_selector_2023'],
    source:
      'Easton 2023 verificado: 70 lb ajustadas (IBO 330 sin ajuste, 100gr, insert 25) -> fila 67-72, flecha 31in -> celda 300-250; rango = celda ±4.5% de cuantización',
    confidence: 'high',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 1.082,
      max: 1.421,
    },
    calibrationWeight: 0.8,
    bow: {
      iboVelocity: '330',
      drawLength: '30',
      drawWeight: '70',
      braceHeight: '7',
      axleToAxle: '34',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '31',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '8.5',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.340',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'easton_standard_75lb_300',
    sourceIds: ['easton_hunting_selector_2023'],
    source:
      'Easton 2023 verificado: 75 lb +5 (IBO 350) -> fila 79-84, flecha 31in -> celda 250-200; rango = celda ±4.5% de cuantización',
    confidence: 'high',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 1.146,
      max: 1.568,
    },
    calibrationWeight: 0.8,
    bow: {
      iboVelocity: '350',
      drawLength: '30',
      drawWeight: '75',
      braceHeight: '6.5',
      axleToAxle: '34',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '31',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '9.8',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.300',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'easton_adjusted_70lb_125gr_300',
    sourceIds: ['easton_hunting_selector_2023'],
    source:
      'Easton 2023 verificado: 70 lb +5 (IBO 350) +3 (punta 125gr) = 78 -> fila 73-78, flecha 31in -> celda 300-250; rango = celda ±4.5%',
    confidence: 'high',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.955,
      max: 1.254,
    },
    calibrationWeight: 0.7,
    bow: {
      iboVelocity: '350',
      drawLength: '30',
      drawWeight: '70',
      braceHeight: '7',
      axleToAxle: '34',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '31',
      pointWeight: '125',
      insertWeight: '25',
      shaftGpi: '9.8',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.300',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'mid_weight_50lb_400',
    sourceIds: ['easton_hunting_selector_2023', 'gold_tip_selector_2025'],
    source:
      'Consenso 50 lb / 30in: celda Easton 2023 verificada 400-350 ∪ recomendación Gold Tip 500; rango = envolvente ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.764,
      max: 1.194,
    },
    calibrationWeight: 0.8,
    bow: {
      iboVelocity: '320',
      drawLength: '29',
      drawWeight: '50',
      braceHeight: '7',
      axleToAxle: '33',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '7.6',
      fletchQuantity: '3',
      weightEach: '7',
      wrapWeight: '8',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.400',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'low_weight_45lb_500',
    sourceIds: ['easton_hunting_selector_2023', 'gold_tip_selector_2025'],
    source:
      'Consenso 45 lb / 30in: celda Easton 2023 verificada 400-350 ∪ recomendación Gold Tip 500; rango = envolvente ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.868,
      max: 1.493,
    },
    calibrationWeight: 0.8,
    bow: {
      iboVelocity: '310',
      drawLength: '28',
      drawWeight: '45',
      braceHeight: '7',
      axleToAxle: '32',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '6.6',
      fletchQuantity: '3',
      weightEach: '7',
      wrapWeight: '8',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.500',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'short_draw_70lb_27in_340',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 verificado: 70 lb (IBO 335 sin ajuste) -> fila 67-72, flecha 28in -> celda 350-300; rango = celda ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.928,
      max: 1.184,
    },
    calibrationWeight: 0.7,
    bow: {
      iboVelocity: '335',
      drawLength: '27',
      drawWeight: '70',
      braceHeight: '7',
      axleToAxle: '34',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '28',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '8.4',
      fletchQuantity: '3',
      weightEach: '7',
      wrapWeight: '8',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.340',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'heavy_front_70lb_175gr_300',
    sourceIds: ['easton_hunting_selector_2023', 'gold_tip_selector_2025'],
    source: 'Easton 2023 verificado: 70 lb +6 (punta 150gr) = 76 -> fila 73-78, flecha 30in -> celda 300-250; rango = celda ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.955,
      max: 1.254,
    },
    calibrationWeight: 0.6,
    bow: {
      iboVelocity: '335',
      drawLength: '30',
      drawWeight: '70',
      braceHeight: '7',
      axleToAxle: '34',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '150',
      insertWeight: '25',
      shaftGpi: '9.8',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.300',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'easton_standard_60lb_400_29in',
    sourceIds: ['easton_hunting_selector_2023', 'gold_tip_selector_2025'],
    source:
      'Consenso 60 lb / 30in: celda Easton 2023 verificada 350-300 ∪ recomendación Gold Tip 400; rango = envolvente ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.849,
      max: 1.393,
    },
    calibrationWeight: 0.8,
    bow: {
      iboVelocity: '330',
      drawLength: '29',
      drawWeight: '60',
      braceHeight: '7',
      axleToAxle: '33',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '7.4',
      fletchQuantity: '3',
      weightEach: '7',
      wrapWeight: '8',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.400',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'easton_standard_65lb_340_29in',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 verificado: 65 lb (IBO 330 sin ajuste) -> fila 62-66, flecha 30in -> celda 350-300; rango = celda ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.928,
      max: 1.184,
    },
    calibrationWeight: 0.7,
    bow: {
      iboVelocity: '330',
      drawLength: '29',
      drawWeight: '65',
      braceHeight: '7',
      axleToAxle: '34',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '8.4',
      fletchQuantity: '3',
      weightEach: '7',
      wrapWeight: '8',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.340',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'easton_fast_80lb_250_30in',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 verificado: 80 lb +5 (IBO 350) = 85 -> fila 85-90, flecha 31in -> celda 250-200; rango = celda ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.955,
      max: 1.306,
    },
    calibrationWeight: 0.6,
    bow: {
      iboVelocity: '350',
      drawLength: '30',
      drawWeight: '80',
      braceHeight: '6.5',
      axleToAxle: '34',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '31',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '9.8',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.250',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'easton_slow_55lb_400_29in',
    sourceIds: ['easton_hunting_selector_2023'],
    source: 'Easton 2023 verificado: 55 lb -5 (IBO 300) = 50 -> fila 47-51, flecha 30in -> celda 400-350; rango = celda ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.955,
      max: 1.194,
    },
    calibrationWeight: 0.6,
    bow: {
      iboVelocity: '300',
      drawLength: '29',
      drawWeight: '55',
      braceHeight: '7',
      axleToAxle: '33',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '7.4',
      fletchQuantity: '3',
      weightEach: '7',
      wrapWeight: '8',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.400',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'gold_tip_force_foc_70lb_300',
    sourceIds: ['gold_tip_selector_2025', 'gold_tip_force_foc_specs', 'hoyt_alpha_ax_2_32'],
    source: 'Gold Tip Force F.O.C. 300 on a modern 70# / 29.5in hunting bow using total front weight semantics',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.85,
      max: 1.1,
    },
    calibrationWeight: 0.65,
    bow: {
      iboVelocity: '336',
      drawLength: '29.5',
      drawWeight: '70',
      braceHeight: '6.5',
      axleToAxle: '32.3125',
      percentLetoff: '85',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '8.8',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.300',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'black_eagle_carnivore_60lb_350',
    sourceIds: ['black_eagle_spine_chart', 'black_eagle_spine_specs', 'bowtech_core_ss'],
    source: 'Black Eagle Carnivore 350 on a 60# modern hunting bow with 100gr baseline point weight',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.85,
      max: 1.1,
    },
    calibrationWeight: 0.65,
    bow: {
      iboVelocity: '337',
      drawLength: '29',
      drawWeight: '60',
      braceHeight: '6.25',
      axleToAxle: '31.5',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '7.5',
      fletchQuantity: '3',
      weightEach: '7',
      wrapWeight: '8',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.350',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'bowtech_core_ss_force_foc_340',
    sourceIds: ['bowtech_core_ss', 'gold_tip_force_foc_specs', 'gold_tip_selector_2025', 'easton_hunting_selector_2023'],
    source:
      'Bowtech Core SS + GT Force F.O.C. 340: rango = unión GT 340 (±medio grupo) ∪ celda Easton 2023 300-250 (70 lb / 30in) ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.878,
      max: 1.421,
    },
    calibrationWeight: 0.7,
    bow: {
      iboVelocity: '337',
      drawLength: '29',
      drawWeight: '70',
      braceHeight: '6.25',
      axleToAxle: '31.5',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '8.2',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.340',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'hoyt_alpha_ax2_carnivore_300',
    sourceIds: ['hoyt_alpha_ax_2_32', 'black_eagle_spine_specs', 'black_eagle_spine_chart'],
    source: 'Hoyt Alpha AX-2 32 + Black Eagle Carnivore 300 reference setup',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.85,
      max: 1.1,
    },
    calibrationWeight: 0.65,
    bow: {
      iboVelocity: '336',
      drawLength: '30',
      drawWeight: '70',
      braceHeight: '6.5',
      axleToAxle: '32.3125',
      percentLetoff: '85',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '31',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '8.5',
      fletchQuantity: '3',
      weightEach: '7',
      wrapWeight: '8',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.300',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'mathews_lift_x_force_foc_300',
    sourceIds: ['mathews_lift_x_33', 'gold_tip_force_foc_specs', 'gold_tip_selector_2025', 'easton_hunting_selector_2023'],
    source:
      'Mathews LIFT X 33 + GT Force F.O.C. 300: rango = unión GT 300 (±medio grupo) ∪ celda Easton 2023 250-200 (75+5 lb / 31in) ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.895,
      max: 1.568,
    },
    calibrationWeight: 0.75,
    bow: {
      iboVelocity: '343',
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
      shaftGpi: '8.8',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.300',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'mathews_lift_x_force_foc_340_70',
    sourceIds: ['mathews_lift_x_33', 'gold_tip_force_foc_specs', 'gold_tip_selector_2025', 'easton_hunting_selector_2023'],
    source:
      'Mathews LIFT X 33 + GT Force F.O.C. 340: rango = unión GT 340 (±medio grupo) ∪ celda Easton 2023 300-250 (70+5 lb / 30in) ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.878,
      max: 1.421,
    },
    calibrationWeight: 0.7,
    bow: {
      iboVelocity: '343',
      drawLength: '29',
      drawWeight: '70',
      braceHeight: '6.5',
      axleToAxle: '33',
      percentLetoff: '85',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '8.2',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.340',
      shaftMaterial: 'carbon',
    },
  },
  {
    id: 'easton_finger_release_55lb_400_29in',
    sourceIds: ['easton_hunting_selector_2023', 'gold_tip_selector_2025'],
    source:
      'Easton 2023 regla dedos +5: 55+5 = 60 -> fila 57-61, flecha 30in -> celda 350-300; rango = envolvente con GT 400 ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.849,
      max: 1.393,
    },
    calibrationWeight: 0.6,
    bow: {
      iboVelocity: '320',
      drawLength: '29',
      drawWeight: '55',
      braceHeight: '7',
      axleToAxle: '33',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '7.4',
      fletchQuantity: '3',
      weightEach: '7',
      wrapWeight: '8',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.400',
      shaftMaterial: 'carbon',
    },
    stringWeights: {
      ...OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS,
      releaseType: 'manual fingers',
    },
  },
  {
    id: 'easton_finger_release_60lb_340_29in',
    sourceIds: ['easton_hunting_selector_2023', 'gold_tip_selector_2025'],
    source:
      'Easton 2023 regla dedos +5: 60+5 = 65 -> fila 62-66, flecha 30in -> celda 350-300; rango = envolvente con GT 400 ±4.5%',
    confidence: 'medium',
    usage: 'both',
    expectedMatchIndex: 1,
    acceptableMatchRange: {
      min: 0.722,
      max: 1.184,
    },
    calibrationWeight: 0.6,
    bow: {
      iboVelocity: '320',
      drawLength: '29',
      drawWeight: '60',
      braceHeight: '7',
      axleToAxle: '34',
      percentLetoff: '80',
      archeryType: ARCHERY_TYPE.COMPOUND,
    },
    arrow: {
      shaftLength: '30',
      pointWeight: '100',
      insertWeight: '25',
      shaftGpi: '8.4',
      fletchQuantity: '3',
      weightEach: '7',
      wrapWeight: '8',
      nockWeight: '7',
      bushingPin: '5',
      staticSpine: '0.340',
      shaftMaterial: 'carbon',
    },
    stringWeights: {
      ...OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS,
      releaseType: 'manual fingers',
    },
  },
]
