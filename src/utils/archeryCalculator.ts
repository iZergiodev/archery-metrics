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
const DEFAULT_FLETCH_OFFSET = 0
const SFAX_DRAW_WEIGHT_REFERENCE = 70
const SFAX_DRAW_LENGTH_REFERENCE = 30
const SFAX_BRACE_HEIGHT_REFERENCE = 7
const SFAX_ARROW_WEIGHT_REFERENCE = 350
const SFAX_ARROW_WEIGHT_CLASS_BASE = 300
const SFAX_ARROW_WEIGHT_CLASS_STEP = 10
const SFAX_PERCENT_REFERENCE = 100
const SFAX_HOLDING_PERCENT_REFERENCE = 65
const SFAX_SPEED_ADJUST_DRAW_WEIGHT = 0.325
const SFAX_SPEED_ADJUST_BRACE_HEIGHT = 10.2
const SFAX_SPEED_COMPOUND_BASE_OFFSET = 325
const SFAX_SPEED_NON_COMPOUND_BASE_OFFSET = 220
const SFAX_SPEED_COMPOUND_BASE_EFFICIENCY = 82
const SFAX_SPEED_NON_COMPOUND_BASE_EFFICIENCY = 76
const SFAX_SPEED_EFFICIENCY_DIVISOR = 5.35
const SFAX_SPEED_EFFICIENCY_SCALE = 1.5
const SFAX_SPEED_DECAY_LOW = 0.55
const SFAX_SPEED_DECAY_HIGH = 0.45
const SFAX_SPEED_DEFAULT_DRAW_WEIGHT_FACTOR = 2
const SFAX_SPEED_DEFAULT_DRAW_LENGTH_FACTOR = 10.2
const SFAX_SPEED_DRAW_WEIGHT_MICRO_FACTOR = 0.01
const SFAX_SPEED_DRAW_LENGTH_MICRO_FACTOR = 0.03175
const SFAX_SPEED_WEIGHT_CORRECTION_OFFSET = 0.04
const SFAX_SPEED_WEIGHT_CORRECTION_SCALE = 1.05
const SFAX_SPEED_DRAG_MULTIPLIER = 0.33
const SFAX_SPEED_LOW_IBO_THRESHOLD = 200
const SFAX_DYNAMIC_DRAW_START = -70
const SFAX_DYNAMIC_DRAW_END = 110
const SFAX_DYNAMIC_DRAW_DELTA_NON_COMPOUND = 22
const SFAX_DYNAMIC_DRAW_DELTA_COMPOUND = 15
const SFAX_DYNAMIC_A2A_START = 24
const SFAX_DYNAMIC_A2A_END = 45
const SFAX_DYNAMIC_A2A_DELTA = 2
const SFAX_DYNAMIC_FINGER_START = 10
const SFAX_DYNAMIC_FINGER_END = 60
const SFAX_DYNAMIC_FINGER_BASE = 1.25
const SFAX_DYNAMIC_FINGER_DELTA = 2.5
const SFAX_DYNAMIC_INTERMEDIATE_REFERENCE = 50
const SFAX_DYNAMIC_LENGTH_MULTIPLIER = 2.75
const SFAX_DYNAMIC_LENGTH_DIVISOR = 80
const SFAX_DYNAMIC_LENGTH_BASE = 20.75
const SFAX_DYNAMIC_DEFAULT_LENGTH_FALLBACK = 20
const SFAX_DYNAMIC_COMPONENT_SENSITIVITY = 0.12
const SFAX_DYNAMIC_FRONT_MASS_REFERENCE = 75
const SFAX_DYNAMIC_FLETCH_WEIGHT_REFERENCE = 30
const SFAX_DYNAMIC_REAR_MASS_REFERENCE = 12
const SFAX_DYNAMIC_MIN_INTERMEDIATE = 15
const SFAX_DYNAMIC_AMO_TEST_LENGTH = 28
const SFAX_DYNAMIC_RELEASE_UNKNOWN = 0.25
const SFAX_DYNAMIC_RELEASE_POST = 1
const SFAX_DYNAMIC_RELEASE_ROPE = 1.75
const SFAX_DYNAMIC_RELEASE_FINGER = 5
const SFAX_DACRON_BASE = 3
const SFAX_DACRON_MAX = 5
const SFAX_DACRON_START_DRAW_LENGTH = 14
const SFAX_DACRON_END_DRAW_LENGTH = 35
const SFAX_DACRON_DIVISOR = 21
const SFAX_PI = Math.PI
const SFAX_ENERGY_FLETCH_DRAG_COEFFICIENT = 0.65
const SFAX_ENERGY_FLETCH_DRAG_FACTOR = 15.25
const SFAX_ENERGY_FLETCH_OFFSET_BASE = 2.34
const SFAX_ENERGY_SCALE = 1.234
const SFAX_ENERGY_LETOFF_FACTOR = 9.5
const SFAX_ENERGY_SHAFT_AERO_FACTOR = 0.000000385
const SFAX_ENERGY_SHAFT_LENGTH_FACTOR = 23.45
const SFAX_DEFAULT_SHAFT_VELOCITY_FACTOR = 0.000015
const SFAX_DEFAULT_CAM_EFFICIENCY_FACTOR = 0.00000104

