import { describe, expect, it } from 'vitest'
import { ARCHERY_TYPE } from './constants'
import { calculateSpineMatch, type ArrowSpecs, type BowSpecs, type StringWeights } from './utils/archeryCalculator'

const recurveBow: BowSpecs = {
    iboVelocity: '',
    drawLength: '28',
    drawWeight: '40',
    braceHeight: '',
    axleToAxle: '',
    percentLetoff: '',
    archeryType: ARCHERY_TYPE.RECURVO,
}

const recurveArrow: ArrowSpecs = {
    shaftLength: '28',
    pointWeight: '100',
    insertWeight: '0',
    shaftGpi: '8.0',
    fletchQuantity: '3',
    weightEach: '3',
    fletchLength: '3',
    fletchHeight: '0.5',
    wrapWeight: '0',
    nockWeight: '7',
    bushingPin: '0',
    staticSpine: '0.450',
    shaftMaterial: 'carbon',
}

const recurveString: StringWeights = {
    peep: '0',
    dLoop: '0',
    nockPoint: '2',
    silencers: '0',
    silencerDfc: '0',
    releaseType: 'fingers',
    stringMaterial: 'dacron',
}

const compoundBow: BowSpecs = {
    iboVelocity: '335',
    drawLength: '29',
    drawWeight: '70',
    braceHeight: '6.5',
    axleToAxle: '34',
    percentLetoff: '85',
    archeryType: ARCHERY_TYPE.COMPOUND,
}

const compoundArrow: ArrowSpecs = {
    shaftLength: '28',
    pointWeight: '125',
    insertWeight: '25',
    shaftGpi: '8.6',
    fletchQuantity: '3',
    weightEach: '8',
    fletchLength: '2',
    fletchHeight: '0.5',
    wrapWeight: '10',
    nockWeight: '10',
    bushingPin: '10',
    staticSpine: '0.340',
    shaftUseCategory: 'base',
    insertType: 'default',
    shaftMaterial: 'carbon',
}

const compoundString: StringWeights = {
    peep: '10',
    dLoop: '6',
    nockPoint: '2',
    silencers: '0',
    silencerDfc: '0',
    releaseType: 'Caliper Release',
    stringMaterial: 'fastflight',
}

describe('non-compound spine model (carta Easton 2023)', () => {
    it('calcula spine para recurvo sin IBO ni brace height', () => {
        const result = calculateSpineMatch(recurveBow, recurveArrow, recurveString)

        expect(result.spineRequired).not.toBeNull()
        // 40 lb @ 28in, 100gr, dacron -> E=40 -> 0.7116*exp(-0.011285*40) = 0.453
        expect(result.spineRequired!).toBeCloseTo(0.453, 3)
        expect(result.status).toBe('good')
    })

    it('no inventa una velocidad cuando el recurvo no tiene IBO', () => {
        const result = calculateSpineMatch(recurveBow, recurveArrow, recurveString)

        expect(result.calculatedFPS).toBeNull()
        expect(result.effectiveFPS).toBeNull()
    })

    it('reporta el cronógrafo medido sin escalar el spine cuando no hay estimación propia', () => {
        const base = calculateSpineMatch(recurveBow, recurveArrow, recurveString)
        const withChrono = calculateSpineMatch(
            { ...recurveBow, measuredChronoSpeed: '185' },
            recurveArrow,
            recurveString,
        )

        expect(withChrono.measuredFPS).toBe(185)
        expect(withChrono.effectiveFPS).toBe(185)
        expect(withChrono.usedChronographData).toBe(true)
        expect(withChrono.spineRequired).toBeCloseTo(base.spineRequired!, 6)
    })

    it('sigue las celdas verificadas de la carta Easton para recurvo', () => {
        // 70 lb @ 28in -> celda 350-300
        const heavy = calculateSpineMatch({ ...recurveBow, drawWeight: '70' }, recurveArrow, recurveString)
        expect(heavy.spineRequired!).toBeGreaterThan(0.295)
        expect(heavy.spineRequired!).toBeLessThan(0.355)

        // 28 lb @ 28in -> celda 600-500
        const light = calculateSpineMatch({ ...recurveBow, drawWeight: '28' }, recurveArrow, recurveString)
        expect(light.spineRequired!).toBeGreaterThan(0.49)
        expect(light.spineRequired!).toBeLessThan(0.61)

        // 50 lb @ 31in -> celda 350-300 (E = 50 + 15 = 65)
        const long = calculateSpineMatch(
            { ...recurveBow, drawWeight: '50' },
            { ...recurveArrow, shaftLength: '31' },
            recurveString,
        )
        expect(long.spineRequired!).toBeGreaterThan(0.295)
        expect(long.spineRequired!).toBeLessThan(0.355)
    })

    it('mantiene las direcciones físicas del modelo recurvo', () => {
        const base = calculateSpineMatch(recurveBow, recurveArrow, recurveString)
        const heavierBow = calculateSpineMatch({ ...recurveBow, drawWeight: '45' }, recurveArrow, recurveString)
        const longerArrow = calculateSpineMatch(recurveBow, { ...recurveArrow, shaftLength: '29' }, recurveString)
        const heavierPoint = calculateSpineMatch(recurveBow, { ...recurveArrow, pointWeight: '125' }, recurveString)
        const heavyInsert = calculateSpineMatch(recurveBow, { ...recurveArrow, insertWeight: '50' }, recurveString)
        const fastflight = calculateSpineMatch(recurveBow, recurveArrow, { ...recurveString, stringMaterial: 'fastflight' })
        const longerDraw = calculateSpineMatch({ ...recurveBow, drawLength: '30' }, recurveArrow, recurveString)

        expect(heavierBow.spineRequired!).toBeLessThan(base.spineRequired!)
        expect(longerArrow.spineRequired!).toBeLessThan(base.spineRequired!)
        expect(heavierPoint.spineRequired!).toBeLessThan(base.spineRequired!)
        expect(heavyInsert.spineRequired!).toBeLessThan(base.spineRequired!)
        expect(fastflight.spineRequired!).toBeLessThan(base.spineRequired!)
        expect(longerDraw.spineRequired!).toBeLessThan(base.spineRequired!)
    })

    it('aplica el desplazamiento longbow de la carta para tradicional con aviso', () => {
        const recurve = calculateSpineMatch(recurveBow, recurveArrow, recurveString)
        const traditional = calculateSpineMatch(
            { ...recurveBow, archeryType: ARCHERY_TYPE.TRADITIONAL },
            recurveArrow,
            recurveString,
        )

        // 40 lb longbow = fila de 60 lb recurvo -> E=60 -> 0.362
        expect(traditional.spineRequired!).toBeCloseTo(0.362, 3)
        expect(traditional.spineRequired!).toBeLessThan(recurve.spineRequired!)
        expect(traditional.warnings.join(' ')).toMatch(/longbow|tradicional/i)
    })

    it('avisa de la suposición de peso marcado cuando la apertura difiere de 28in', () => {
        const result = calculateSpineMatch({ ...recurveBow, drawLength: '30' }, recurveArrow, recurveString)
        expect(result.recommendations.join(' ')).toMatch(/28/)
    })
})

