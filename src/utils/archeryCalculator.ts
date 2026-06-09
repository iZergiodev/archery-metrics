import {
    ARCHERY_TYPE,
    FOC_MAX_RECOMMENDED,
    FOC_MIN_RECOMMENDED,
    GPP_MAX_RECOMMENDED,
    GPP_MIN_RECOMMENDED,
    GPP_MIN_SAFE,
    MATCH_EXTREME_STIFF,
    MATCH_EXTREME_WEAK,
    MATCH_GOOD_MAX,
    MATCH_GOOD_MIN,
    SFAX_CHRONOGRAPH_MAX_RATIO,
    SFAX_CHRONOGRAPH_MIN_RATIO,
    SFAX_FOC_FLETCH_BASE_OFFSET,
    SFAX_FOC_FLETCH_DIVISOR,
    SFAX_FOC_FRONT_MASS_DEPTH_MULTIPLIER,
    SFAX_FOC_NOCK_OVERHANG,
    SFAX_FOC_WRAP_OFFSET,
    SFAX_INSERT_DEPTHS,
    SFAX_SHAFT_CATEGORY_BASE,
    SFAX_SHAFT_CATEGORY_HUNTING,
    SFAX_SHAFT_CATEGORY_TARGET,
    TEMP_REFERENCE,
    TEMP_SPINE_COEFFICIENT,
    VELOCITY_MAX_SAFE,
    VELOCITY_MIN_TARGET,
    VELOCITY_OPTIMAL_MAX,
    SFAX_DYNAMIC_DEFAULT_LENGTH_FALLBACK,
    SFAX_REFERENCE_DRAW_WEIGHT as SFAX_DRAW_WEIGHT_REFERENCE,
    SFAX_REFERENCE_DRAW_LENGTH as SFAX_DRAW_LENGTH_REFERENCE,
    SFAX_REFERENCE_BRACE_HEIGHT as SFAX_BRACE_HEIGHT_REFERENCE,
    SFAX_REFERENCE_ARROW_WEIGHT as SFAX_ARROW_WEIGHT_REFERENCE,
    SFAX_REFERENCE_PERCENT as SFAX_PERCENT_REFERENCE,
    SFAX_REFERENCE_HOLDING_PERCENT as SFAX_HOLDING_PERCENT_REFERENCE,
    SFAX_SPINE_TEST_LENGTH as SFAX_DYNAMIC_AMO_TEST_LENGTH,
    SFAX_VELOCITY_DRAW_WEIGHT_FPS as SFAX_SPEED_ADJUST_DRAW_WEIGHT,
    SFAX_VELOCITY_BRACE_HEIGHT_FPS as SFAX_SPEED_ADJUST_BRACE_HEIGHT,
    SFAX_VELOCITY_COMPOUND_BASE_OFFSET as SFAX_SPEED_COMPOUND_BASE_OFFSET,
    SFAX_VELOCITY_NON_COMPOUND_BASE_OFFSET as SFAX_SPEED_NON_COMPOUND_BASE_OFFSET,
    SFAX_VELOCITY_COMPOUND_BASE_EFFICIENCY as SFAX_SPEED_COMPOUND_BASE_EFFICIENCY,
    SFAX_VELOCITY_NON_COMPOUND_BASE_EFFICIENCY as SFAX_SPEED_NON_COMPOUND_BASE_EFFICIENCY,
    SFAX_VELOCITY_DIVISOR as SFAX_SPEED_EFFICIENCY_DIVISOR,
    SFAX_VELOCITY_SCALING_FACTOR as SFAX_SPEED_EFFICIENCY_SCALE,
    SFAX_VELOCITY_WEIGHT_CLASS_SIZE as SFAX_ARROW_WEIGHT_CLASS_STEP,
    SFAX_VELOCITY_WEIGHT_CLASS_START as SFAX_ARROW_WEIGHT_CLASS_BASE,
    SFAX_VELOCITY_DECAY_MID as SFAX_SPEED_DECAY_LOW,
    SFAX_VELOCITY_DECAY_HIGH as SFAX_SPEED_DECAY_HIGH,
    SFAX_VELOCITY_DEFAULT_DW_FACTOR as SFAX_SPEED_DEFAULT_DRAW_WEIGHT_FACTOR,
    SFAX_VELOCITY_DEFAULT_DL_FACTOR as SFAX_SPEED_DEFAULT_DRAW_LENGTH_FACTOR,
    SFAX_VELOCITY_DW_MICRO_FACTOR as SFAX_SPEED_DRAW_WEIGHT_MICRO_FACTOR,
    SFAX_VELOCITY_DL_MICRO_FACTOR as SFAX_SPEED_DRAW_LENGTH_MICRO_FACTOR,
    SFAX_VELOCITY_LOW_IBO_THRESHOLD as SFAX_SPEED_LOW_IBO_THRESHOLD,
    SFAX_DYNAMIC_DRAW_CURVE_START as SFAX_DYNAMIC_DRAW_START,
    SFAX_DYNAMIC_DRAW_CURVE_END as SFAX_DYNAMIC_DRAW_END,
    SFAX_DYNAMIC_DRAW_CURVE_AMPLITUDE as SFAX_DYNAMIC_DRAW_DELTA_COMPOUND,
    SFAX_DYNAMIC_A2A_CURVE_START as SFAX_DYNAMIC_A2A_START,
    SFAX_DYNAMIC_A2A_CURVE_END as SFAX_DYNAMIC_A2A_END,
    SFAX_DYNAMIC_A2A_CURVE_AMPLITUDE as SFAX_DYNAMIC_A2A_DELTA,
    SFAX_RELEASE_FACTOR_FINGER as SFAX_DYNAMIC_RELEASE_FINGER,
    SFAX_RELEASE_FACTOR_ROPE as SFAX_DYNAMIC_RELEASE_ROPE,
    SFAX_RELEASE_FACTOR_POST as SFAX_DYNAMIC_RELEASE_POST,
    SFAX_RELEASE_FACTOR_UNKNOWN as SFAX_DYNAMIC_RELEASE_UNKNOWN,
    SFAX_DYNAMIC_LENGTH_MULTIPLIER,
    SFAX_DYNAMIC_LENGTH_DIVISOR,
    SFAX_DYNAMIC_LENGTH_REFERENCE as SFAX_DYNAMIC_INTERMEDIATE_REFERENCE,
    SFAX_DYNAMIC_LENGTH_BASE,
    SFAX_COMPONENT_SENSITIVITY as SFAX_DYNAMIC_COMPONENT_SENSITIVITY,
    SFAX_FRONT_MASS_REFERENCE as SFAX_DYNAMIC_FRONT_MASS_REFERENCE,
    SFAX_FLETCH_WEIGHT_REFERENCE as SFAX_DYNAMIC_FLETCH_WEIGHT_REFERENCE,
    SFAX_REAR_MASS_REFERENCE as SFAX_DYNAMIC_REAR_MASS_REFERENCE,
    SFAX_MIN_INTERMEDIATE_SPINE as SFAX_DYNAMIC_MIN_INTERMEDIATE,
    SFAX_DACRON_BASE_ADJUSTMENT as SFAX_DACRON_BASE,
    SFAX_DACRON_MAX_ADJUSTMENT as SFAX_DACRON_MAX,
    SFAX_DACRON_DRAW_LENGTH_FLOOR as SFAX_DACRON_START_DRAW_LENGTH,
    SFAX_DACRON_DRAW_LENGTH_CEILING as SFAX_DACRON_END_DRAW_LENGTH,
    SFAX_DACRON_CURVE_DIVISOR as SFAX_DACRON_DIVISOR,
    SFAX_VELOCITY_LOW_IBO_EFFICIENCY as SFAX_SPEED_LOW_IBO_EFFICIENCY,
    EASTON_FINGER_RELEASE_LB,
    SFAX_DEFAULT_IBO_FALLBACK,
    CAM_FDR,
    CAM_FDR_TO_LB,
    RECURVE_SPINE_BASE,
    RECURVE_SPINE_SLOPE,
    RECURVE_REFERENCE_ARROW_LENGTH,
    RECURVE_REFERENCE_POINT_WEIGHT,
    RECURVE_REFERENCE_DRAW_LENGTH,
    RECURVE_LENGTH_LB_PER_INCH,
    RECURVE_POINT_LB_PER_25GR,
    RECURVE_INSERT_FREE_ALLOWANCE_GR,
    RECURVE_DRAW_LENGTH_LB_PER_INCH,
    RECURVE_FASTFLIGHT_LB,
    RECURVE_UNKNOWN_STRING_LB,
    TRADITIONAL_LONGBOW_LB_OFFSET,
    RECURVE_MIN_EFFECTIVE_LB,
    RECURVE_MAX_EFFECTIVE_LB,
    CI_REQUIRED_UNCERTAINTY,
    CI_DYNAMIC_UNCERTAINTY,
    type ArcheryType,
} from '../constants'