const toNumber = (value: string | undefined) => (value == null || value.trim() === '' ? 0 : Number(value.replace(',', '.')))
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

function getVelocityShaftFactor(category: ShaftUseCategory | undefined): number {
    switch (category) {
        case 'hunting':
            return 0.000018
        case 'target':
            return 0.000021
        default:
            return SFAX_DEFAULT_SHAFT_VELOCITY_FACTOR
    }
}

function getCamEfficiencyFactor(camAggressiveness: string | undefined): number {
    const normalized = (camAggressiveness ?? '').trim().toLowerCase()
    if (normalized === 'soft') return SFAX_DEFAULT_CAM_EFFICIENCY_FACTOR * 0.9
    if (normalized === 'hard') return SFAX_DEFAULT_CAM_EFFICIENCY_FACTOR * 1.1
    return SFAX_DEFAULT_CAM_EFFICIENCY_FACTOR
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

function calculateHoldingWeight(drawWeight: number, percentLetoff: number): number {
    return ((SFAX_PERCENT_REFERENCE - percentLetoff) / SFAX_PERCENT_REFERENCE) * drawWeight
}

function sfaxSignedCurve(value: number, start: number, end: number, base: number, delta: number): number {
    const midpoint = (end - start) * 0.5 + start
    if (end < value) return -(base + delta)
    if (value < start) return base
    const scale = delta / sfaxAbs(end - start)
    const sign = midpoint <= value ? 1 : -1
    return sfaxAbs(midpoint - value) * scale * sign
}

function sfaxPositiveCurve(value: number, start: number, end: number, base: number, delta: number): number {
    if (end < value) return base + delta
    if (value < start) return base
    return sfaxAbs(end - value) * (delta / sfaxAbs(end - start)) + base
}

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
        weightCorrectionFactor = 0.2
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

function calculateStringOffsetEffect(axleToAxle: number, nockPeepWeight: number, fletchOffset: number): number {
    const halfA2A = axleToAxle * 0.5
    if (halfA2A === 0) return 0
    return (1 - (halfA2A - nockPeepWeight) / halfA2A) * fletchOffset
}

function calculateVelocityDragBundle(
    axleToAxle: number,
    nockPeepWeight: number,
    fletchOffset: number,
    stringAccessoryWeight: number,
    fletchHeight: number,
    fletchLength: number,
): number {
    return calculateStringOffsetEffect(axleToAxle, nockPeepWeight, fletchOffset) + stringAccessoryWeight + fletchHeight + fletchLength
}

function calculateSfaxStoredDrag(
    shaftUseCategory: ShaftUseCategory | undefined,
    camAggressiveness: string | undefined,
    pointHoldingWeight: number,
    shaftLength: number,
    fletchQuantity: number,
    fletchLength: number,
    fletchHeight: number,
    fletchOffset: number,
): number {
    const shaftTypeFactor = getVelocityShaftFactor(shaftUseCategory)
    const camTypeFactor = getCamEfficiencyFactor(camAggressiveness)
    return (
        fletchLength *
            fletchQuantity *
            fletchHeight *
            SFAX_ENERGY_FLETCH_DRAG_COEFFICIENT *
            camTypeFactor *
            SFAX_ENERGY_FLETCH_DRAG_FACTOR *
            (fletchOffset + SFAX_ENERGY_FLETCH_OFFSET_BASE) *
            SFAX_ENERGY_SCALE +
        pointHoldingWeight * pointHoldingWeight * shaftTypeFactor * SFAX_ENERGY_LETOFF_FACTOR +
        SFAX_PI * 2 * pointHoldingWeight * 0.5 * shaftLength * SFAX_ENERGY_SHAFT_AERO_FACTOR * SFAX_ENERGY_SHAFT_LENGTH_FACTOR
    )
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
        camAggressiveness?: string
    },
    arrow: {
        arrowTotalWeight: number
        shaftLength: number
        fletchQuantity: number
        fletchLength: number
        fletchHeight: number
        fletchOffset: number
        shaftUseCategory?: ShaftUseCategory
    },
    stringSide: {
        stringAccessoryWeight: number
        nockPeepWeight: number
    },
): { fps: number; model: VelocityModel; storedDrag: number } {
    const holdingWeight = calculateHoldingWeight(bow.drawWeight, bow.percentLetoff)
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
        stringSide.nockPeepWeight,
        arrow.fletchOffset,
        stringSide.stringAccessoryWeight,
        arrow.fletchHeight,
        arrow.fletchLength,
    )
    const fps = baseVelocity + weightCorrection - dragBundle * SFAX_SPEED_DRAG_MULTIPLIER * model.totalEfficiency
    const storedDrag = calculateSfaxStoredDrag(
        arrow.shaftUseCategory,
        bow.camAggressiveness,
        holdingWeight,
        arrow.shaftLength,
        arrow.fletchQuantity,
        arrow.fletchLength,
        arrow.fletchHeight,
        arrow.fletchOffset,
    )
    return { fps, model, storedDrag }
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
        stringAccessoryWeight: number
        nockPeepWeight: number
        fletchOffset: number
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
    const velocityRatio = (bow.braceHeight / powerStroke) * bow.iboVelocity * (powerStroke / lengthFactor)

    if (lengthFactor === 0) {
        lengthFactor = SFAX_DYNAMIC_DEFAULT_LENGTH_FALLBACK
    }

    intermediate = (velocityRatio / sfaxAbs(SFAX_DRAW_LENGTH_REFERENCE)) * (powerStroke - lengthFactor) + intermediate

    if (bow.percentLetoff !== SFAX_HOLDING_PERCENT_REFERENCE && bow.percentLetoff !== 0) {
        intermediate += (SFAX_HOLDING_PERCENT_REFERENCE - bow.percentLetoff) * 0.2
    }

    intermediate +=
        (getReleaseMultiplier(bow.releaseType) / sfaxAbs(SFAX_DRAW_LENGTH_REFERENCE)) *
        (bow.percentLetoff - SFAX_HOLDING_PERCENT_REFERENCE)

    if (intermediate <= 0) {
        intermediate = SFAX_DYNAMIC_MIN_INTERMEDIATE
    }

    const stringEffect =
        (stringSide.stringAccessoryWeight +
            calculateStringOffsetEffect(bow.axleToAxle, stringSide.nockPeepWeight, stringSide.fletchOffset) +
            arrow.fletchHeight) *
        SFAX_DYNAMIC_COMPONENT_SENSITIVITY

    intermediate =
        intermediate -
        (SFAX_DYNAMIC_FRONT_MASS_REFERENCE - (arrow.pointWeight + arrow.insertWeight)) * SFAX_DYNAMIC_COMPONENT_SENSITIVITY -
        ((arrow.wrapWeight + arrow.fletchQuantity * arrow.weightEach) - SFAX_DYNAMIC_FLETCH_WEIGHT_REFERENCE) *
            SFAX_DYNAMIC_COMPONENT_SENSITIVITY -
        ((arrow.bushingPin + arrow.nockWeight) - SFAX_DYNAMIC_REAR_MASS_REFERENCE) * SFAX_DYNAMIC_COMPONENT_SENSITIVITY -
        arrow.fletchLength * SFAX_DYNAMIC_COMPONENT_SENSITIVITY -
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