describe('compound: agresividad de levas (Easton-equivalente)', () => {
    it('no altera el resultado cuando el campo está vacío o es medium', () => {
        const unset = calculateSpineMatch(compoundBow, compoundArrow, compoundString)
        const empty = calculateSpineMatch({ ...compoundBow, camAggressiveness: '' }, compoundArrow, compoundString)
        const medium = calculateSpineMatch({ ...compoundBow, camAggressiveness: 'medium' }, compoundArrow, compoundString)

        expect(empty.spineRequired).toBeCloseTo(unset.spineRequired!, 10)
        expect(medium.spineRequired).toBeCloseTo(unset.spineRequired!, 10)
    })

    it('leva más agresiva exige spine más rígido y leva redonda más flexible', () => {
        const base = calculateSpineMatch(compoundBow, compoundArrow, compoundString)
        const round = calculateSpineMatch({ ...compoundBow, camAggressiveness: 'round' }, compoundArrow, compoundString)
        const aggressive = calculateSpineMatch({ ...compoundBow, camAggressiveness: 'aggressive' }, compoundArrow, compoundString)
        const speed = calculateSpineMatch({ ...compoundBow, camAggressiveness: 'speed' }, compoundArrow, compoundString)

        expect(round.spineRequired!).toBeGreaterThan(base.spineRequired!)
        expect(aggressive.spineRequired!).toBeLessThan(base.spineRequired!)
        expect(speed.spineRequired!).toBeLessThan(aggressive.spineRequired!)
    })
})

describe('compound: regla Easton de suelta con dedos (+5 lb)', () => {
    it('con dedos exige más rígido incluso al letoff de referencia (65%)', () => {
        const mechanical = calculateSpineMatch(
            { ...compoundBow, percentLetoff: '65' },
            compoundArrow,
            compoundString,
        )
        const finger = calculateSpineMatch(
            { ...compoundBow, percentLetoff: '65' },
            compoundArrow,
            { ...compoundString, releaseType: 'manual fingers' },
        )

        expect(finger.spineRequired!).toBeLessThan(mechanical.spineRequired!)
    })

    it('con dedos y sin letoff no debilita la demanda artificialmente', () => {
        const finger = calculateSpineMatch(
            { ...compoundBow, percentLetoff: '' },
            compoundArrow,
            { ...compoundString, releaseType: 'manual fingers' },
        )
        const mechanical = calculateSpineMatch(
            { ...compoundBow, percentLetoff: '' },
            compoundArrow,
            compoundString,
        )

        expect(finger.spineRequired!).toBeLessThan(mechanical.spineRequired!)
    })
})

describe('compound: IBO por defecto cuando falta', () => {
    it('usa un IBO típico en lugar de producir un spine sin sentido', () => {
        const missingIbo = calculateSpineMatch({ ...compoundBow, iboVelocity: '' }, compoundArrow, compoundString)
        const explicitFallback = calculateSpineMatch({ ...compoundBow, iboVelocity: '320' }, compoundArrow, compoundString)

        expect(missingIbo.spineRequired).not.toBeNull()
        expect(missingIbo.spineRequired!).toBeCloseTo(explicitFallback.spineRequired!, 6)
        expect(missingIbo.warnings.join(' ')).toMatch(/IBO/i)
        expect(missingIbo.spineRequiredCI?.confidence).toBe('low')
    })
})

describe('intervalos de confianza dependientes del nivel', () => {
    it('una confianza baja produce un intervalo relativo más ancho que una alta', () => {
        const high = calculateSpineMatch(compoundBow, compoundArrow, compoundString, 70)
        const low = calculateSpineMatch({ ...compoundBow, iboVelocity: '' }, compoundArrow, compoundString)

        expect(high.spineRequiredCI?.confidence).toBe('high')
        expect(low.spineRequiredCI?.confidence).toBe('low')

        const highWidth = (high.spineRequiredCI!.upper - high.spineRequiredCI!.lower) / high.spineRequiredCI!.value
        const lowWidth = (low.spineRequiredCI!.upper - low.spineRequiredCI!.lower) / low.spineRequiredCI!.value

        expect(lowWidth).toBeGreaterThan(highWidth)
    })
})
