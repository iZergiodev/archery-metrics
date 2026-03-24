import { describe, expect, it } from 'vitest'
import { ARCHERY_TYPE } from '../constants'
import { calculateSpineMatch, type ArrowSpecs, type BowSpecs, type StringWeights } from './archeryCalculator'
import { analyzeSetupDifference, type SetupSnapshot } from './setupComparison'

const baseBow: BowSpecs = {
  iboVelocity: '335',
  drawLength: '29',
  drawWeight: '70',
  measuredChronoSpeed: '',
  braceHeight: '6.5',
  axleToAxle: '34',
  percentLetoff: '85',
  archeryType: ARCHERY_TYPE.COMPOUND,
}

const baseString: StringWeights = {
  peep: '12',
  dLoop: '7',
  nockPoint: '4',
  silencers: '10',
  silencerDfc: '0',
  releaseType: 'Post Gate Release',
  stringMaterial: 'fastflight',
}

function makeSnapshot(bowSpecs: BowSpecs, arrowSpecs: ArrowSpecs, stringWeights: StringWeights = baseString): SetupSnapshot {
  return {
    bowSpecs,
    arrowSpecs,
    stringWeights,
    result: calculateSpineMatch(bowSpecs, arrowSpecs, stringWeights),
  }
}

describe('analyzeSetupDifference', () => {
  it('detecta cuando la mejora viene sobre todo de la flecha', () => {
    const current = makeSnapshot(baseBow, {
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
    })

    const saved = makeSnapshot(baseBow, {
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
    })

    const analysis = analyzeSetupDifference(current, saved)

    expect(analysis.proximity).toBe('closer')
    expect(analysis.driver).toBe('arrow')
    expect(analysis.factors.map((factor) => factor.id)).toEqual(
      expect.arrayContaining(['staticSpine', 'shaftLength', 'frontWeight']),
    )
  })

  it('detecta cuando la diferencia viene sobre todo del arco', () => {
    const arrow: ArrowSpecs = {
      shaftLength: '29',
      pointWeight: '125',
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

    const current = makeSnapshot(
      {
        ...baseBow,
        drawWeight: '62',
        drawLength: '28',
        braceHeight: '7',
      },
      arrow,
    )

    const saved = makeSnapshot(
      {
        ...baseBow,
        drawWeight: '72',
        drawLength: '30',
        braceHeight: '6',
      },
      arrow,
    )

    const analysis = analyzeSetupDifference(current, saved)

    expect(analysis.driver).toBe('bow')
    expect(analysis.factors.map((factor) => factor.id)).toEqual(
      expect.arrayContaining(['drawWeight', 'drawLength', 'braceHeight']),
    )
  })

  it('marca same cuando la cercania al ideal apenas cambia', () => {
    const current = makeSnapshot(baseBow, {
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
    })

    const saved = makeSnapshot(
      {
        ...baseBow,
        drawLength: '29.1',
      },
      {
        shaftLength: '28.1',
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
      },
    )

    const analysis = analyzeSetupDifference(current, saved)

    expect(analysis.proximity).toBe('same')
  })
})