function calculateNonCompoundTargetSpine(
    bow: {
        iboVelocity: number
        drawWeight: number
        drawLength: number
        braceHeight: number
        axleToAxle: number
        percentLetoff: number
        releaseType: string
        stringMaterial: StringWeights['stringMaterial']
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
        stringAccessoryWeight: number
        nockPeepWeight: number
        fletchOffset: number
    },
): number {
    let intermediate =
        (bow.iboVelocity / 290) *
        (sfaxSignedCurve(bow.drawWeight, SFAX_DYNAMIC_DRAW_START, SFAX_DYNAMIC_DRAW_END, 0, SFAX_DYNAMIC_DRAW_DELTA_NON_COMPOUND) +
            bow.drawWeight)

    let nonCompoundCurveBase = SFAX_DACRON_BASE
    if (intermediate <= SFAX_HOLDING_PERCENT_REFERENCE) {
        nonCompoundCurveBase =
            intermediate >= 25
                ? (SFAX_DACRON_BASE / sfaxAbs(SFAX_DYNAMIC_A2A_END - SFAX_DYNAMIC_FINGER_START)) *
                  sfaxAbs(SFAX_HOLDING_PERCENT_REFERENCE - intermediate)
                : 0
    }

    intermediate += nonCompoundCurveBase * 0.15

    const powerStroke = bow.drawLength - bow.braceHeight
    let lengthFactor =
        (SFAX_DYNAMIC_LENGTH_MULTIPLIER / sfaxAbs(SFAX_DYNAMIC_LENGTH_DIVISOR)) *
            (intermediate - SFAX_DYNAMIC_INTERMEDIATE_REFERENCE) +
        SFAX_DYNAMIC_LENGTH_BASE
    const velocityRatio = (bow.braceHeight / powerStroke) * SFAX_SPEED_LOW_IBO_THRESHOLD * (powerStroke / lengthFactor)

    if (lengthFactor === 0) {
        lengthFactor = SFAX_DYNAMIC_DEFAULT_LENGTH_FALLBACK
    }

    intermediate = (velocityRatio / sfaxAbs(SFAX_DRAW_LENGTH_REFERENCE)) * (powerStroke - lengthFactor) + intermediate

    if (bow.releaseType.toLowerCase().includes('finger') || bow.releaseType.toLowerCase().includes('manual')) {
        intermediate =
            sfaxPositiveCurve(
                bow.drawWeight,
                SFAX_DYNAMIC_FINGER_START,
                SFAX_DYNAMIC_FINGER_END,
                SFAX_DYNAMIC_FINGER_BASE,
                SFAX_DYNAMIC_FINGER_DELTA,
            ) * 0.05 +
            intermediate
    }

    if (intermediate <= 0) {
        intermediate = SFAX_DYNAMIC_MIN_INTERMEDIATE
    }

    const stringEffect =
        (stringSide.stringAccessoryWeight +
            calculateStringOffsetEffect(bow.axleToAxle, stringSide.nockPeepWeight, stringSide.fletchOffset) +
            arrow.fletchHeight) *
        SFAX_DYNAMIC_COMPONENT_SENSITIVITY

    intermediate =
        intermediate -
        (SFAX_DYNAMIC_FRONT_MASS_REFERENCE - (arrow.pointWeight + arrow.insertWeight)) * SFAX_DYNAMIC_COMPONENT_SENSITIVITY -
        ((arrow.wrapWeight + arrow.fletchQuantity * arrow.weightEach) - SFAX_DYNAMIC_FLETCH_WEIGHT_REFERENCE) *
            SFAX_DYNAMIC_COMPONENT_SENSITIVITY -
        ((arrow.bushingPin + arrow.nockWeight) - SFAX_DYNAMIC_REAR_MASS_REFERENCE) * SFAX_DYNAMIC_COMPONENT_SENSITIVITY -
        arrow.fletchLength * SFAX_DYNAMIC_COMPONENT_SENSITIVITY -
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

    return ((midpoint - weightedDistanceFromFront) / totalLength) * SFAX_PERCENT_REFERENCE
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

    const shaftLength = toNumber(arrow.shaftLength)
    const staticSpine = toNumber(arrow.staticSpine)
    const fletchLength = toNumber(arrow.fletchLength ?? '') || DEFAULT_FLETCH_LENGTH
    const fletchHeight = toNumber(arrow.fletchHeight ?? '') || DEFAULT_FLETCH_HEIGHT
    const fletchOffset = toNumber(arrow.fletchOffset ?? '') || DEFAULT_FLETCH_OFFSET
    const shaftMaterial = arrow.shaftMaterial || 'carbon'

    const componentWeights = calculateArrowComponentWeight(arrow)

    const peepWeight = toNumber(stringWeights.peep)
    const dLoopWeight = toNumber(stringWeights.dLoop)
    const nockPointWeight = toNumber(stringWeights.nockPoint)
    const silencersWeight = toNumber(stringWeights.silencers)
    const silencerDfcWeight = toNumber(stringWeights.silencerDfc)
    const stringAccessoryWeight = peepWeight + dLoopWeight + nockPointWeight + silencersWeight + silencerDfcWeight
    const nockPeepWeight = peepWeight + nockPointWeight

    const hasAllInputs = drawWeight > 0 && shaftLength > 0 && staticSpine > 0 && drawLength > 0 && braceHeight > 0
    if (!hasAllInputs) {
        const missingFields: string[] = []
        if (drawWeight <= 0) missingFields.push('peso de tiro')
        if (drawLength <= 0) missingFields.push('longitud de tiro')
        if (braceHeight <= 0) missingFields.push('brace height')
        if (shaftLength <= 0) missingFields.push('longitud del eje')
        if (staticSpine <= 0) missingFields.push('spine estático')
        if (missingFields.length > 0) {
            recommendations.push(`Faltan datos clave para calcular el spine: ${missingFields.join(', ')}.`)
        }
        return createEmptyResult(archeryType, recommendations, warnings)
    }

    const powerStroke = drawLength - braceHeight
    if (componentWeights.arrowTotalWeight <= 0) {
        recommendations.push('Falta peso de flecha para calcular el resultado. Añade GPI, peso total medido o los componentes principales.')
        return createEmptyResult(archeryType, recommendations, warnings)
    }
    if (powerStroke <= 0) {
        warnings.push('La longitud de tiro debe ser mayor que el brace height para poder calcular el disparo.')
        return createEmptyResult(archeryType, recommendations, warnings)
    }

    const speedResult = calculateArrowSpeed(
        {
            archeryType,
            iboVelocity,
            drawWeight,
            drawLength,
            braceHeight,
            axleToAxle,
            percentLetoff,
            camAggressiveness: bow.camAggressiveness,
        },
        {
            arrowTotalWeight: componentWeights.arrowTotalWeight,
            shaftLength,
            fletchQuantity: componentWeights.fletchQuantity,
            fletchLength,
            fletchHeight,
            fletchOffset,
            shaftUseCategory: arrow.shaftUseCategory,
        },
        {
            stringAccessoryWeight,
            nockPeepWeight,
        },
    )

    const calculatedFPS = speedResult.fps
    let spineRequiredBase =
        archeryType === ARCHERY_TYPE.COMPOUND
            ? calculateCompoundTargetSpine(
                  {
                      iboVelocity,
                      drawWeight,
                      drawLength,
                      braceHeight,
                      axleToAxle,
                      percentLetoff,
                      releaseType: stringWeights.releaseType,
                      stringMaterial: stringWeights.stringMaterial,
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
                      stringAccessoryWeight,
                      nockPeepWeight,
                      fletchOffset,
                  },
              )
            : calculateNonCompoundTargetSpine(
                  {
                      iboVelocity,
                      drawWeight,
                      drawLength,
                      braceHeight,
                      axleToAxle,
                      percentLetoff,
                      releaseType: stringWeights.releaseType,
                      stringMaterial: stringWeights.stringMaterial,
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
                      stringAccessoryWeight,
                      nockPeepWeight,
                      fletchOffset,
                  },
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

    if (isFinite(effectiveFPS)) {
        if (effectiveFPS > VELOCITY_MAX_SAFE) {
            warnings.push('Velocidad extrema - asegúrese de que su equipo pueda manejar estas fuerzas')
        } else if (effectiveFPS < VELOCITY_MIN_TARGET) {
            recommendations.push('La velocidad es baja. Considera reducir el peso de la flecha o optimizar la eficiencia del arco.')
        } else if (effectiveFPS > VELOCITY_OPTIMAL_MAX) {
            recommendations.push('La velocidad es alta. Asegúrate de que tu equipo pueda manejar estas fuerzas.')
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
        spineRequiredCI: isFinite(spineRequiredBase) ? createConfidenceInterval(spineRequiredBase, 0.03, confidence) : null,
        spineDynamicCI: isFinite(spineDynamic) ? createConfidenceInterval(spineDynamic, 0.02, confidence) : null,
        matchIndexCI: isFinite(matchIndex) ? createConfidenceInterval(matchIndex, 0.06, confidence) : null,
        temperature: temperatureF,
        archeryType,
        recommendations,
        warnings,
    }
}