export type ShaftUseCategory = 'base' | 'hunting' | 'target'
export type InsertType = keyof typeof SFAX_INSERT_DEPTHS
export type SpineMatchStatus = 'weak' | 'good' | 'stiff' | 'unknown'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type ConfidenceInterval = {
    value: number
    lower: number
    upper: number
    confidence: ConfidenceLevel
}

export type SpineMatchResult = {
    spineRequired: number | null
    spineDynamic: number | null
    matchIndex: number | null
    status: SpineMatchStatus | null
    arrowTotalWeight: number
    foc: number | null
    calculatedFPS: number | null
    effectiveFPS: number | null
    measuredFPS: number | null
    usedChronographData: boolean
    spineRequiredCI: ConfidenceInterval | null
    spineDynamicCI: ConfidenceInterval | null
    matchIndexCI: ConfidenceInterval | null
    temperature?: number
    archeryType: ArcheryType
    recommendations: string[]
    warnings: string[]
}

export type BowSpecs = {
    drawWeight: string
    drawLength: string
    iboVelocity: string
    measuredChronoSpeed?: string
    braceHeight: string
    axleToAxle: string
    percentLetoff: string
    camAggressiveness?: string
    archeryType?: ArcheryType
}

export type ArrowSpecs = {
    shaftLength: string
    pointWeight: string
    insertWeight: string
    shaftGpi: string
    measuredArrowTotalWeight?: string
    fletchQuantity: string
    weightEach: string
    fletchLength?: string
    fletchHeight?: string
    fletchOffset?: string
    wrapWeight: string
    nockWeight: string
    bushingPin: string
    staticSpine: string
    shaftUseCategory?: ShaftUseCategory
    insertType?: InsertType
    shaftMaterial?: 'carbon' | 'aluminum' | 'wood' | 'fiberglass'
}

export type StringWeights = {
    peep: string
    dLoop: string
    nockPoint: string
    silencers: string
    silencerDfc: string
    releaseType: string
    stringMaterial: 'dacron' | 'fastflight' | 'unknown'
}

type VelocityModel = {
    adjustedVelocity: number
    baseEfficiency: number
    weightDecay: number
    totalEfficiency: number
    drawWeightFactor: number
    drawLengthFactor: number
    weightCorrectionFactor: number
}

type ArrowComponentWeight = {
    shaftWeight: number
    arrowTotalWeight: number
    pointWeight: number
    insertWeight: number
    fletchQuantity: number
    weightEach: number
    wrapWeight: number
    nockWeight: number
    bushingPin: number
}

const DEFAULT_FLETCH_LENGTH = 2
const DEFAULT_FLETCH_HEIGHT = 0.5

const SFAX_SPEED_WEIGHT_CORRECTION_OFFSET = 0.04
const SFAX_SPEED_WEIGHT_CORRECTION_SCALE = 1.05
const SFAX_SPEED_DRAG_MULTIPLIER = 0.33

