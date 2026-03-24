import { describe, expect, it } from 'vitest'
import { calculateSpineMatch, type ArrowSpecs, type BowSpecs, type StringWeights } from './archeryCalculator'
import { buildTuningActions } from './tuningAssistant'
import { ARCHERY_TYPE } from '../constants'

const bow: BowSpecs = {
  iboVelocity: '335',
  drawLength: '29',
  drawWeight: '70',
  measuredChronoSpeed: '',
  braceHeight: '6.5',
  axleToAxle: '34',
  percentLetoff: '85',
  archeryType: ARCHERY_TYPE.COMPOUND,
}

const stringWeights: StringWeights = {
  peep: '12',
  dLoop: '7',
  nockPoint: '4',
  silencers: '10',
  silencerDfc: '0',
  releaseType: 'Post Gate Release',
  stringMaterial: 'fastflight',
}

const t = (key: string) => key

describe('buildTuningActions', () => {
  it('propone endurecer la flecha cuando el resultado es weak', () => {
    const weakArrow: ArrowSpecs = {
      shaftLength: '31',
      pointWeight: '150',
      insertWeight: '25',
      shaftGpi: '8.6',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.400',
      shaftMaterial: 'carbon',
    }

    const result = calculateSpineMatch(bow, weakArrow, stringWeights)
    const actions = buildTuningActions(result, bow, weakArrow, 'imperial', t)

    expect(result.status).toBe('weak')
    expect(actions.map((action) => action.id)).toContain('stiffer-static-spine')
    expect(actions.map((action) => action.id)).toContain('reduce-front-weight')
  })

  it('propone ablandar la flecha cuando el resultado es stiff', () => {
    const stiffArrow: ArrowSpecs = {
      shaftLength: '28',
      pointWeight: '100',
      insertWeight: '0',
      shaftGpi: '8.6',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '8',
      bushingPin: '5',
      staticSpine: '0.250',
      shaftMaterial: 'carbon',
    }

    const result = calculateSpineMatch(bow, stiffArrow, stringWeights)
    const actions = buildTuningActions(result, bow, stiffArrow, 'imperial', t)

    expect(result.status).toBe('stiff')
    expect(actions.map((action) => action.id)).toContain('more-flexible-static-spine')
    expect(actions.map((action) => action.id)).toContain('increase-front-weight')
  })

  it('no genera acciones cuando el setup ya está en good', () => {
    const goodArrow: ArrowSpecs = {
      shaftLength: '28',
      pointWeight: '125',
      insertWeight: '25',
      shaftGpi: '8.6',
      fletchQuantity: '3',
      weightEach: '8',
      wrapWeight: '10',
      nockWeight: '10',
      bushingPin: '10',
      staticSpine: '0.340',
      shaftMaterial: 'carbon',
    }

    const result = calculateSpineMatch(bow, goodArrow, stringWeights)
    const actions = buildTuningActions(result, bow, goodArrow, 'imperial', t)

    expect(result.status).toBe('good')
    expect(actions).toHaveLength(0)
  })
})
