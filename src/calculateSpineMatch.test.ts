import { describe, expect, it } from 'vitest'
import { calculateSpineMatch } from './utils/archeryCalculator'
import { ARCHERY_TYPE } from './constants'

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
    temperature?: number
}

function runScenario(overrides: ScenarioOverrides = {}) {
    return calculateSpineMatch(
        { ...baseBow, ...overrides.bow },
        { ...baseArrow, ...overrides.arrow },
        { ...baseString, ...overrides.stringWeights },
        overrides.temperature,
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
        // FPS calculado según modelo de energía almacenada
        // Puede requerir calibración adicional con datos reales
        expect(result.calculatedFPS!).toBeGreaterThan(250)
        expect(result.calculatedFPS!).toBeLessThan(300)
        // Nuevos campos
        expect(result.archeryType).toBe(ARCHERY_TYPE.COMPOUND)
        expect(result.spineRequiredCI).not.toBeNull()
        expect(result.spineDynamicCI).not.toBeNull()
        expect(result.matchIndexCI).not.toBeNull()
    })

    it('detecta flecha demasiado rígida cuando usamos spine bajo y punta ligera', () => {
        // Spine 0.250 es muy rígido para 70#, combinado con punta ligera
        // la flecha actúa aún más rígida -> status: stiff
        const result = runScenario({
            arrow: {
                pointWeight: '85',
                insertWeight: '15',
                staticSpine: '0.250',
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
        // Nuevos campos deben estar presentes pero con valores apropiados
        expect(result.archeryType).toBeDefined()
    })

    it('aplica corrección de temperatura correctamente', () => {
        // A temperatura alta, el spine efectivo aumenta (más flexible)
        const hotResult = runScenario({ temperature: 90 })
        // A temperatura baja, el spine efectivo disminuye (más rígido)
        const coldResult = runScenario({ temperature: 50 })

        console.log('Temperatura alta', hotResult)
        console.log('Temperatura baja', coldResult)

        // El spine dinámico a alta temperatura debe ser mayor
        expect(hotResult.spineDynamic).toBeGreaterThan(coldResult.spineDynamic!)
    })

    it('soporta arcos recurvo/tradicional', () => {
        const recurveResult = runScenario({
            bow: {
                archeryType: ARCHERY_TYPE.RECURVO,
                percentLetoff: '0', // Recurvo no tiene let-off
            },
        })

        console.log('Recurvo', recurveResult)

        expect(recurveResult.archeryType).toBe(ARCHERY_TYPE.RECURVO)
        expect(recurveResult.spineRequired).not.toBeNull()
    })

    it('calcula intervalos de confianza correctamente', () => {
        const result = runScenario()

        expect(result.matchIndexCI).not.toBeNull()
        expect(result.matchIndexCI!.lower).toBeLessThan(result.matchIndex!)
        expect(result.matchIndexCI!.upper).toBeGreaterThan(result.matchIndex!)
        expect(result.matchIndexCI!.confidence).toBe('medium') // Sin temperatura
    })

    it('tiene alta confianza cuando se proporciona temperatura', () => {
        const result = runScenario({ temperature: 70 })

        expect(result.matchIndexCI!.confidence).toBe('high')
    })
})
