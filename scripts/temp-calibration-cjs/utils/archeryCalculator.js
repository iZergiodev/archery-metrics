"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSpineMatch = calculateSpineMatch;
const constants_1 = require("../constants");
const DEFAULT_FLETCH_LENGTH = 2;
const DEFAULT_FLETCH_HEIGHT = 0.5;
const DEFAULT_FLETCH_OFFSET = 0;
const SFAX_SPEED_WEIGHT_CORRECTION_OFFSET = 0.04;
const SFAX_SPEED_WEIGHT_CORRECTION_SCALE = 1.05;
const SFAX_SPEED_DRAG_MULTIPLIER = 0.33;
const SFAX_DYNAMIC_DRAW_DELTA_NON_COMPOUND = constants_1.SFAX_DYNAMIC_DRAW_CURVE_AMPLITUDE_NON_COMPOUND;
const SFAX_PI = Math.PI;
const SFAX_ENERGY_FLETCH_DRAG_COEFFICIENT = 0.65;
const SFAX_ENERGY_FLETCH_DRAG_FACTOR = 15.25;
const SFAX_ENERGY_FLETCH_OFFSET_BASE = 2.34;
const SFAX_ENERGY_SCALE = 1.234;
const SFAX_ENERGY_LETOFF_FACTOR = 9.5;
const SFAX_ENERGY_SHAFT_AERO_FACTOR = 0.000000385;
const SFAX_ENERGY_SHAFT_LENGTH_FACTOR = 23.45;
const SFAX_DEFAULT_SHAFT_VELOCITY_FACTOR = 0.000015;
const toNumber = (value) => (value == null || value.trim() === '' ? 0 : Number(value.replace(',', '.')));
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const round3 = (value) => Number(value.toFixed(3));
const sfaxAbs = (value) => Math.abs(value);
function createConfidenceInterval(value, uncertaintyPercent, confidence) {
    const uncertainty = value * uncertaintyPercent;
    return { value, lower: value - uncertainty, upper: value + uncertainty, confidence };
}
function calculateConfidenceLevel(hasAllInputs, hasTemperature, hasPreciseMeasurements, hasKnownStringMaterial, hasMeasuredChronograph) {
    if (hasAllInputs && hasPreciseMeasurements && hasKnownStringMaterial && (hasTemperature || hasMeasuredChronograph)) {
        return 'high';
    }
    if (hasAllInputs)
        return 'medium';
    return 'low';
}
function getEffectiveArcheryType(type) {
    return type || constants_1.ARCHERY_TYPE.COMPOUND;
}
function getInsertDepth(insertType) {
    return constants_1.SFAX_INSERT_DEPTHS[insertType ?? 'default'] ?? constants_1.SFAX_INSERT_DEPTHS.default;
}
function getShaftCategoryConstant(category) {
    switch (category) {
        case 'hunting':
            return constants_1.SFAX_SHAFT_CATEGORY_HUNTING;
        case 'target':
            return constants_1.SFAX_SHAFT_CATEGORY_TARGET;
        default:
            return constants_1.SFAX_SHAFT_CATEGORY_BASE;
    }
}
function getVelocityShaftFactor(category) {
    switch (category) {
        case 'hunting':
            return 0.000018;
        case 'target':
            return 0.000021;
        default:
            return SFAX_DEFAULT_SHAFT_VELOCITY_FACTOR;
    }
}
function getCamEfficiencyFactor(camAggressiveness) {
    const normalized = (camAggressiveness ?? '').trim().toLowerCase();
    if (normalized === 'soft')
        return constants_1.SFAX_DEFAULT_CAM_EFFICIENCY_FACTOR * 0.9;
    if (normalized === 'hard')
        return constants_1.SFAX_DEFAULT_CAM_EFFICIENCY_FACTOR * 1.1;
    return constants_1.SFAX_DEFAULT_CAM_EFFICIENCY_FACTOR;
}
function getReleaseMultiplier(releaseType) {
    const normalized = releaseType.trim().toLowerCase();
    if (normalized.includes('finger') || normalized.includes('manual'))
        return constants_1.SFAX_RELEASE_FACTOR_FINGER;
    if (normalized.includes('rope'))
        return constants_1.SFAX_RELEASE_FACTOR_ROPE;
    if (normalized.includes('post') || normalized.includes('caliper') || normalized.includes('pre') || normalized.includes('release')) {
        return constants_1.SFAX_RELEASE_FACTOR_POST;
    }
    return constants_1.SFAX_RELEASE_FACTOR_UNKNOWN;
}
function calculateArrowComponentWeight(arrow) {
    const shaftLength = toNumber(arrow.shaftLength);
    const shaftGpi = toNumber(arrow.shaftGpi);
    const measuredArrowTotalWeight = toNumber(arrow.measuredArrowTotalWeight ?? '');
    const pointWeight = toNumber(arrow.pointWeight);
    const insertWeight = toNumber(arrow.insertWeight);
    const fletchQuantity = toNumber(arrow.fletchQuantity);
    const weightEach = toNumber(arrow.weightEach);
    const wrapWeight = toNumber(arrow.wrapWeight);
    const nockWeight = toNumber(arrow.nockWeight);
    const bushingPin = toNumber(arrow.bushingPin);
    const componentWeightWithoutShaft = pointWeight + insertWeight + fletchQuantity * weightEach + wrapWeight + nockWeight + bushingPin;
    const calculatedShaftWeight = shaftLength * shaftGpi;
    const shaftWeight = measuredArrowTotalWeight > 0 ? Math.max(0, measuredArrowTotalWeight - componentWeightWithoutShaft) : calculatedShaftWeight;
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
    };
}
function calculateHoldingWeight(drawWeight, percentLetoff) {
    return ((constants_1.SFAX_REFERENCE_PERCENT - percentLetoff) / constants_1.SFAX_REFERENCE_PERCENT) * drawWeight;
}
function sfaxSignedCurve(value, start, end, base, delta) {
    const midpoint = (end - start) * 0.5 + start;
    if (end < value)
        return -(base + delta);
    if (value < start)
        return base;
    const scale = delta / sfaxAbs(end - start);
    const sign = midpoint <= value ? 1 : -1;
    return sfaxAbs(midpoint - value) * scale * sign;
}
function sfaxPositiveCurve(value, start, end, base, delta) {
    if (end < value)
        return base + delta;
    if (value < start)
        return base;
    return sfaxAbs(end - value) * (delta / sfaxAbs(end - start)) + base;
}
function calculateVelocityAdjustment(referenceBraceHeight, braceHeight, referenceLetoff, percentLetoff, drawWeight, drawLength, drawWeightFactor, drawLengthFactor) {
    const letOffAdjustment = percentLetoff === referenceLetoff || percentLetoff === 0 ? 0 : (referenceLetoff - percentLetoff) * 0.2;
    const velFromDL = (((referenceBraceHeight - braceHeight) + drawLength) - constants_1.SFAX_REFERENCE_DRAW_LENGTH) * drawLengthFactor;
    const velFromDW = (((letOffAdjustment * 0.2 * drawWeightFactor) + drawWeight) - constants_1.SFAX_REFERENCE_DRAW_WEIGHT) * drawWeightFactor;
    return velFromDL + velFromDW;
}
function buildVelocityModel(archeryType, iboVelocity, drawWeight, drawLength, braceHeight, percentLetoff, arrowTotalWeight) {
    const adjustedVelocity = iboVelocity +
        (drawWeight - constants_1.SFAX_REFERENCE_DRAW_WEIGHT) * constants_1.SFAX_VELOCITY_DRAW_WEIGHT_FPS +
        (braceHeight - constants_1.SFAX_REFERENCE_BRACE_HEIGHT) * constants_1.SFAX_VELOCITY_BRACE_HEIGHT_FPS;
    const isCompound = archeryType === constants_1.ARCHERY_TYPE.COMPOUND;
    const speedBaseOffset = isCompound ? constants_1.SFAX_VELOCITY_COMPOUND_BASE_OFFSET : constants_1.SFAX_VELOCITY_NON_COMPOUND_BASE_OFFSET;
    const baseEfficiencyOffset = isCompound ? constants_1.SFAX_VELOCITY_COMPOUND_BASE_EFFICIENCY : constants_1.SFAX_VELOCITY_NON_COMPOUND_BASE_EFFICIENCY;
    const baseEfficiency = ((adjustedVelocity - speedBaseOffset) / constants_1.SFAX_VELOCITY_DIVISOR + baseEfficiencyOffset) / constants_1.SFAX_REFERENCE_PERCENT;
    const weightClassIndex = Math.trunc((arrowTotalWeight - constants_1.SFAX_VELOCITY_WEIGHT_CLASS_START) / constants_1.SFAX_VELOCITY_WEIGHT_CLASS_SIZE);
    let scaledEfficiency = (baseEfficiency * constants_1.SFAX_VELOCITY_SCALING_FACTOR) / constants_1.SFAX_VELOCITY_WEIGHT_CLASS_SIZE;
    let cumulativeDecay = 0;
    for (let index = 0; index < weightClassIndex; index += 1) {
        if (index % 10 === 0 && index > 9) {
            scaledEfficiency *= index < 21 ? constants_1.SFAX_VELOCITY_DECAY_MID : constants_1.SFAX_VELOCITY_DECAY_HIGH;
        }
        cumulativeDecay += scaledEfficiency;
    }
    const weightDecay = cumulativeDecay / constants_1.SFAX_REFERENCE_PERCENT;
    const totalEfficiency = baseEfficiency + weightDecay;
    const drawWeightFactor = iboVelocity > constants_1.SFAX_VELOCITY_LOW_IBO_THRESHOLD
        ? baseEfficiency * adjustedVelocity * constants_1.SFAX_VELOCITY_DW_MICRO_FACTOR
        : constants_1.SFAX_VELOCITY_DEFAULT_DW_FACTOR;
    const drawLengthFactor = iboVelocity > constants_1.SFAX_VELOCITY_LOW_IBO_THRESHOLD
        ? adjustedVelocity * constants_1.SFAX_VELOCITY_DL_MICRO_FACTOR * baseEfficiency
        : constants_1.SFAX_VELOCITY_DEFAULT_DL_FACTOR;
    const speedAt350 = calculateVelocityAdjustment(braceHeight, braceHeight, percentLetoff, percentLetoff, drawWeight, drawLength, drawWeightFactor, drawLengthFactor) + iboVelocity;
    const energyLike = (Math.pow(speedAt350, 2) * constants_1.SFAX_REFERENCE_ARROW_WEIGHT) / (drawWeight * 2 * 7000);
    const adjustedEnergyLike = energyLike / ((baseEfficiency - SFAX_SPEED_WEIGHT_CORRECTION_OFFSET) + weightDecay);
    const equivalentWeight = (adjustedEnergyLike / energyLike - 1) * constants_1.SFAX_REFERENCE_ARROW_WEIGHT;
    const projectedSpeed = Math.sqrt(((1 - weightDecay * SFAX_SPEED_WEIGHT_CORRECTION_SCALE) * adjustedEnergyLike) / (equivalentWeight + arrowTotalWeight)) * Math.sqrt(drawWeight * 7000 * 2);
    let weightCorrectionFactor = 0;
    if (arrowTotalWeight < 348 || arrowTotalWeight > 352) {
        weightCorrectionFactor = Math.abs(speedAt350 - projectedSpeed) / Math.abs(arrowTotalWeight - constants_1.SFAX_REFERENCE_ARROW_WEIGHT);
    }
    if (iboVelocity <= constants_1.SFAX_VELOCITY_LOW_IBO_THRESHOLD) {
        weightCorrectionFactor = constants_1.SFAX_VELOCITY_LOW_IBO_EFFICIENCY;
    }
    return {
        adjustedVelocity,
        baseEfficiency,
        weightDecay,
        totalEfficiency,
        drawWeightFactor,
        drawLengthFactor,
        weightCorrectionFactor,
    };
}
function calculateStringOffsetEffect(axleToAxle, nockPeepWeight, fletchOffset) {
    const halfA2A = axleToAxle * 0.5;
    if (halfA2A === 0)
        return 0;
    return (1 - (halfA2A - nockPeepWeight) / halfA2A) * fletchOffset;
}
function calculateVelocityDragBundle(axleToAxle, nockPeepWeight, fletchOffset, stringAccessoryWeight, fletchHeight, fletchLength) {
    return calculateStringOffsetEffect(axleToAxle, nockPeepWeight, fletchOffset) + stringAccessoryWeight + fletchHeight + fletchLength;
}
function calculateSfaxStoredDrag(shaftUseCategory, camAggressiveness, percentLetoff, shaftLength, fletchQuantity, fletchLength, fletchHeight, fletchOffset) {
    const shaftTypeFactor = getVelocityShaftFactor(shaftUseCategory);
    const camTypeFactor = getCamEfficiencyFactor(camAggressiveness);
    return (fletchLength *
        fletchQuantity *
        fletchHeight *
        SFAX_ENERGY_FLETCH_DRAG_COEFFICIENT *
        camTypeFactor *
        SFAX_ENERGY_FLETCH_DRAG_FACTOR *
        (fletchOffset + SFAX_ENERGY_FLETCH_OFFSET_BASE) *
        SFAX_ENERGY_SCALE +
        percentLetoff * percentLetoff * shaftTypeFactor * SFAX_ENERGY_LETOFF_FACTOR +
        SFAX_PI * 2 * percentLetoff * 0.5 * shaftLength * SFAX_ENERGY_SHAFT_AERO_FACTOR * SFAX_ENERGY_SHAFT_LENGTH_FACTOR);
}
function calculateArrowSpeed(bow, arrow, stringSide) {
    const model = buildVelocityModel(bow.archeryType, bow.iboVelocity, bow.drawWeight, bow.drawLength, bow.braceHeight, bow.percentLetoff, arrow.arrowTotalWeight);
    const baseVelocity = calculateVelocityAdjustment(bow.braceHeight, bow.braceHeight, bow.percentLetoff, bow.percentLetoff, bow.drawWeight, bow.drawLength, model.drawWeightFactor, model.drawLengthFactor) + bow.iboVelocity;
    const weightCorrection = (constants_1.SFAX_REFERENCE_ARROW_WEIGHT - arrow.arrowTotalWeight) * model.weightCorrectionFactor;
    const dragBundle = calculateVelocityDragBundle(bow.axleToAxle, stringSide.nockPeepWeight, arrow.fletchOffset, stringSide.stringAccessoryWeight, arrow.fletchHeight, arrow.fletchLength);
    const fps = baseVelocity + weightCorrection - dragBundle * SFAX_SPEED_DRAG_MULTIPLIER * model.totalEfficiency;
    const storedDrag = calculateSfaxStoredDrag(arrow.shaftUseCategory, bow.camAggressiveness, bow.percentLetoff, arrow.shaftLength, arrow.fletchQuantity, arrow.fletchLength, arrow.fletchHeight, arrow.fletchOffset);
    return { fps, model, storedDrag };
}
function calculateCompoundTargetSpine(bow, arrow, stringSide) {
    let intermediate = (bow.iboVelocity / 290) *
        (sfaxSignedCurve(bow.drawWeight, constants_1.SFAX_DYNAMIC_DRAW_CURVE_START, constants_1.SFAX_DYNAMIC_DRAW_CURVE_END, 0, constants_1.SFAX_DYNAMIC_DRAW_CURVE_AMPLITUDE) +
            bow.drawWeight);
    intermediate -= sfaxSignedCurve(bow.axleToAxle, constants_1.SFAX_DYNAMIC_A2A_CURVE_START, constants_1.SFAX_DYNAMIC_A2A_CURVE_END, 0, constants_1.SFAX_DYNAMIC_A2A_CURVE_AMPLITUDE);
    const powerStroke = bow.drawLength - bow.braceHeight;
    let lengthFactor = (constants_1.SFAX_DYNAMIC_LENGTH_MULTIPLIER / sfaxAbs(constants_1.SFAX_DYNAMIC_LENGTH_DIVISOR)) *
        (intermediate - constants_1.SFAX_DYNAMIC_LENGTH_REFERENCE) +
        constants_1.SFAX_DYNAMIC_LENGTH_BASE;
    if (lengthFactor === 0) {
        lengthFactor = constants_1.SFAX_DYNAMIC_DEFAULT_LENGTH_FALLBACK;
    }
    const velocityRatio = (bow.braceHeight / powerStroke) * bow.iboVelocity * (powerStroke / lengthFactor);
    intermediate = (velocityRatio / sfaxAbs(constants_1.SFAX_REFERENCE_DRAW_LENGTH)) * (powerStroke - lengthFactor) + intermediate;
    if (bow.percentLetoff !== constants_1.SFAX_REFERENCE_HOLDING_PERCENT && bow.percentLetoff !== 0) {
        intermediate += (constants_1.SFAX_REFERENCE_HOLDING_PERCENT - bow.percentLetoff) * 0.2;
    }
    intermediate +=
        (getReleaseMultiplier(bow.releaseType) / sfaxAbs(constants_1.SFAX_REFERENCE_DRAW_LENGTH)) *
            (bow.percentLetoff - constants_1.SFAX_REFERENCE_HOLDING_PERCENT);
    if (intermediate <= 0) {
        intermediate = constants_1.SFAX_MIN_INTERMEDIATE_SPINE;
    }
    const stringEffect = (stringSide.stringAccessoryWeight +
        calculateStringOffsetEffect(bow.axleToAxle, stringSide.nockPeepWeight, stringSide.fletchOffset) +
        arrow.fletchHeight) *
        constants_1.SFAX_COMPONENT_SENSITIVITY;
    intermediate =
        intermediate -
            (constants_1.SFAX_FRONT_MASS_REFERENCE - (arrow.pointWeight + arrow.insertWeight)) * constants_1.SFAX_COMPONENT_SENSITIVITY -
            ((arrow.wrapWeight + arrow.fletchQuantity * arrow.weightEach) - constants_1.SFAX_FLETCH_WEIGHT_REFERENCE) *
                constants_1.SFAX_COMPONENT_SENSITIVITY -
            ((arrow.bushingPin + arrow.nockWeight) - constants_1.SFAX_REAR_MASS_REFERENCE) * constants_1.SFAX_COMPONENT_SENSITIVITY -
            arrow.fletchLength * constants_1.SFAX_COMPONENT_SENSITIVITY -
            stringEffect;
    if (bow.stringMaterial === 'dacron') {
        let dacronAdjustment = constants_1.SFAX_DACRON_MAX_ADJUSTMENT;
        if (bow.drawLength <= constants_1.SFAX_DACRON_DRAW_LENGTH_CEILING) {
            dacronAdjustment =
                bow.drawLength >= constants_1.SFAX_DACRON_DRAW_LENGTH_FLOOR
                    ? sfaxAbs(constants_1.SFAX_DACRON_DRAW_LENGTH_CEILING - bow.drawLength) *
                        (2 / sfaxAbs(constants_1.SFAX_DACRON_CURVE_DIVISOR)) +
                        constants_1.SFAX_DACRON_BASE_ADJUSTMENT
                    : constants_1.SFAX_DACRON_BASE_ADJUSTMENT;
        }
        intermediate -= dacronAdjustment;
    }
    return round3((constants_1.SFAX_SPINE_TEST_LENGTH / intermediate) * (constants_1.SFAX_SPINE_TEST_LENGTH / arrow.shaftLength) + getShaftCategoryConstant(arrow.shaftUseCategory));
}
function calculateNonCompoundTargetSpine(bow, arrow, stringSide) {
    let intermediate = (bow.iboVelocity / 290) *
        (sfaxSignedCurve(bow.drawWeight, constants_1.SFAX_DYNAMIC_DRAW_CURVE_START, constants_1.SFAX_DYNAMIC_DRAW_CURVE_END, 0, SFAX_DYNAMIC_DRAW_DELTA_NON_COMPOUND) +
            bow.drawWeight);
    intermediate -=
        (constants_1.SFAX_DYNAMIC_A2A_SENSITIVITY_NON_COMPOUND / constants_1.SFAX_DYNAMIC_A2A_DIVISOR_NON_COMPOUND) *
            (bow.axleToAxle - constants_1.SFAX_DYNAMIC_A2A_REF_NON_COMPOUND);
    let nonCompoundCurveBase = constants_1.SFAX_DACRON_BASE_ADJUSTMENT;
    if (intermediate <= constants_1.SFAX_REFERENCE_HOLDING_PERCENT) {
        nonCompoundCurveBase =
            intermediate >= 25
                ? (constants_1.SFAX_DACRON_BASE_ADJUSTMENT / constants_1.SFAX_DYNAMIC_NON_COMPOUND_CURVE_DIVISOR) *
                    sfaxAbs(constants_1.SFAX_REFERENCE_HOLDING_PERCENT - intermediate)
                : 0;
    }
    intermediate += nonCompoundCurveBase * 0.15;
    const powerStroke = bow.drawLength - bow.braceHeight;
    let lengthFactor = (constants_1.SFAX_DYNAMIC_LENGTH_MULTIPLIER / sfaxAbs(constants_1.SFAX_DYNAMIC_LENGTH_DIVISOR)) *
        (intermediate - constants_1.SFAX_DYNAMIC_LENGTH_REFERENCE) +
        constants_1.SFAX_DYNAMIC_LENGTH_BASE;
    if (lengthFactor === 0) {
        lengthFactor = constants_1.SFAX_DYNAMIC_DEFAULT_LENGTH_FALLBACK;
    }
    const velocityRatio = (bow.braceHeight / powerStroke) * constants_1.SFAX_VELOCITY_LOW_IBO_THRESHOLD * (powerStroke / lengthFactor);
    intermediate = (velocityRatio / sfaxAbs(constants_1.SFAX_REFERENCE_DRAW_LENGTH)) * (powerStroke - lengthFactor) + intermediate;
    if (bow.releaseType.toLowerCase().includes('finger') || bow.releaseType.toLowerCase().includes('manual')) {
        intermediate =
            sfaxPositiveCurve(bow.drawWeight, constants_1.SFAX_DYNAMIC_FINGER_START, constants_1.SFAX_DYNAMIC_FINGER_END, constants_1.SFAX_DYNAMIC_FINGER_BASE, constants_1.SFAX_DYNAMIC_FINGER_DELTA) * 0.05 +
                intermediate;
    }
    if (intermediate <= 0) {
        intermediate = constants_1.SFAX_MIN_INTERMEDIATE_SPINE;
    }
    const stringEffect = (stringSide.stringAccessoryWeight +
        calculateStringOffsetEffect(bow.axleToAxle, stringSide.nockPeepWeight, stringSide.fletchOffset) +
        arrow.fletchHeight) *
        constants_1.SFAX_COMPONENT_SENSITIVITY;
    intermediate =
        intermediate -
            (constants_1.SFAX_FRONT_MASS_REFERENCE - (arrow.pointWeight + arrow.insertWeight)) * constants_1.SFAX_COMPONENT_SENSITIVITY -
            ((arrow.wrapWeight + arrow.fletchQuantity * arrow.weightEach) - constants_1.SFAX_FLETCH_WEIGHT_REFERENCE) *
                constants_1.SFAX_COMPONENT_SENSITIVITY -
            ((arrow.bushingPin + arrow.nockWeight) - constants_1.SFAX_REAR_MASS_REFERENCE) * constants_1.SFAX_COMPONENT_SENSITIVITY -
            arrow.fletchLength * constants_1.SFAX_COMPONENT_SENSITIVITY -
            stringEffect;
    if (bow.stringMaterial === 'dacron') {
        let dacronAdjustment = constants_1.SFAX_DACRON_MAX_ADJUSTMENT;
        if (bow.drawLength <= constants_1.SFAX_DACRON_DRAW_LENGTH_CEILING) {
            dacronAdjustment =
                bow.drawLength >= constants_1.SFAX_DACRON_DRAW_LENGTH_FLOOR
                    ? sfaxAbs(constants_1.SFAX_DACRON_DRAW_LENGTH_CEILING - bow.drawLength) *
                        (2 / sfaxAbs(constants_1.SFAX_DACRON_CURVE_DIVISOR)) +
                        constants_1.SFAX_DACRON_BASE_ADJUSTMENT
                    : constants_1.SFAX_DACRON_BASE_ADJUSTMENT;
        }
        intermediate -= dacronAdjustment;
    }
    return round3((constants_1.SFAX_SPINE_TEST_LENGTH / intermediate) * (constants_1.SFAX_SPINE_TEST_LENGTH / arrow.shaftLength) + getShaftCategoryConstant(arrow.shaftUseCategory));
}
function calibrateTargetSpineFromChronograph(targetSpine, estimatedFPS, measuredFPS) {
    if (!isFinite(targetSpine) || !isFinite(estimatedFPS) || !isFinite(measuredFPS) || estimatedFPS <= 0 || measuredFPS <= 0) {
        return targetSpine;
    }
    const speedRatio = clamp(measuredFPS / estimatedFPS, constants_1.SFAX_CHRONOGRAPH_MIN_RATIO, constants_1.SFAX_CHRONOGRAPH_MAX_RATIO);
    return round3(targetSpine / speedRatio);
}
function calculateFOC(shaftLength, pointWeight, insertWeight, shaftWeight, fletchWeight, fletchLength, nockWeight, wrapWeight, bushingPin, insertType) {
    const totalWeight = shaftWeight + pointWeight + insertWeight + fletchWeight + nockWeight + wrapWeight + bushingPin;
    if (totalWeight <= 0 || shaftLength <= 0)
        return 0;
    const totalLength = shaftLength + constants_1.SFAX_FOC_NOCK_OVERHANG;
    const midpoint = totalLength * 0.5;
    const insertDepth = getInsertDepth(insertType);
    const frontMassCG = 1 - insertDepth * constants_1.SFAX_FOC_FRONT_MASS_DEPTH_MULTIPLIER;
    const weightedDistanceFromFront = (frontMassCG * (pointWeight + insertWeight) +
        shaftLength * 0.5 * shaftWeight +
        shaftLength * (nockWeight + bushingPin) +
        ((shaftLength - fletchLength / constants_1.SFAX_FOC_FLETCH_DIVISOR) - constants_1.SFAX_FOC_FLETCH_BASE_OFFSET) * fletchWeight +
        (shaftLength - constants_1.SFAX_FOC_WRAP_OFFSET) * wrapWeight) /
        totalWeight;
    return ((midpoint - weightedDistanceFromFront) / totalLength) * 100;
}
function temperatureCorrection(spine, temperatureF, shaftMaterial = 'carbon') {
    if (shaftMaterial !== 'carbon')
        return spine;
    const tempDiff = temperatureF - constants_1.TEMP_REFERENCE;
    return spine * (1 + tempDiff * constants_1.TEMP_SPINE_COEFFICIENT);
}
function getEdgeCaseRecommendation(drawWeight) {
    if (drawWeight % 10 > 4 && drawWeight % 10 < 6) {
        return 'Considerar spine más rígido si planea aumentar potencia en el futuro';
    }
    return 'Spine recomendado para configuración actual';
}
function createEmptyResult(archeryType, recommendations, warnings) {
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
    };
}
function calculateSpineMatch(bow, arrow, stringWeights, temperatureF) {
    const recommendations = [];
    const warnings = [];
    const drawWeight = toNumber(bow.drawWeight);
    const drawLength = toNumber(bow.drawLength);
    const iboVelocity = toNumber(bow.iboVelocity);
    const measuredChronoSpeed = toNumber(bow.measuredChronoSpeed ?? '');
    const braceHeight = toNumber(bow.braceHeight);
    const axleToAxle = toNumber(bow.axleToAxle);
    const percentLetoff = toNumber(bow.percentLetoff);
    const archeryType = getEffectiveArcheryType(bow.archeryType);
    const shaftLength = toNumber(arrow.shaftLength);
    const staticSpine = toNumber(arrow.staticSpine);
    const fletchLength = toNumber(arrow.fletchLength ?? '') || DEFAULT_FLETCH_LENGTH;
    const fletchHeight = toNumber(arrow.fletchHeight ?? '') || DEFAULT_FLETCH_HEIGHT;
    const fletchOffset = toNumber(arrow.fletchOffset ?? '') || DEFAULT_FLETCH_OFFSET;
    const shaftMaterial = arrow.shaftMaterial || 'carbon';
    const componentWeights = calculateArrowComponentWeight(arrow);
    const peepWeight = toNumber(stringWeights.peep);
    const dLoopWeight = toNumber(stringWeights.dLoop);
    const nockPointWeight = toNumber(stringWeights.nockPoint);
    const silencersWeight = toNumber(stringWeights.silencers);
    const silencerDfcWeight = toNumber(stringWeights.silencerDfc);
    const stringAccessoryWeight = peepWeight + dLoopWeight + nockPointWeight + silencersWeight + silencerDfcWeight;
    const nockPeepWeight = peepWeight + nockPointWeight;
    const hasAllInputs = drawWeight > 0 && shaftLength > 0 && staticSpine > 0 && drawLength > 0 && braceHeight > 0;
    if (!hasAllInputs) {
        const missingFields = [];
        if (drawWeight <= 0)
            missingFields.push('peso de tiro');
        if (drawLength <= 0)
            missingFields.push('longitud de tiro');
        if (braceHeight <= 0)
            missingFields.push('brace height');
        if (shaftLength <= 0)
            missingFields.push('longitud del eje');
        if (staticSpine <= 0)
            missingFields.push('spine estático');
        if (missingFields.length > 0) {
            recommendations.push(`Faltan datos clave para calcular el spine: ${missingFields.join(', ')}.`);
        }
        return createEmptyResult(archeryType, recommendations, warnings);
    }
    const powerStroke = drawLength - braceHeight;
    if (componentWeights.arrowTotalWeight <= 0) {
        recommendations.push('Falta peso de flecha para calcular el resultado. Añade GPI, peso total medido o los componentes principales.');
        return createEmptyResult(archeryType, recommendations, warnings);
    }
    if (powerStroke <= 0) {
        warnings.push('La longitud de tiro debe ser mayor que el brace height para poder calcular el disparo.');
        return createEmptyResult(archeryType, recommendations, warnings);
    }
    const speedResult = calculateArrowSpeed({
        archeryType,
        iboVelocity,
        drawWeight,
        drawLength,
        braceHeight,
        axleToAxle,
        percentLetoff,
        camAggressiveness: bow.camAggressiveness,
    }, {
        arrowTotalWeight: componentWeights.arrowTotalWeight,
        shaftLength,
        fletchQuantity: componentWeights.fletchQuantity,
        fletchLength,
        fletchHeight,
        fletchOffset,
        shaftUseCategory: arrow.shaftUseCategory,
    }, {
        stringAccessoryWeight,
        nockPeepWeight,
    });
    const calculatedFPS = speedResult.fps;
    let spineRequiredBase = archeryType === constants_1.ARCHERY_TYPE.COMPOUND
        ? calculateCompoundTargetSpine({
            iboVelocity,
            drawWeight,
            drawLength,
            braceHeight,
            axleToAxle,
            percentLetoff,
            releaseType: stringWeights.releaseType,
            stringMaterial: stringWeights.stringMaterial,
        }, {
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
        }, {
            stringAccessoryWeight,
            nockPeepWeight,
            fletchOffset,
        })
        : calculateNonCompoundTargetSpine({
            iboVelocity,
            drawWeight,
            drawLength,
            braceHeight,
            axleToAxle,
            percentLetoff,
            releaseType: stringWeights.releaseType,
            stringMaterial: stringWeights.stringMaterial,
        }, {
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
        }, {
            stringAccessoryWeight,
            nockPeepWeight,
            fletchOffset,
        });
    if (measuredChronoSpeed > 0) {
        spineRequiredBase = calibrateTargetSpineFromChronograph(spineRequiredBase, calculatedFPS, measuredChronoSpeed);
    }
    const effectiveFPS = measuredChronoSpeed > 0 ? measuredChronoSpeed : calculatedFPS;
    const foc = calculateFOC(shaftLength, componentWeights.pointWeight, componentWeights.insertWeight, componentWeights.shaftWeight, componentWeights.fletchQuantity * componentWeights.weightEach, fletchLength, componentWeights.nockWeight, componentWeights.wrapWeight, componentWeights.bushingPin, arrow.insertType);
    let spineDynamic = staticSpine;
    if (temperatureF !== undefined) {
        spineDynamic = temperatureCorrection(spineDynamic, temperatureF, shaftMaterial);
    }
    const matchIndex = spineRequiredBase > 0 ? spineDynamic / spineRequiredBase : NaN;
    let status = null;
    if (isFinite(matchIndex)) {
        if (matchIndex > constants_1.MATCH_GOOD_MAX) {
            status = 'weak';
            recommendations.push('Considera una flecha con spine más rígido (número más bajo)');
        }
        else if (matchIndex < constants_1.MATCH_GOOD_MIN) {
            status = 'stiff';
            recommendations.push('Considera una flecha con spine más flexible (número más alto)');
        }
        else {
            status = 'good';
        }
    }
    const grainsPerPound = componentWeights.arrowTotalWeight / drawWeight;
    if (isFinite(grainsPerPound)) {
        if (grainsPerPound < constants_1.GPP_MIN_SAFE) {
            warnings.push('¡PELIGRO! Flecha muy ligera - puede dañar el arco o romperse durante el disparo');
        }
        else if (grainsPerPound < constants_1.GPP_MIN_RECOMMENDED) {
            warnings.push('Flecha ligera - considere aumentar el peso para mayor seguridad del arco');
        }
    }
    if (isFinite(matchIndex)) {
        if (matchIndex > constants_1.MATCH_EXTREME_WEAK) {
            warnings.push('¡PELIGRO! Flecha demasiado flexible - riesgo de fractura y daño al arco');
        }
        else if (matchIndex < constants_1.MATCH_EXTREME_STIFF) {
            warnings.push('Flecha excesivamente rígida - puede causar vuelo errático y golpes en el arco');
        }
    }
    if (isFinite(effectiveFPS)) {
        if (effectiveFPS > constants_1.VELOCITY_MAX_SAFE) {
            warnings.push('Velocidad extrema - asegúrese de que su equipo pueda manejar estas fuerzas');
        }
        else if (effectiveFPS < constants_1.VELOCITY_MIN_TARGET) {
            recommendations.push('La velocidad es baja. Considera reducir el peso de la flecha o optimizar la eficiencia del arco.');
        }
        else if (effectiveFPS > constants_1.VELOCITY_OPTIMAL_MAX) {
            recommendations.push('La velocidad es alta. Asegúrate de que tu equipo pueda manejar estas fuerzas.');
        }
    }
    if (isFinite(grainsPerPound)) {
        if (grainsPerPound < constants_1.GPP_MIN_RECOMMENDED) {
            recommendations.push('La flecha es muy ligera para la potencia. Considera aumentar el peso para mejor eficiencia.');
        }
        else if (grainsPerPound > constants_1.GPP_MAX_RECOMMENDED) {
            recommendations.push('La flecha es muy pesada para la potencia. Considera reducir el peso para mejor velocidad.');
        }
    }
    if (foc > 0) {
        if (foc < constants_1.FOC_MIN_RECOMMENDED) {
            recommendations.push(`FOC bajo (<${constants_1.FOC_MIN_RECOMMENDED}%). La flecha puede ser inestable a largas distancias. Aumenta el peso en punta.`);
        }
        else if (foc > constants_1.FOC_MAX_RECOMMENDED) {
            recommendations.push(`FOC alto (>${constants_1.FOC_MAX_RECOMMENDED}%). Bueno para caza/penetración, pero la flecha caerá más rápido.`);
        }
    }
    if (temperatureF !== undefined && Math.abs(temperatureF - constants_1.TEMP_REFERENCE) > 20) {
        const direction = temperatureF > constants_1.TEMP_REFERENCE ? 'más' : 'menos';
        recommendations.push(`Temperatura ${direction} flexible. Considera ajustar el spine ${temperatureF > constants_1.TEMP_REFERENCE ? 'más rígido' : 'más flexible'}.`);
    }
    const edgeCaseRecommendation = getEdgeCaseRecommendation(drawWeight);
    if (edgeCaseRecommendation !== 'Spine recomendado para configuración actual' && status !== 'weak') {
        recommendations.push(edgeCaseRecommendation);
    }
    const hasPreciseMeasurements = (toNumber(arrow.shaftGpi) > 0 || toNumber(arrow.measuredArrowTotalWeight ?? '') > 0) &&
        componentWeights.pointWeight > 0 &&
        fletchLength > 0 &&
        fletchHeight > 0;
    const confidence = calculateConfidenceLevel(hasAllInputs, temperatureF !== undefined, hasPreciseMeasurements, stringWeights.stringMaterial !== 'unknown', measuredChronoSpeed > 0);
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
    };
}