const toNumber = (value: string | undefined) => {
    const raw = value?.trim() ?? ''
    if (raw === '') return 0
    const parsed = Number(raw.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : 0
}
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const round3 = (value: number) => Number(value.toFixed(3))
const sfaxAbs = (value: number) => Math.abs(value)

function createConfidenceInterval(value: number, uncertaintyPercent: number, confidence: ConfidenceLevel): ConfidenceInterval {
    const uncertainty = value * uncertaintyPercent
    return { value, lower: value - uncertainty, upper: value + uncertainty, confidence }
}

function calculateConfidenceLevel(
    hasAllInputs: boolean,
    hasTemperature: boolean,
    hasPreciseMeasurements: boolean,
    hasKnownStringMaterial: boolean,
    hasMeasuredChronograph: boolean,
): ConfidenceLevel {
    if (hasAllInputs && hasPreciseMeasurements && hasKnownStringMaterial && (hasTemperature || hasMeasuredChronograph)) {
        return 'high'
    }
    if (hasAllInputs) return 'medium'
    return 'low'
}

function getEffectiveArcheryType(type: ArcheryType | undefined): ArcheryType {
    return type || ARCHERY_TYPE.COMPOUND
}

function getInsertDepth(insertType: InsertType | undefined): number {
    return SFAX_INSERT_DEPTHS[insertType ?? 'default'] ?? SFAX_INSERT_DEPTHS.default
}

function getShaftCategoryConstant(category: ShaftUseCategory | undefined): number {
    switch (category) {
        case 'hunting':
            return SFAX_SHAFT_CATEGORY_HUNTING
        case 'target':
            return SFAX_SHAFT_CATEGORY_TARGET
        default:
            return SFAX_SHAFT_CATEGORY_BASE
    }
}

function getReleaseMultiplier(releaseType: string): number {
    const normalized = releaseType.trim().toLowerCase()
    if (normalized.includes('finger') || normalized.includes('manual')) return SFAX_DYNAMIC_RELEASE_FINGER
    if (normalized.includes('rope')) return SFAX_DYNAMIC_RELEASE_ROPE
    if (normalized.includes('post') || normalized.includes('caliper') || normalized.includes('pre') || normalized.includes('release')) {
        return SFAX_DYNAMIC_RELEASE_POST
    }
    return SFAX_DYNAMIC_RELEASE_UNKNOWN
}

// Leva más agresiva = empuje inicial más violento = demanda de spine más
// rígida. Escala Easton-equivalente en libras; campo vacío/desconocido = 0,
// así los casos de referencia SFAX (que no definen leva) no se ven afectados.
function getCamAggressivenessLbDelta(raw: string | undefined): number {
    const normalized = (raw ?? '').trim().toLowerCase()
    if (normalized === '') return 0
    let forceDrawRatio: number = CAM_FDR.medium
    if (normalized.includes('round') || normalized.includes('soft') || normalized.includes('suave')) {
        forceDrawRatio = CAM_FDR.round
    } else if (normalized.includes('max')) {
        forceDrawRatio = CAM_FDR.max
    } else if (normalized.includes('speed') || normalized.includes('velocidad')) {
        forceDrawRatio = CAM_FDR.speed
    } else if (normalized.includes('aggressive') || normalized.includes('agresiv')) {
        forceDrawRatio = CAM_FDR.aggressive
    }
    return (forceDrawRatio - CAM_FDR.medium) * CAM_FDR_TO_LB
}

function calculateArrowComponentWeight(arrow: ArrowSpecs): ArrowComponentWeight {
    const shaftLength = toNumber(arrow.shaftLength)
    const shaftGpi = toNumber(arrow.shaftGpi)
    const measuredArrowTotalWeight = toNumber(arrow.measuredArrowTotalWeight ?? '')
    const pointWeight = toNumber(arrow.pointWeight)
    const insertWeight = toNumber(arrow.insertWeight)
    const fletchQuantity = toNumber(arrow.fletchQuantity)
    const weightEach = toNumber(arrow.weightEach)
    const wrapWeight = toNumber(arrow.wrapWeight)
    const nockWeight = toNumber(arrow.nockWeight)
    const bushingPin = toNumber(arrow.bushingPin)
    const componentWeightWithoutShaft =
        pointWeight + insertWeight + fletchQuantity * weightEach + wrapWeight + nockWeight + bushingPin
    const calculatedShaftWeight = shaftLength * shaftGpi
    const shaftWeight =
        measuredArrowTotalWeight > 0 ? Math.max(0, measuredArrowTotalWeight - componentWeightWithoutShaft) : calculatedShaftWeight

    return {
        shaftWeight,
        arrowTotalWeight: measuredArrowTotalWeight > 0 ? measuredArrowTotalWeight : componentWeightWithoutShaft + calculatedShaftWeight,
        pointWeight,
        insertWeight,
        fletchQuantity,
        weightEach,
        wrapWeight,
        nockWeight,
        bushingPin,
    }
}

// SFAX-faithful reverse-engineering: these curves are piecewise with intentional
// discontinuities at the [start, end] boundaries that match the original firmware's
// behavior. Do NOT smooth them — calibration tests depend on the exact shape.
// See calibration dataset in src/data/sfax/.
function sfaxSignedCurve(value: number, start: number, end: number, base: number, delta: number): number {
    const midpoint = (end - start) * 0.5 + start
    if (end < value) return -(base + delta)
    if (value < start) return base
    const scale = delta / sfaxAbs(end - start)
    const sign = midpoint <= value ? 1 : -1
    return sfaxAbs(midpoint - value) * scale * sign
}

// SFAX-faithful: the call site deliberately passes brace/letoff twice so the
// adjustments collapse to zero — this mirrors the firmware's velocity routine
// which only uses these deltas in a separate pass. The factor-of-0.2 appears
// both in letOffAdjustment and in velFromDW by design, not by mistake.
function calculateVelocityAdjustment(
    referenceBraceHeight: number,
    braceHeight: number,
    referenceLetoff: number,
    percentLetoff: number,
    drawWeight: number,
    drawLength: number,
    drawWeightFactor: number,
    drawLengthFactor: number,
): number {
    const letOffAdjustment =
        percentLetoff === referenceLetoff || percentLetoff === 0 ? 0 : (referenceLetoff - percentLetoff) * 0.2
    const velFromDL = (((referenceBraceHeight - braceHeight) + drawLength) - SFAX_DRAW_LENGTH_REFERENCE) * drawLengthFactor
    const velFromDW =
        (((letOffAdjustment * 0.2 * drawWeightFactor) + drawWeight) - SFAX_DRAW_WEIGHT_REFERENCE) * drawWeightFactor
    return velFromDL + velFromDW
}

function buildVelocityModel(
    archeryType: ArcheryType,
    iboVelocity: number,
    drawWeight: number,
    drawLength: number,
    braceHeight: number,
    percentLetoff: number,
    arrowTotalWeight: number,
): VelocityModel {
    const adjustedVelocity =
        iboVelocity +
        (drawWeight - SFAX_DRAW_WEIGHT_REFERENCE) * SFAX_SPEED_ADJUST_DRAW_WEIGHT +
        (braceHeight - SFAX_BRACE_HEIGHT_REFERENCE) * SFAX_SPEED_ADJUST_BRACE_HEIGHT

    const isCompound = archeryType === ARCHERY_TYPE.COMPOUND
    const speedBaseOffset = isCompound ? SFAX_SPEED_COMPOUND_BASE_OFFSET : SFAX_SPEED_NON_COMPOUND_BASE_OFFSET
    const baseEfficiencyOffset = isCompound ? SFAX_SPEED_COMPOUND_BASE_EFFICIENCY : SFAX_SPEED_NON_COMPOUND_BASE_EFFICIENCY
    const baseEfficiency = ((adjustedVelocity - speedBaseOffset) / SFAX_SPEED_EFFICIENCY_DIVISOR + baseEfficiencyOffset) / SFAX_PERCENT_REFERENCE

    const weightClassIndex = Math.trunc((arrowTotalWeight - SFAX_ARROW_WEIGHT_CLASS_BASE) / SFAX_ARROW_WEIGHT_CLASS_STEP)
    let scaledEfficiency = (baseEfficiency * SFAX_SPEED_EFFICIENCY_SCALE) / SFAX_ARROW_WEIGHT_CLASS_STEP
    let cumulativeDecay = 0

    for (let index = 0; index < weightClassIndex; index += 1) {
        if (index % 10 === 0 && index > 9) {
            scaledEfficiency *= index < 21 ? SFAX_SPEED_DECAY_LOW : SFAX_SPEED_DECAY_HIGH
        }
        cumulativeDecay += scaledEfficiency
    }

    const weightDecay = cumulativeDecay / SFAX_PERCENT_REFERENCE
    const totalEfficiency = baseEfficiency + weightDecay
    const drawWeightFactor =
        iboVelocity > SFAX_SPEED_LOW_IBO_THRESHOLD
            ? baseEfficiency * adjustedVelocity * SFAX_SPEED_DRAW_WEIGHT_MICRO_FACTOR
            : SFAX_SPEED_DEFAULT_DRAW_WEIGHT_FACTOR
    const drawLengthFactor =
        iboVelocity > SFAX_SPEED_LOW_IBO_THRESHOLD
            ? adjustedVelocity * SFAX_SPEED_DRAW_LENGTH_MICRO_FACTOR * baseEfficiency
            : SFAX_SPEED_DEFAULT_DRAW_LENGTH_FACTOR

    const speedAt350 =
        calculateVelocityAdjustment(
            braceHeight,
            braceHeight,
            percentLetoff,
            percentLetoff,
            drawWeight,
            drawLength,
            drawWeightFactor,
            drawLengthFactor,
        ) + iboVelocity
    const energyLike = (Math.pow(speedAt350, 2) * SFAX_ARROW_WEIGHT_REFERENCE) / (drawWeight * 2 * 7000)
    const adjustedEnergyLike = energyLike / ((baseEfficiency - SFAX_SPEED_WEIGHT_CORRECTION_OFFSET) + weightDecay)
    const equivalentWeight = (adjustedEnergyLike / energyLike - 1) * SFAX_ARROW_WEIGHT_REFERENCE
    const projectedSpeed =
        Math.sqrt(
            ((1 - weightDecay * SFAX_SPEED_WEIGHT_CORRECTION_SCALE) * adjustedEnergyLike) / (equivalentWeight + arrowTotalWeight),
        ) * Math.sqrt(drawWeight * 7000 * 2)

    let weightCorrectionFactor = 0
    if (arrowTotalWeight < 348 || arrowTotalWeight > 352) {
        weightCorrectionFactor = Math.abs(speedAt350 - projectedSpeed) / Math.abs(arrowTotalWeight - SFAX_ARROW_WEIGHT_REFERENCE)
    }
    if (iboVelocity <= SFAX_SPEED_LOW_IBO_THRESHOLD) {
        weightCorrectionFactor = SFAX_SPEED_LOW_IBO_EFFICIENCY
    }

    return {
        adjustedVelocity,
        baseEfficiency,
        weightDecay,
        totalEfficiency,
        drawWeightFactor,
        drawLengthFactor,
        weightCorrectionFactor,
    }
}

// FUN_0047c3d0: partial drag from silencer positioned at DFC inches from cam.
// Ratio clamped to [0, 1] so out-of-range DFC values never produce negative drag
// or a drag larger than the silencer's actual weight.
function calculateSilencerPartialDrag(axleToAxle: number, silencerDfc: number, silencerWeight: number): number {
    const halfA2A = axleToAxle * 0.5
    if (halfA2A <= 0) return 0
    const ratio = clamp(silencerDfc / halfA2A, 0, 1)
    return ratio * silencerWeight
}

function calculateVelocityDragBundle(
    axleToAxle: number,
    silencerDfc: number,
    silencerWeight: number,
    nockPointWeight: number,
    peepWeight: number,
    dLoopWeight: number,
): number {
    return calculateSilencerPartialDrag(axleToAxle, silencerDfc, silencerWeight) + nockPointWeight + peepWeight + dLoopWeight
}

function calculateArrowSpeed(
    bow: {
        archeryType: ArcheryType
        iboVelocity: number
        drawWeight: number
        drawLength: number
        braceHeight: number
        axleToAxle: number
        percentLetoff: number
    },
    arrow: {
        arrowTotalWeight: number
    },
    stringSide: {
        peepWeight: number
        dLoopWeight: number
        nockPointWeight: number
        silencerWeight: number
        silencerDfc: number
    },
): { fps: number; model: VelocityModel } {
    const model = buildVelocityModel(
        bow.archeryType,
        bow.iboVelocity,
        bow.drawWeight,
        bow.drawLength,
        bow.braceHeight,
        bow.percentLetoff,
        arrow.arrowTotalWeight,
    )
    const baseVelocity =
        calculateVelocityAdjustment(
            bow.braceHeight,
            bow.braceHeight,
            bow.percentLetoff,
            bow.percentLetoff,
            bow.drawWeight,
            bow.drawLength,
            model.drawWeightFactor,
            model.drawLengthFactor,
        ) + bow.iboVelocity
    const weightCorrection = (SFAX_ARROW_WEIGHT_REFERENCE - arrow.arrowTotalWeight) * model.weightCorrectionFactor
    const dragBundle = calculateVelocityDragBundle(
        bow.axleToAxle,
        stringSide.silencerDfc,
        stringSide.silencerWeight,
        stringSide.nockPointWeight,
        stringSide.peepWeight,
        stringSide.dLoopWeight,
    )
    const fps = baseVelocity + weightCorrection - dragBundle * SFAX_SPEED_DRAG_MULTIPLIER * model.totalEfficiency
    return { fps, model }
}

function calculateCompoundTargetSpine(
    bow: {
        iboVelocity: number
        drawWeight: number
        drawLength: number
        braceHeight: number
        axleToAxle: number
        percentLetoff: number
        releaseType: string
        stringMaterial: StringWeights['stringMaterial']
        camLbDelta: number
    },
    arrow: {
        shaftLength: number
        pointWeight: number
        insertWeight: number
        fletchQuantity: number
        weightEach: number
        fletchLength: number
        fletchHeight: number
        wrapWeight: number
        nockWeight: number
        bushingPin: number
        shaftUseCategory?: ShaftUseCategory
    },
    stringSide: {
        peepWeight: number
        dLoopWeight: number
        nockPointWeight: number
        silencerWeight: number
        silencerDfc: number
    },
): number {
    let intermediate =
        (bow.iboVelocity / 290) *
        (sfaxSignedCurve(bow.drawWeight, SFAX_DYNAMIC_DRAW_START, SFAX_DYNAMIC_DRAW_END, 0, SFAX_DYNAMIC_DRAW_DELTA_COMPOUND) +
            bow.drawWeight)
    intermediate -= sfaxSignedCurve(bow.axleToAxle, SFAX_DYNAMIC_A2A_START, SFAX_DYNAMIC_A2A_END, 0, SFAX_DYNAMIC_A2A_DELTA)

    const powerStroke = bow.drawLength - bow.braceHeight
    let lengthFactor =
        (SFAX_DYNAMIC_LENGTH_MULTIPLIER / sfaxAbs(SFAX_DYNAMIC_LENGTH_DIVISOR)) *
            (intermediate - SFAX_DYNAMIC_INTERMEDIATE_REFERENCE) +
        SFAX_DYNAMIC_LENGTH_BASE

    if (lengthFactor === 0) {
        lengthFactor = SFAX_DYNAMIC_DEFAULT_LENGTH_FALLBACK
    }

    const velocityRatio = (bow.braceHeight / powerStroke) * bow.iboVelocity * (powerStroke / lengthFactor)

    intermediate = (velocityRatio / sfaxAbs(SFAX_DRAW_LENGTH_REFERENCE)) * (powerStroke - lengthFactor) + intermediate

    // SFAX-faithful: the constant named "HOLDING_PERCENT_REFERENCE" is in fact the
    // percentLetoff reference (65) used by the firmware here, not a holding percent
    // in the consumer sense (100 - letoff). The two are compared on the same scale.
    if (bow.percentLetoff !== SFAX_HOLDING_PERCENT_REFERENCE && bow.percentLetoff !== 0) {
        intermediate += (SFAX_HOLDING_PERCENT_REFERENCE - bow.percentLetoff) * 0.2
    }

    const releaseMultiplier = getReleaseMultiplier(bow.releaseType)
    if (releaseMultiplier === SFAX_DYNAMIC_RELEASE_FINGER) {
        // Easton 2023 (verificado): dedos = +5 lb planos, independientes del
        // letoff. La curva SFAX original no está anclada por ningún caso de
        // referencia con dedos y degeneraba con letoff bajo o ausente.
        intermediate += EASTON_FINGER_RELEASE_LB
    } else {
        intermediate +=
            (releaseMultiplier / sfaxAbs(SFAX_DRAW_LENGTH_REFERENCE)) *
            (bow.percentLetoff - SFAX_HOLDING_PERCENT_REFERENCE)
    }

    intermediate += bow.camLbDelta

    if (intermediate <= 0) {
        intermediate = SFAX_DYNAMIC_MIN_INTERMEDIATE
    }

    // FUN_0046da20: string effect = (peep + FUN_0047c3d0() + nockPoint + dLoop) * 0.12
    const silencerDrag = calculateSilencerPartialDrag(bow.axleToAxle, stringSide.silencerDfc, stringSide.silencerWeight)
    const stringEffect =
        (stringSide.peepWeight + silencerDrag + stringSide.nockPointWeight + stringSide.dLoopWeight) *
        SFAX_DYNAMIC_COMPONENT_SENSITIVITY

    intermediate =
        intermediate -
        (SFAX_DYNAMIC_FRONT_MASS_REFERENCE - (arrow.pointWeight + arrow.insertWeight)) * SFAX_DYNAMIC_COMPONENT_SENSITIVITY -
        ((arrow.wrapWeight + arrow.fletchQuantity * arrow.weightEach) - SFAX_DYNAMIC_FLETCH_WEIGHT_REFERENCE) *
            SFAX_DYNAMIC_COMPONENT_SENSITIVITY -
        ((arrow.bushingPin + arrow.nockWeight) - SFAX_DYNAMIC_REAR_MASS_REFERENCE) * SFAX_DYNAMIC_COMPONENT_SENSITIVITY -
        stringEffect

    if (bow.stringMaterial === 'dacron') {
        let dacronAdjustment = SFAX_DACRON_MAX
        if (bow.drawLength <= SFAX_DACRON_END_DRAW_LENGTH) {
            dacronAdjustment =
                bow.drawLength >= SFAX_DACRON_START_DRAW_LENGTH
                    ? sfaxAbs(SFAX_DACRON_END_DRAW_LENGTH - bow.drawLength) *
                          (2 / sfaxAbs(SFAX_DACRON_DIVISOR)) +
                      SFAX_DACRON_BASE
                    : SFAX_DACRON_BASE
        }
        intermediate -= dacronAdjustment
    }

    return round3((SFAX_DYNAMIC_AMO_TEST_LENGTH / intermediate) * (SFAX_DYNAMIC_AMO_TEST_LENGTH / arrow.shaftLength) + getShaftCategoryConstant(arrow.shaftUseCategory))
}

// Modelo non-compound anclado a la carta Easton Hunting 2023 (doc 301055-A,
// columnas RECURVE/LONGBOW). Sustituye a la antigua variante pseudo-SFAX, que
// dependía de un IBO que los recurvos no tienen y producía deflexiones sin
// sentido (~1.0 para un recurvo de 40 lb). Ajuste log-lineal sobre las celdas
// de la carta; todos los ajustes están en libras equivalentes de carta.
function calculateNonCompoundTargetSpine(
    archeryType: ArcheryType,
    bow: {
        drawWeight: number
        drawLength: number
    },
    arrow: {
        shaftLength: number
        pointWeight: number
        insertWeight: number
    },
    stringMaterial: StringWeights['stringMaterial'],
): number {
    const pointAdjustment =
        ((arrow.pointWeight - RECURVE_REFERENCE_POINT_WEIGHT) / 25) * RECURVE_POINT_LB_PER_25GR
    const insertAdjustment =
        arrow.insertWeight > RECURVE_INSERT_FREE_ALLOWANCE_GR
            ? ((arrow.insertWeight - RECURVE_INSERT_FREE_ALLOWANCE_GR) / 25) * RECURVE_POINT_LB_PER_25GR
            : 0
    const lengthAdjustment = (arrow.shaftLength - RECURVE_REFERENCE_ARROW_LENGTH) * RECURVE_LENGTH_LB_PER_INCH
    const drawLengthAdjustment =
        bow.drawLength > 0
            ? (bow.drawLength - RECURVE_REFERENCE_DRAW_LENGTH) * RECURVE_DRAW_LENGTH_LB_PER_INCH
            : 0
    const stringAdjustment =
        stringMaterial === 'fastflight'
            ? RECURVE_FASTFLIGHT_LB
            : stringMaterial === 'unknown'
              ? RECURVE_UNKNOWN_STRING_LB
              : 0
    const traditionalAdjustment = archeryType === ARCHERY_TYPE.TRADITIONAL ? TRADITIONAL_LONGBOW_LB_OFFSET : 0

    const effectiveLb = clamp(
        bow.drawWeight +
            pointAdjustment +
            insertAdjustment +
            lengthAdjustment +
            drawLengthAdjustment +
            stringAdjustment +
            traditionalAdjustment,
        RECURVE_MIN_EFFECTIVE_LB,
        RECURVE_MAX_EFFECTIVE_LB,
    )

    return round3(RECURVE_SPINE_BASE * Math.exp(-RECURVE_SPINE_SLOPE * effectiveLb))
}

function calibrateTargetSpineFromChronograph(targetSpine: number, estimatedFPS: number, measuredFPS: number): number {
    if (!isFinite(targetSpine) || !isFinite(estimatedFPS) || !isFinite(measuredFPS) || estimatedFPS <= 0 || measuredFPS <= 0) {
        return targetSpine
    }
    const speedRatio = clamp(measuredFPS / estimatedFPS, SFAX_CHRONOGRAPH_MIN_RATIO, SFAX_CHRONOGRAPH_MAX_RATIO)
    return round3(targetSpine / speedRatio)
}

function calculateFOC(
    shaftLength: number,
    pointWeight: number,
    insertWeight: number,
    shaftWeight: number,
    fletchWeight: number,
    fletchLength: number,
    nockWeight: number,
    wrapWeight: number,
    bushingPin: number,
    insertType?: InsertType,
): number {
    const totalWeight = shaftWeight + pointWeight + insertWeight + fletchWeight + nockWeight + wrapWeight + bushingPin
    if (totalWeight <= 0 || shaftLength <= 0) return 0

    const totalLength = shaftLength + SFAX_FOC_NOCK_OVERHANG
    const midpoint = totalLength * 0.5
    const insertDepth = getInsertDepth(insertType)
    const frontMassCG = 1 - insertDepth * SFAX_FOC_FRONT_MASS_DEPTH_MULTIPLIER

    const weightedDistanceFromFront =
        (frontMassCG * (pointWeight + insertWeight) +
            shaftLength * 0.5 * shaftWeight +
            shaftLength * (nockWeight + bushingPin) +
            ((shaftLength - fletchLength / SFAX_FOC_FLETCH_DIVISOR) - SFAX_FOC_FLETCH_BASE_OFFSET) * fletchWeight +
            (shaftLength - SFAX_FOC_WRAP_OFFSET) * wrapWeight) /
        totalWeight

    return ((midpoint - weightedDistanceFromFront) / totalLength) * 100
}

function temperatureCorrection(spine: number, temperatureF: number, shaftMaterial: string = 'carbon'): number {
    if (shaftMaterial !== 'carbon') return spine
    const tempDiff = temperatureF - TEMP_REFERENCE
    return spine * (1 + tempDiff * TEMP_SPINE_COEFFICIENT)
}

function getEdgeCaseRecommendation(drawWeight: number): string {
    if (drawWeight % 10 > 4 && drawWeight % 10 < 6) {
        return 'Considerar spine más rígido si planea aumentar potencia en el futuro'
    }
    return 'Spine recomendado para configuración actual'
}

function createEmptyResult(archeryType: ArcheryType, recommendations: string[], warnings: string[]): SpineMatchResult {
    return {
        spineRequired: null,
        spineDynamic: null,
        matchIndex: null,
        status: null,
        arrowTotalWeight: 0,
        foc: null,
        calculatedFPS: null,
        effectiveFPS: null,
        measuredFPS: null,
        usedChronographData: false,
        spineRequiredCI: null,
        spineDynamicCI: null,
        matchIndexCI: null,
        archeryType,
        recommendations,
        warnings,
    }
}

export function calculateSpineMatch(
    bow: BowSpecs,
    arrow: ArrowSpecs,
    stringWeights: StringWeights,
    temperatureF?: number,
): SpineMatchResult {
    const recommendations: string[] = []
    const warnings: string[] = []

    const drawWeight = toNumber(bow.drawWeight)
    const drawLength = toNumber(bow.drawLength)
    const iboVelocity = toNumber(bow.iboVelocity)
    const measuredChronoSpeed = toNumber(bow.measuredChronoSpeed ?? '')
    const braceHeight = toNumber(bow.braceHeight)
    const axleToAxle = toNumber(bow.axleToAxle)
    const percentLetoff = toNumber(bow.percentLetoff)
    const archeryType = getEffectiveArcheryType(bow.archeryType)
    const isCompound = archeryType === ARCHERY_TYPE.COMPOUND
    if (!bow.archeryType) {
        warnings.push('No se ha indicado el tipo de arco; se asume compound por defecto. Verifica el valor para evitar errores.')
    }

    const shaftLength = toNumber(arrow.shaftLength)
    const staticSpine = toNumber(arrow.staticSpine)
    const fletchLength = toNumber(arrow.fletchLength ?? '') || DEFAULT_FLETCH_LENGTH
    const fletchHeight = toNumber(arrow.fletchHeight ?? '') || DEFAULT_FLETCH_HEIGHT
    const shaftMaterial = arrow.shaftMaterial || 'carbon'

    const componentWeights = calculateArrowComponentWeight(arrow)

    const measuredArrowWeight = toNumber(arrow.measuredArrowTotalWeight ?? '')
    const nonShaftComponentWeight =
        componentWeights.pointWeight +
        componentWeights.insertWeight +
        componentWeights.fletchQuantity * componentWeights.weightEach +
        componentWeights.wrapWeight +
        componentWeights.nockWeight +
        componentWeights.bushingPin
    if (measuredArrowWeight > 0 && measuredArrowWeight < nonShaftComponentWeight) {
        warnings.push('El peso total medido es menor que la suma de los componentes; revisa los datos.')
    }

    const peepWeight = toNumber(stringWeights.peep)
    const dLoopWeight = toNumber(stringWeights.dLoop)
    const nockPointWeight = toNumber(stringWeights.nockPoint)
    const silencersWeight = toNumber(stringWeights.silencers)
    const silencerDfcWeight = toNumber(stringWeights.silencerDfc) // inches (position), not grains

    // El spine compound SFAX necesita un IBO; sin él el modelo degenera. Mejor
    // asumir un compound moderno típico con confianza "low" que propagar un 0.
    const iboProvided = iboVelocity > 0
    let effectiveIbo = iboVelocity
    if (isCompound && !iboProvided) {
        effectiveIbo = SFAX_DEFAULT_IBO_FALLBACK
        warnings.push(
            `Sin velocidad IBO: se asume un compound moderno de ${SFAX_DEFAULT_IBO_FALLBACK} fps. Introduce el IBO real para más precisión.`,
        )
    }

    const hasRequiredGeometry = isCompound
        ? drawWeight > 0 && shaftLength > 0 && staticSpine > 0 && drawLength > 0 && braceHeight > 0
        : drawWeight > 0 && shaftLength > 0 && staticSpine > 0 && drawLength > 0
    if (!hasRequiredGeometry) {
        const missingFields: string[] = []
        if (drawWeight <= 0) missingFields.push('peso de tiro')
        if (drawLength <= 0) missingFields.push('longitud de tiro')
        if (isCompound && braceHeight <= 0) missingFields.push('brace height')
        if (shaftLength <= 0) missingFields.push('longitud del eje')
        if (staticSpine <= 0) missingFields.push('spine estático')
        if (missingFields.length > 0) {
            recommendations.push(`Faltan datos clave para calcular el spine: ${missingFields.join(', ')}.`)
        }
        return createEmptyResult(archeryType, recommendations, warnings)
    }
    const hasAllInputs = isCompound
        ? iboProvided && axleToAxle > 0 && percentLetoff > 0 && stringWeights.releaseType.trim() !== ''
        : componentWeights.pointWeight > 0

    const powerStroke = drawLength - braceHeight
    if (componentWeights.arrowTotalWeight <= 0) {
        recommendations.push('Falta peso de flecha para calcular el resultado. Añade GPI, peso total medido o los componentes principales.')
        return createEmptyResult(archeryType, recommendations, warnings)
    }
    if (isCompound && powerStroke <= 0) {
        warnings.push('La longitud de tiro debe ser mayor que el brace height para poder calcular el disparo.')
        return createEmptyResult(archeryType, recommendations, warnings)
    }

    // Para recurvo/tradicional sin IBO no hay modelo de velocidad honesto:
    // mejor no inventar una cifra. El spine non-compound no la necesita.
    const canEstimateSpeed = isCompound || (iboProvided && braceHeight > 0 && powerStroke > 0)
    const calculatedFPS = canEstimateSpeed
        ? calculateArrowSpeed(
              {
                  archeryType,
                  iboVelocity: effectiveIbo,
                  drawWeight,
                  drawLength,
                  braceHeight,
                  axleToAxle,
                  percentLetoff,
              },
              {
                  arrowTotalWeight: componentWeights.arrowTotalWeight,
              },
              {
                  peepWeight,
                  dLoopWeight,
                  nockPointWeight,
                  silencerWeight: silencersWeight,
                  silencerDfc: silencerDfcWeight,
              },
          ).fps
        : NaN

    let spineRequiredBase = isCompound
        ? calculateCompoundTargetSpine(
              {
                  iboVelocity: effectiveIbo,
                  drawWeight,
                  drawLength,
                  braceHeight,
                  axleToAxle,
                  percentLetoff,
                  releaseType: stringWeights.releaseType,
                  stringMaterial: stringWeights.stringMaterial,
                  camLbDelta: getCamAggressivenessLbDelta(bow.camAggressiveness),
              },
              {
                  shaftLength,
                  pointWeight: componentWeights.pointWeight,
                  insertWeight: componentWeights.insertWeight,
                  fletchQuantity: componentWeights.fletchQuantity,
                  weightEach: componentWeights.weightEach,
                  fletchLength,
                  fletchHeight,
                  wrapWeight: componentWeights.wrapWeight,
                  nockWeight: componentWeights.nockWeight,
                  bushingPin: componentWeights.bushingPin,
                  shaftUseCategory: arrow.shaftUseCategory,
              },
              {
                  peepWeight,
                  dLoopWeight,
                  nockPointWeight,
                  silencerWeight: silencersWeight,
                  silencerDfc: silencerDfcWeight,
              },
          )
        : calculateNonCompoundTargetSpine(
              archeryType,
              {
                  drawWeight,
                  drawLength,
              },
              {
                  shaftLength,
                  pointWeight: componentWeights.pointWeight,
                  insertWeight: componentWeights.insertWeight,
              },
              stringWeights.stringMaterial,
          )

    if (measuredChronoSpeed > 0) {
        spineRequiredBase = calibrateTargetSpineFromChronograph(spineRequiredBase, calculatedFPS, measuredChronoSpeed)
    }

    const effectiveFPS = measuredChronoSpeed > 0 ? measuredChronoSpeed : calculatedFPS

    const foc = calculateFOC(
        shaftLength,
        componentWeights.pointWeight,
        componentWeights.insertWeight,
        componentWeights.shaftWeight,
        componentWeights.fletchQuantity * componentWeights.weightEach,
        fletchLength,
        componentWeights.nockWeight,
        componentWeights.wrapWeight,
        componentWeights.bushingPin,
        arrow.insertType,
    )

    let spineDynamic = staticSpine
    if (temperatureF !== undefined) {
        spineDynamic = temperatureCorrection(spineDynamic, temperatureF, shaftMaterial)
    }

    const matchIndex = spineRequiredBase > 0 ? spineDynamic / spineRequiredBase : NaN
    let status: SpineMatchStatus | null = null
    if (isFinite(matchIndex)) {
        if (matchIndex > MATCH_GOOD_MAX) {
            status = 'weak'
            recommendations.push('Considera una flecha con spine más rígido (número más bajo)')
        } else if (matchIndex < MATCH_GOOD_MIN) {
            status = 'stiff'
            recommendations.push('Considera una flecha con spine más flexible (número más alto)')
        } else {
            status = 'good'
        }
    }

    const grainsPerPound = componentWeights.arrowTotalWeight / drawWeight
    if (isFinite(grainsPerPound)) {
        if (grainsPerPound < GPP_MIN_SAFE) {
            warnings.push('¡PELIGRO! Flecha muy ligera - puede dañar el arco o romperse durante el disparo')
        } else if (grainsPerPound < GPP_MIN_RECOMMENDED) {
            warnings.push('Flecha ligera - considere aumentar el peso para mayor seguridad del arco')
        }
    }

    if (isFinite(matchIndex)) {
        if (matchIndex > MATCH_EXTREME_WEAK) {
            warnings.push('¡PELIGRO! Flecha demasiado flexible - riesgo de fractura y daño al arco')
        } else if (matchIndex < MATCH_EXTREME_STIFF) {
            warnings.push('Flecha excesivamente rígida - puede causar vuelo errático y golpes en el arco')
        }
    }

    // Los umbrales de velocidad están calibrados para compound; un recurvo a
    // 180 fps es perfectamente normal y no debe generar ruido.
    if (isCompound && isFinite(effectiveFPS)) {
        if (effectiveFPS > VELOCITY_MAX_SAFE) {
            warnings.push('Velocidad extrema - asegúrese de que su equipo pueda manejar estas fuerzas')
        } else if (effectiveFPS < VELOCITY_MIN_TARGET) {
            recommendations.push('La velocidad es baja. Considera reducir el peso de la flecha o optimizar la eficiencia del arco.')
        } else if (effectiveFPS > VELOCITY_OPTIMAL_MAX) {
            recommendations.push('La velocidad es alta. Asegúrate de que tu equipo pueda manejar estas fuerzas.')
        }
    }

    if (!isCompound) {
        if (Math.abs(drawLength - RECURVE_REFERENCE_DRAW_LENGTH) > 0.5) {
            recommendations.push(
                'El peso del arco se interpreta como el marcado a 28" y se ajusta ~2.5 lb por pulgada de apertura real. Si ya mediste el peso en tu apertura, indica 28 como apertura.',
            )
        }
        if (archeryType === ARCHERY_TYPE.TRADITIONAL) {
            warnings.push(
                'Modelo tradicional/longbow con confianza media (mapeo impreso de la carta Easton). Verifica con bare shaft tuning.',
            )
        }
    }

    if (isFinite(grainsPerPound)) {
        if (grainsPerPound < GPP_MIN_RECOMMENDED) {
            recommendations.push('La flecha es muy ligera para la potencia. Considera aumentar el peso para mejor eficiencia.')
        } else if (grainsPerPound > GPP_MAX_RECOMMENDED) {
            recommendations.push('La flecha es muy pesada para la potencia. Considera reducir el peso para mejor velocidad.')
        }
    }

    if (foc > 0) {
        if (foc < FOC_MIN_RECOMMENDED) {
            recommendations.push(`FOC bajo (<${FOC_MIN_RECOMMENDED}%). La flecha puede ser inestable a largas distancias. Aumenta el peso en punta.`)
        } else if (foc > FOC_MAX_RECOMMENDED) {
            recommendations.push(`FOC alto (>${FOC_MAX_RECOMMENDED}%). Bueno para caza/penetración, pero la flecha caerá más rápido.`)
        }
    }

    if (temperatureF !== undefined && Math.abs(temperatureF - TEMP_REFERENCE) > 20) {
        const direction = temperatureF > TEMP_REFERENCE ? 'más' : 'menos'
        recommendations.push(`Temperatura ${direction} flexible. Considera ajustar el spine ${temperatureF > TEMP_REFERENCE ? 'más rígido' : 'más flexible'}.`)
    }

    const edgeCaseRecommendation = getEdgeCaseRecommendation(drawWeight)
    if (edgeCaseRecommendation !== 'Spine recomendado para configuración actual' && status !== 'weak') {
        recommendations.push(edgeCaseRecommendation)
    }

    const hasPreciseMeasurements =
        (toNumber(arrow.shaftGpi) > 0 || toNumber(arrow.measuredArrowTotalWeight ?? '') > 0) &&
        componentWeights.pointWeight > 0 &&
        fletchLength > 0 &&
        fletchHeight > 0

    const confidence = calculateConfidenceLevel(
        hasAllInputs,
        temperatureF !== undefined,
        hasPreciseMeasurements,
        stringWeights.stringMaterial !== 'unknown',
        measuredChronoSpeed > 0,
    )

    const spineRequiredCI =
        isFinite(spineRequiredBase) && spineRequiredBase > 0
            ? createConfidenceInterval(spineRequiredBase, CI_REQUIRED_UNCERTAINTY[confidence], confidence)
            : null
    const spineDynamicCI =
        isFinite(spineDynamic) && spineDynamic > 0
            ? createConfidenceInterval(spineDynamic, CI_DYNAMIC_UNCERTAINTY[confidence], confidence)
            : null
    const matchIndexCI =
        spineRequiredCI && spineDynamicCI && spineRequiredCI.lower > 0
            ? {
                  value: spineDynamicCI.value / spineRequiredCI.value,
                  lower: spineDynamicCI.lower / spineRequiredCI.upper,
                  upper: spineDynamicCI.upper / spineRequiredCI.lower,
                  confidence,
              }
            : null

    return {
        spineRequired: isFinite(spineRequiredBase) ? spineRequiredBase : null,
        spineDynamic: isFinite(spineDynamic) ? spineDynamic : null,
        matchIndex: isFinite(matchIndex) ? matchIndex : null,
        status,
        arrowTotalWeight: componentWeights.arrowTotalWeight,
        foc: isFinite(foc) ? foc : null,
        calculatedFPS: isFinite(calculatedFPS) ? calculatedFPS : null,
        effectiveFPS: isFinite(effectiveFPS) ? effectiveFPS : null,
        measuredFPS: measuredChronoSpeed > 0 ? measuredChronoSpeed : null,
        usedChronographData: measuredChronoSpeed > 0,
        spineRequiredCI,
        spineDynamicCI,
        matchIndexCI,
        temperature: temperatureF,
        archeryType,
        recommendations,
        warnings,
    }
}
