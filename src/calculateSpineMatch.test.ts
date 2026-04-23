import { describe, expect, it } from 'vitest'
import { ARCHERY_TYPE } from './constants'
import { SFAX_PRIMARY_REFERENCE_CASES } from './utils/spineCalibrationDataset'
import { calculateSpineMatch, type ArrowSpecs, type BowSpecs, type StringWeights } from './utils/archeryCalculator'
import { evaluateCompoundMonotonicity, summarizeCompoundCalibration } from './utils/spineCalibration'

const baseBow: BowSpecs = {
    iboVelocity: '335',
    drawLength: '29',
    drawWeight: '70',
    braceHeight: '6.5',
    axleToAxle: '34',
    percentLetoff: '85',
    archeryType: ARCHERY_TYPE.COMPOUND,
}

const baseArrow: ArrowSpecs = {
    shaftLength: '28',
    pointWeight: '125',
    insertWeight: '25',
    shaftGpi: '8.6',
    measuredArrowTotalWeight: '',
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

const baseString: StringWeights = {
    peep: '10',
    dLoop: '6',
    nockPoint: '2',
    silencers: '0',
    silencerDfc: '0',
    releaseType: 'Caliper Release',
    stringMaterial: 'fastflight',
}

describe('calculateSpineMatch', () => {
    it('devuelve resultado vacío cuando faltan obligatorios', () => {
        const result = calculateSpineMatch(
            {
                ...baseBow,
                drawWeight: '',
            },
            baseArrow,
            baseString,
        )

        expect(result.status).toBeNull()
        expect(result.spineRequired).toBeNull()
        expect(result.matchIndex).toBeNull()
        expect(result.recommendations.join(' ')).toMatch(/Faltan datos clave/i)
    })

    it('degrada la confianza a "low" cuando falta iboVelocity', () => {
        const result = calculateSpineMatch(
            {
                ...baseBow,
                iboVelocity: '',
            },
            baseArrow,
            baseString,
        )

        expect(result.spineRequiredCI?.confidence).toBe('low')
    })

    it('degrada la confianza a "low" cuando falta el tipo de release', () => {
        const result = calculateSpineMatch(
            baseBow,
            baseArrow,
            {
                ...baseString,
                releaseType: '',
            },
        )

        expect(result.spineRequiredCI?.confidence).toBe('low')
    })

    it('clampa silencerDfc al rango físico [0, halfA2A]', () => {
        const overRange = calculateSpineMatch(
            baseBow,
            baseArrow,
            {
                ...baseString,
                silencers: '12',
                silencerDfc: '30',
            },
        )
        const atBoundary = calculateSpineMatch(
            baseBow,
            baseArrow,
            {
                ...baseString,
                silencers: '12',
                silencerDfc: '17',
            },
        )
        const negative = calculateSpineMatch(
            baseBow,
            baseArrow,
            {
                ...baseString,
                silencers: '12',
                silencerDfc: '-5',
            },
        )
        const atZero = calculateSpineMatch(
            baseBow,
            baseArrow,
            {
                ...baseString,
                silencers: '12',
                silencerDfc: '0',
            },
        )

        expect(overRange.spineRequired).toBeCloseTo(atBoundary.spineRequired!, 6)
        expect(negative.spineRequired).toBeCloseTo(atZero.spineRequired!, 6)
    })

    it('advierte cuando no se especifica el tipo de arco y se infiere por defecto', () => {
        const result = calculateSpineMatch(
            {
                ...baseBow,
                archeryType: undefined,
            },
            baseArrow,
            baseString,
        )

        expect(result.warnings.join(' ')).toMatch(/tipo de arco.*compound/i)
    })

    it('advierte cuando el peso total medido es menor que la suma de componentes', () => {
        const componentSum = 125 + 25 + 3 * 8 + 10 + 10 + 10 // 204 grains sin shaft
        const result = calculateSpineMatch(
            baseBow,
            {
                ...baseArrow,
                measuredArrowTotalWeight: String(componentSum - 10),
            },
            baseString,
        )

        expect(result.warnings.join(' ')).toMatch(/peso total medido.*componentes/i)
    })

    it('deriva matchIndexCI de los intervalos de numerador y denominador', () => {
        const result = calculateSpineMatch(baseBow, baseArrow, baseString)

        expect(result.matchIndexCI).not.toBeNull()
        expect(result.spineDynamicCI).not.toBeNull()
        expect(result.spineRequiredCI).not.toBeNull()

        const expectedLower = result.spineDynamicCI!.lower / result.spineRequiredCI!.upper
        const expectedUpper = result.spineDynamicCI!.upper / result.spineRequiredCI!.lower

        expect(result.matchIndexCI!.lower).toBeCloseTo(expectedLower, 8)
        expect(result.matchIndexCI!.upper).toBeCloseTo(expectedUpper, 8)
    })

    it('trata entradas no numéricas como faltantes en lugar de propagar NaN', () => {
        const result = calculateSpineMatch(
            {
                ...baseBow,
                drawWeight: 'abc',
            },
            baseArrow,
            baseString,
        )

        expect(result.status).toBeNull()
        expect(result.spineRequired).toBeNull()
        expect(result.matchIndex).toBeNull()
        expect(result.recommendations.join(' ')).toMatch(/Faltan datos clave/i)
    })

    it('usa el peso total medido de flecha cuando está disponible', () => {
        const result = calculateSpineMatch(
            baseBow,
            {
                ...baseArrow,
                shaftGpi: '0',
                measuredArrowTotalWeight: '415.5',
            },
            baseString,
        )

        expect(result.arrowTotalWeight).toBeCloseTo(415.5, 10)
    })

    it('ajusta el spine objetivo cuando hay cronógrafo real', () => {
        const baseline = calculateSpineMatch(baseBow, baseArrow, baseString)
        const slowerChrono = calculateSpineMatch(
            {
                ...baseBow,
                measuredChronoSpeed: '255',
            },
            baseArrow,
            baseString,
        )
        const fasterChrono = calculateSpineMatch(
            {
                ...baseBow,
                measuredChronoSpeed: '295',
            },
            baseArrow,
            baseString,
        )

        expect(baseline.spineRequired).not.toBeNull()
        expect(slowerChrono.spineRequired).not.toBeNull()
        expect(fasterChrono.spineRequired).not.toBeNull()
        expect(slowerChrono.usedChronographData).toBe(true)
        expect(fasterChrono.usedChronographData).toBe(true)
        expect(slowerChrono.spineRequired!).toBeGreaterThan(baseline.spineRequired!)
        expect(fasterChrono.spineRequired!).toBeLessThan(baseline.spineRequired!)
    })

    it('corrige el spine seleccionado por temperatura en shafts de carbono', () => {
        const cold = calculateSpineMatch(baseBow, baseArrow, baseString, 30)
        const hot = calculateSpineMatch(baseBow, baseArrow, baseString, 100)

        expect(cold.spineDynamic).not.toBeNull()
        expect(hot.spineDynamic).not.toBeNull()
        expect(hot.spineDynamic!).toBeGreaterThan(cold.spineDynamic!)
    })

    it('sigue razonablemente los casos SFAX completos', () => {
        const fullCases = SFAX_PRIMARY_REFERENCE_CASES.filter((entry) => entry.completeness === 'full')

        for (const referenceCase of fullCases) {
            const result = calculateSpineMatch(referenceCase.bow, referenceCase.arrow, referenceCase.stringWeights)
            const calculatedKe =
                result.effectiveFPS == null
                    ? 0
                    : (result.arrowTotalWeight * result.effectiveFPS * result.effectiveFPS) / 450240
            const grainsPerPound = result.arrowTotalWeight / Number(referenceCase.bow.drawWeight)

            expect(result.spineRequired).not.toBeNull()
            expect(result.effectiveFPS).not.toBeNull()
            expect(result.foc).not.toBeNull()
            expect(Math.abs(result.spineRequired! - referenceCase.sfaxResults.dynamicSpine)).toBeLessThan(0.03)
            expect(Math.abs(result.effectiveFPS! - referenceCase.sfaxResults.fps)).toBeLessThan(15)
            expect(Math.abs(result.arrowTotalWeight - referenceCase.sfaxResults.totalArrowWeight)).toBeLessThan(0.2)
            expect(Math.abs(grainsPerPound - referenceCase.sfaxResults.grlb)).toBeLessThan(0.05)
            expect(Math.abs(calculatedKe - referenceCase.sfaxResults.ke)).toBeLessThan(4)
            expect(Math.abs(result.foc! - referenceCase.sfaxResults.foc)).toBeLessThan(1.5)
        }
    })

    it('mantiene las direcciones físicas/empíricas SFAX', () => {
        const checks = evaluateCompoundMonotonicity()
        expect(checks.every((check) => check.passed)).toBe(true)
    })

    it.each(SFAX_PRIMARY_REFERENCE_CASES)('$label coincide con el spine dinamico SFAX', (referenceCase) => {
        const result = calculateSpineMatch(referenceCase.bow, referenceCase.arrow, referenceCase.stringWeights)

        expect(result.spineRequired).not.toBeNull()
        expect(Math.abs(result.spineRequired! - referenceCase.sfaxResults.dynamicSpine)).toBeLessThanOrEqual(0.001)
    })

    it('resume la fidelidad compound con error acotado frente a SFAX', () => {
        const summary = summarizeCompoundCalibration()

        expect(summary.dynamicSpine.meanAbsoluteError).toBeLessThan(0.04)
        expect(summary.dynamicSpine.maxAbsoluteError).toBeLessThan(0.09)
        expect(summary.fps.meanAbsoluteError).toBeLessThan(20)
        expect(summary.totalArrowWeight.meanAbsoluteError).toBeLessThan(0.2)
        expect(summary.grlb.meanAbsoluteError).toBeLessThan(0.06)
        expect(summary.foc.meanAbsoluteError).toBeLessThan(1.5)
        expect(summary.ke.meanAbsoluteError).toBeLessThan(5)
    })
})
