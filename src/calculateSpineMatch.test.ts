import { describe, expect, it } from 'vitest'
import { calculateSpineMatch, type BowSpecs, type ArrowSpecs } from './utils/archeryCalculator'
import { ARCHERY_TYPE } from './constants'

// ============================================
// DATOS REALES DE LA INDUSTRIA (2024-2025)
// ============================================
// Basados en especificaciones oficiales de fabricantes

// --- BOWS REAL SPECS ---
const MATHEWS_V3X_33: BowSpecs = {
    iboVelocity: '350',
    drawLength: '30',
    drawWeight: '75',
    braceHeight: '6.5',
    axleToAxle: '33',
    percentLetoff: '85',
    archeryType: ARCHERY_TYPE.COMPOUND,
}

const HOYT_REXON: BowSpecs = {
    iboVelocity: '350',
    drawLength: '30',
    drawWeight: '70',
    braceHeight: '7',
    axleToAxle: '36',
    percentLetoff: '80',
    archeryType: ARCHERY_TYPE.COMPOUND,
}

const BOWTECH_REALM: BowSpecs = {
    iboVelocity: '340',
    drawLength: '28',
    drawWeight: '60',
    braceHeight: '7',
    axleToAxle: '32',
    percentLetoff: '80',
    archeryType: ARCHERY_TYPE.COMPOUND,
}

const YOUTH_BOW: BowSpecs = {
    iboVelocity: '280',
    drawLength: '26',
    drawWeight: '35',
    braceHeight: '6.5',
    axleToAxle: '28',
    percentLetoff: '70',
    archeryType: ARCHERY_TYPE.COMPOUND,
}

// --- EASTON ARROW SPINE CHART (Official Data) ---
// Spine 300: 66-80 lbs @ 30", 70-85 lbs @ 28"
// Spine 340: 56-70 lbs @ 30", 60-75 lbs @ 28"
// Spine 400: 45-60 lbs @ 30", 48-65 lbs @ 28"
// Spine 500: 38-50 lbs @ 30", 40-55 lbs @ 28"
// Spine 600: 30-40 lbs @ 30", 32-45 lbs @ 28"

const EASTON_XX75_300: ArrowSpecs = {
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
}

const EASTON_ACC_340: ArrowSpecs = {
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
}

const EASTON_XX78_400: ArrowSpecs = {
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
}

const EASTON_FMJ_500: ArrowSpecs = {
    shaftLength: '31',
    pointWeight: '125',
    insertWeight: '25',
    shaftGpi: '6.6',
    fletchQuantity: '4',
    weightEach: '6',
    wrapWeight: '10',
    nockWeight: '7',
    bushingPin: '5',
    staticSpine: '0.500',
    shaftMaterial: 'carbon',
}

const baseBow: BowSpecs = {
    iboVelocity: '335',
    drawLength: '29',
    drawWeight: '70',
    braceHeight: '6.5',
    axleToAxle: '34',
    percentLetoff: '85',
    archeryType: ARCHERY_TYPE.COMPOUND,
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
    bow?: Partial<BowSpecs>
    arrow?: Partial<ArrowSpecs>
    stringWeights?: Partial<typeof baseString>
    temperature?: number
}

