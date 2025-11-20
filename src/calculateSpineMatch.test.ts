import { describe, expect, it } from 'vitest'
import { calculateSpineMatch } from './utils/archeryCalculator'

const baseBow = {
    iboVelocity: '335',
    drawLength: '29',
    drawWeight: '70',
    braceHeight: '6.5',
    axleToAxle: '34',
    percentLetoff: '85',
}

const baseArrow = {
    pointWeight: '125',
    insertWeight: '25',
    shaftLength: '28',
    shaftGpi: '8.6',
    fletchQuantity: '3',
    weightEach: '8',
    wrapWeight: '10',
    nockWeight: '10',
    bushingPin: '10',
    staticSpine: '0.340',
}

const baseString = {
    peep: '12',
    dLoop: '7',
    nockPoint: '4',
    silencers: '10',
    silencerDfc: '0',
    releaseType: 'Post Gate Release',
    stringMaterial: 'fastflight' as const,
}

type ScenarioOverrides = {
    bow?: Partial<typeof baseBow>
    arrow?: Partial<typeof baseArrow>
    stringWeights?: Partial<typeof baseString>
}

function runScenario(overrides: ScenarioOverrides = {}) {
    return calculateSpineMatch(
        { ...baseBow, ...overrides.bow },
        { ...baseArrow, ...overrides.arrow },
        { ...baseString, ...overrides.stringWeights },
    )
}

describe('calculateSpineMatch', () => {
    it('identifica una configuración equilibrada como buen emparejamiento', () => {
        const result = runScenario()

        console.log('Escenario equilibrado', result)

        expect(result.status).toBe('good')
        expect(result.matchIndex).not.toBeNull()
        expect(result.matchIndex!).toBeGreaterThan(0.9)
        expect(result.matchIndex!).toBeLessThan(1.1)
        expect(result.calculatedFPS).not.toBeNull()
        expect(result.calculatedFPS!).toBeGreaterThan(285)
        expect(result.calculatedFPS!).toBeLessThan(320)
    })

    it('detecta flecha demasiado rígida cuando aligeramos la punta y el spine', () => {
        const result = runScenario({
            arrow: {
                pointWeight: '85',
                insertWeight: '15',
                staticSpine: '0.500',
            },
        })

        console.log('Escenario rígido', result)

        expect(result.status).toBe('stiff')
        expect(result.matchIndex).not.toBeNull()
        expect(result.matchIndex!).toBeLessThan(0.85)
    })

    it('detecta flecha demasiado flexible con mucho peso frontal', () => {
        const result = runScenario({
            arrow: {
                pointWeight: '200',
                insertWeight: '75',
                staticSpine: '0.340',
            },
        })

        console.log('Escenario flexible', result)

        expect(result.status).toBe('weak')
        expect(result.matchIndex).not.toBeNull()
        expect(result.matchIndex!).toBeGreaterThan(1.15)
    })

    it('retorna valores nulos cuando faltan datos críticos', () => {
        const result = runScenario({
            bow: { drawWeight: '' },
        })

        console.log('Escenario sin datos', result)

        expect(result.spineRequired).toBeNull()
        expect(result.spineDynamic).toBeNull()
        expect(result.matchIndex).toBeNull()
        expect(result.status).toBeNull()
    })
})