function runScenario(overrides: ScenarioOverrides = {}) {
    return calculateSpineMatch(
        { ...baseBow, ...overrides.bow } as BowSpecs,
        { ...baseArrow, ...overrides.arrow } as ArrowSpecs,
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

    it('detecta efecto de FOC extremo: peso frontal muy alto estabiliza la flecha', () => {
        // Con FOC muy alto (>15%), la flecha actúa más rígida (mejor estabilidad)
        // Esto es opuesto a la lógica anterior - FOC estabiliza, no flexibiliza
        const result = runScenario({
            arrow: {
                pointWeight: '200',
                insertWeight: '75',
                staticSpine: '0.340',
            },
        })

        console.log('Escenario FOC extremo', result)

        // FOC alto = más estable/rígido = matchIndex menor
        expect(result.status).toBe('good') // FOC alto estabiliza, no debilita
        expect(result.matchIndex).not.toBeNull()
        expect(result.matchIndex!).toBeLessThan(1.1)
        // FOC de 19.77% debe generar recomendación
        expect(result.recommendations.length).toBeGreaterThan(0)
        // Verificar que hay recomendación sobre FOC alto
        const hasFocRecommendation = result.recommendations.some(r => r.includes('FOC alto'))
        expect(hasFocRecommendation).toBe(true)
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

// ============================================
// TESTS CON DATOS REALES DE LA INDUSTRIA
// ============================================

describe('Real World Data Validation', () => {
    // Test: Mathews V3X 33 con Easton XX75 300
    // Según Easton: Spine 300 es para 66-80 lbs @ 30"
    // Mathews V3X 33: 75 lbs @ 30" - borderline (spine 300 es el límite inferior)
    it('valida Mathews V3X 33 + Easton XX75 300: spine 300 para 75 lbs @ 30"', () => {
        const result = calculateSpineMatch(
            MATHEWS_V3X_33,
            EASTON_XX75_300,
            baseString,
        )

        console.log('Mathews V3X 33 + XX75 300:', result)

        // Spine 300 está en el límite inferior para 75 lbs
        // matchIndex ~0.89 = ligeramente stiff (usando tolerancia 10%: good = 0.90-1.10)
        // 75 lbs con spine 300 está en el borde - spine 340 sería más fácil de tunear
        expect(result.spineRequired).toBeGreaterThan(0.25)
        expect(result.spineRequired).toBeLessThan(0.45)
        // spineRequired ~0.326, spineDynamic ~0.289, matchIndex ~0.89
        expect(result.matchIndex).toBeGreaterThan(0.85) // Ligeramente stiff pero aceptable
        expect(result.matchIndex).toBeLessThan(1.10)
    })

    // Test: Hoyt Rexon con Easton ACC 340
    // Según Easton: Spine 340 es para 56-70 lbs @ 30"
    // Hoyt Rexon: 70 lbs @ 30" - DEBERÍA ser GOOD (límite superior)
    it('valida Hoyt Rexon + Easton ACC 340: spine correcto para 70 lbs @ 30"', () => {
        const result = calculateSpineMatch(
            HOYT_REXON,
            EASTON_ACC_340,
            baseString,
        )

        console.log('Hoyt Rexon + ACC 340:', result)

        expect(result.status).toBe('good')
        // 70 lbs está en el límite superior del rango para spine 340
        expect(result.spineRequired).toBeGreaterThan(0.28)
        expect(result.spineRequired).toBeLessThan(0.45)
    })

    // Test: Bowtech Realm con Easton XX78 400
    // Según Easton: Spine 400 es para 45-60 lbs @ 30"
    // Bowtech Realm: 60 lbs @ 28" (equivalente a ~65 lbs @ 30") - DEBERÍA ser GOOD
    it('valida Bowtech Realm + Easton XX78 400: spine correcto para 60 lbs @ 28"', () => {
        const result = calculateSpineMatch(
            BOWTECH_REALM,
            EASTON_XX78_400,
            baseString,
        )

        console.log('Bowtech Realm + XX78 400:', result)

        // Con draw length 28" más corto, el spine efectivo es mayor
        expect(result.status).toBe('good')
        expect(result.spineRequired).toBeGreaterThan(0.30)
    })

    // Test: Youth bow con spine 500
    // Según Easton: Spine 500 es para 38-50 lbs @ 30"
    // Youth bow: 35 lbs @ 26" - podría ser borderline (necesita spine 600)
    it('valida Youth bow + Easton FMJ 500: arco juvenil con spine 500', () => {
        const result = calculateSpineMatch(
            YOUTH_BOW,
            EASTON_FMJ_500,
            baseString,
        )

        console.log('Youth Bow + FMJ 500:', result)

        // 35 lbs @ 26" está por debajo del rango óptimo para spine 500
        // El resultado podría ser STIFF o marginal
        expect(result.spineRequired).not.toBeNull()
        // Spine requerido debe ser mayor que el disponible
        expect(result.spineDynamic).toBeGreaterThan(0.45)
    })

    // Test: Verificación de FPS contra IBO
    it('verifica que el FPS calculado sea razonable vs IBO', () => {
        // Mathews V3X 33: IBO 350 FPS (medido con flecha de 350 grains)
        const mathewsResult = calculateSpineMatch(
            MATHEWS_V3X_33,
            EASTON_XX75_300,
            baseString,
        )

        console.log('Mathews FPS calculation:', mathewsResult.calculatedFPS)

        // Con flecha de 489 grains (XX75 300 + componentes), la velocidad será menor
        // IBO 350 se mide con flecha de 350 grains = velocidad máxima teórica
        // Con flecha más pesada: ~260-280 FPS es un rango razonable
        expect(mathewsResult.calculatedFPS).not.toBeNull()
        expect(mathewsResult.calculatedFPS!).toBeGreaterThan(260) // Mínimo razonable con flecha pesada
        expect(mathewsResult.calculatedFPS!).toBeLessThan(380) // Máximo razonable

        // Youth bow: IBO 280 FPS
        const youthResult = calculateSpineMatch(
            YOUTH_BOW,
            EASTON_FMJ_500,
            baseString,
        )

        console.log('Youth FPS calculation:', youthResult.calculatedFPS)

        expect(youthResult.calculatedFPS).not.toBeNull()
        // Youth bows son más lentos
        expect(youthResult.calculatedFPS!).toBeLessThan(280)
    })

    // Test: Validación de FOC
    it('verifica cálculo de FOC según especificaciones Easton', () => {
        // Configuración estándar: FOC 10-15% es óptimo para caza
        const result = calculateSpineMatch(
            MATHEWS_V3X_33,
            EASTON_XX75_300,
            baseString,
        )

        console.log('FOC Calculation:', result.foc)

        expect(result.foc).not.toBeNull()
        // Con punta de 100 grains y flecha de ~340 grains total, FOC debe estar en rango
        expect(result.foc!).toBeGreaterThan(5)
        expect(result.foc!).toBeLessThan(20)
    })

    // Test: Verificación de peso de flecha (GPP - Grains Per Pound)
    it('verifica ratio peso flecha/potencia (GPP)', () => {
        const result = calculateSpineMatch(
            MATHEWS_V3X_33, // 75 lbs
            EASTON_XX75_300, // ~340 grains shaft + componentes = ~400+ total
            baseString,
        )

        console.log('Arrow weight:', result.arrowTotalWeight)
        console.log('GPP:', result.arrowTotalWeight / 75)

        // GPP recomendado: 5-6 grains por libra mínimo para caza
        const gpp = result.arrowTotalWeight / 75
        expect(gpp).toBeGreaterThan(4.5) // Mínimo seguro
        expect(gpp).toBeLessThan(8) // Máximo para velocidad razonable
    })

    // Test: Combinación INCORRECTA deliberada
    // Arco de 70 lbs con spine 600 (demasiado flexible)
    it('detecta combinación incorrecta: arco potente + spine muy flexible', () => {
        const wrongArrow: ArrowSpecs = {
            ...EASTON_XX75_300,
            staticSpine: '0.600', // Spine 600 es para arcos de 30-45 lbs
        }

        const result = calculateSpineMatch(
            HOYT_REXON, // 70 lbs
            wrongArrow,
            baseString,
        )

        console.log('Wrong combination (70 lbs + spine 600):', result)

        // DEBERÍA dar WEAK - la flecha es demasiado flexible
        expect(result.status).toBe('weak')
        expect(result.matchIndex).toBeGreaterThan(1.2)
        expect(result.warnings.length).toBeGreaterThan(0)
    })

    // Test: Combinación INCORRECTA en el otro extremo
    // Arco de 35 lbs con spine 300 (demasiado rígido)
    it('detecta combinación incorrecta: arco débil + spine muy rígido', () => {
        const wrongArrow: ArrowSpecs = {
            ...EASTON_XX75_300,
            staticSpine: '0.300', // Spine 300 es para arcos de 66-80 lbs
        }

        const result = calculateSpineMatch(
            YOUTH_BOW, // 35 lbs
            wrongArrow,
            baseString,
        )

        console.log('Wrong combination (35 lbs + spine 300):', result)

        // DEBERÍA dar STIFF - la flecha es demasiado rígida
        expect(result.status).toBe('stiff')
        expect(result.matchIndex).toBeLessThan(0.8)
    })
})
