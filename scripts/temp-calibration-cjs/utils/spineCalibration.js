"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateCompoundCalibration = evaluateCompoundCalibration;
exports.summarizeCompoundCalibration = summarizeCompoundCalibration;
exports.analyzeCompoundCalibration = analyzeCompoundCalibration;
exports.evaluateOfficialCompoundBenchmarks = evaluateOfficialCompoundBenchmarks;
exports.analyzeOfficialCompoundBenchmarks = analyzeOfficialCompoundBenchmarks;
exports.evaluateCompoundMonotonicity = evaluateCompoundMonotonicity;
exports.getOfficialCaseUsage = getOfficialCaseUsage;
const compoundDatabase_1 = require("../data/official/compoundDatabase");
const archeryCalculator_1 = require("./archeryCalculator");
const spineCalibrationDataset_1 = require("./spineCalibrationDataset");
function roundMetricError(actual, expected) {
    return {
        actual,
        expected,
        absoluteError: Math.abs(actual - expected),
    };
}
function calculateKineticEnergy(arrowWeight, fps) {
    if (!isFinite(arrowWeight) || !isFinite(fps) || arrowWeight <= 0 || fps <= 0)
        return 0;
    return (arrowWeight * fps * fps) / 450240;
}
function calculateGrainsPerPound(arrowWeight, drawWeight) {
    if (!isFinite(arrowWeight) || !isFinite(drawWeight) || arrowWeight <= 0 || drawWeight <= 0)
        return 0;
    return arrowWeight / drawWeight;
}
function calculateAggregateError(result) {
    return (result.dynamicSpine.absoluteError / 0.01 +
        result.fps.absoluteError / 3 +
        result.totalArrowWeight.absoluteError / 1 +
        result.grlb.absoluteError / 0.05 +
        result.ke.absoluteError / 0.2 +
        result.foc.absoluteError / 0.25) / 6;
}
function summarizeMetric(results, weights, select) {
    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    const absoluteErrors = results.map(select);
    return {
        meanAbsoluteError: absoluteErrors.reduce((sum, value) => sum + value, 0) / results.length,
        weightedMeanAbsoluteError: absoluteErrors.reduce((sum, value, index) => sum + value * weights[index], 0) / totalWeight,
        maxAbsoluteError: Math.max(...absoluteErrors),
    };
}
function getSfaxCategories(referenceCase) {
    const drawWeight = Number(referenceCase.bow.drawWeight);
    const drawLength = Number(referenceCase.bow.drawLength);
    const releaseType = referenceCase.stringWeights.releaseType.toLowerCase();
    return {
        completeness: referenceCase.completeness,
        drawWeightBand: drawWeight < 60 ? '<60' : drawWeight < 70 ? '60-69' : '70+',
        drawLengthBand: drawLength < 29 ? '<29' : drawLength < 30 ? '29-29.9' : '30+',
        releaseTypeBand: releaseType.includes('finger') || releaseType.includes('manual') ? 'finger' : 'mechanical',
    };
}
function getOfficialCategories(calibrationCase) {
    const drawWeight = Number(calibrationCase.bow.drawWeight);
    const drawLength = Number(calibrationCase.bow.drawLength);
    const iboVelocity = Number(calibrationCase.bow.iboVelocity);
    const totalFrontWeight = Number(calibrationCase.arrow.pointWeight) + Number(calibrationCase.arrow.insertWeight);
    const releaseType = (calibrationCase.stringWeights?.releaseType ?? spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS.releaseType).toLowerCase();
    const providers = calibrationCase.sourceIds
        .map((sourceId) => compoundDatabase_1.OFFICIAL_COMPOUND_SOURCES[sourceId]?.provider)
        .filter(Boolean);
    return {
        provider: providers.length > 0 ? Array.from(new Set(providers)).join('+') : calibrationCase.sourceType,
        drawWeightBand: drawWeight < 50 ? '<50' : drawWeight < 60 ? '50-59' : drawWeight < 70 ? '60-69' : '70+',
        drawLengthBand: drawLength < 28 ? '<28' : drawLength < 30 ? '28-29.9' : '30+',
        iboBand: iboVelocity <= 300 ? '<=300' : iboVelocity <= 330 ? '301-330' : iboVelocity <= 350 ? '331-350' : '351+',
        frontWeightBand: totalFrontWeight <= 100 ? '<=100' : totalFrontWeight <= 125 ? '101-125' : totalFrontWeight <= 150 ? '126-150' : '151+',
        releaseTypeBand: releaseType.includes('finger') || releaseType.includes('manual') ? 'finger' : 'mechanical',
    };
}
function buildBucketSummary(entries, weights, categoryMaps) {
    return Array.from(categoryMaps.entries())
        .map(([key, indices]) => {
        const [category, bucket] = key.split(':');
        const absoluteErrors = indices.map((index) => entries[index].aggregateAbsoluteError ?? entries[index].absoluteError ?? 0);
        const weightedAbsoluteErrors = indices.map((index) => entries[index].weightedAggregateAbsoluteError ?? entries[index].weightedAbsoluteError ?? 0);
        const totalWeight = indices.reduce((sum, index) => sum + weights[index], 0);
        return {
            category,
            bucket,
            count: indices.length,
            meanAbsoluteError: absoluteErrors.reduce((sum, value) => sum + value, 0) / indices.length,
            weightedMeanAbsoluteError: weightedAbsoluteErrors.reduce((sum, value) => sum + value, 0) / totalWeight,
            maxAbsoluteError: Math.max(...absoluteErrors),
        };
    })
        .sort((left, right) => {
        if (right.weightedMeanAbsoluteError !== left.weightedMeanAbsoluteError) {
            return right.weightedMeanAbsoluteError - left.weightedMeanAbsoluteError;
        }
        return right.count - left.count;
    });
}
function evaluateCompoundCalibration(cases = spineCalibrationDataset_1.SFAX_PRIMARY_REFERENCE_CASES) {
    return cases.map((referenceCase) => {
        const result = (0, archeryCalculator_1.calculateSpineMatch)(referenceCase.bow, referenceCase.arrow, referenceCase.stringWeights);
        const actualArrowWeight = result.arrowTotalWeight;
        const actualFps = result.effectiveFPS ?? 0;
        const actualKe = calculateKineticEnergy(actualArrowWeight, actualFps);
        const actualGrlb = calculateGrainsPerPound(actualArrowWeight, Number(referenceCase.bow.drawWeight));
        const calibrationResultBase = {
            id: referenceCase.id,
            label: referenceCase.label,
            source: referenceCase.source,
            completeness: referenceCase.completeness,
            status: result.status,
            dynamicSpine: roundMetricError(result.spineRequired ?? 0, referenceCase.sfaxResults.dynamicSpine),
            fps: roundMetricError(actualFps, referenceCase.sfaxResults.fps),
            totalArrowWeight: roundMetricError(actualArrowWeight, referenceCase.sfaxResults.totalArrowWeight),
            grlb: roundMetricError(actualGrlb, referenceCase.sfaxResults.grlb),
            ke: roundMetricError(actualKe, referenceCase.sfaxResults.ke),
            foc: roundMetricError(result.foc ?? 0, referenceCase.sfaxResults.foc),
        };
        const aggregateAbsoluteError = calculateAggregateError(calibrationResultBase);
        return {
            ...calibrationResultBase,
            aggregateAbsoluteError,
            weightedAggregateAbsoluteError: aggregateAbsoluteError * referenceCase.weight,
        };
    });
}
function summarizeCompoundCalibration(cases = spineCalibrationDataset_1.SFAX_PRIMARY_REFERENCE_CASES) {
    const results = evaluateCompoundCalibration(cases);
    const weights = cases.map((entry) => entry.weight);
    return {
        meanAbsoluteError: summarizeMetric(results, weights, (result) => result.dynamicSpine.absoluteError).meanAbsoluteError,
        weightedMeanAbsoluteError: summarizeMetric(results, weights, (result) => result.dynamicSpine.absoluteError).weightedMeanAbsoluteError,
        maxAbsoluteError: summarizeMetric(results, weights, (result) => result.dynamicSpine.absoluteError).maxAbsoluteError,
        dynamicSpine: summarizeMetric(results, weights, (result) => result.dynamicSpine.absoluteError),
        fps: summarizeMetric(results, weights, (result) => result.fps.absoluteError),
        totalArrowWeight: summarizeMetric(results, weights, (result) => result.totalArrowWeight.absoluteError),
        grlb: summarizeMetric(results, weights, (result) => result.grlb.absoluteError),
        ke: summarizeMetric(results, weights, (result) => result.ke.absoluteError),
        foc: summarizeMetric(results, weights, (result) => result.foc.absoluteError),
        results,
    };
}
function analyzeCompoundCalibration(cases = spineCalibrationDataset_1.SFAX_PRIMARY_REFERENCE_CASES) {
    const results = evaluateCompoundCalibration(cases);
    const weights = cases.map((entry) => entry.weight);
    const categoryMaps = new Map();
    cases.forEach((referenceCase, index) => {
        const categories = getSfaxCategories(referenceCase);
        for (const [category, bucket] of Object.entries(categories)) {
            const key = `${category}:${bucket}`;
            categoryMaps.set(key, [...(categoryMaps.get(key) ?? []), index]);
        }
    });
    return {
        overall: summarizeCompoundCalibration(cases),
        worstCases: results.slice().sort((left, right) => right.aggregateAbsoluteError - left.aggregateAbsoluteError).slice(0, 8),
        categoryBreakdown: buildBucketSummary(results, weights, categoryMaps),
    };
}
function evaluateOfficialCompoundBenchmarks(cases = spineCalibrationDataset_1.OFFICIAL_COMPOUND_BENCHMARK_CASES) {
    return cases.map((calibrationCase) => {
        const result = (0, archeryCalculator_1.calculateSpineMatch)(calibrationCase.bow, calibrationCase.arrow, calibrationCase.stringWeights ?? spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
        const actualMatchIndex = result.matchIndex ?? 0;
        const targetRange = calibrationCase.acceptableMatchRange;
        const absoluteError = targetRange == null
            ? Math.abs(actualMatchIndex - (calibrationCase.expectedMatchIndex ?? 1))
            : actualMatchIndex < targetRange.min
                ? targetRange.min - actualMatchIndex
                : actualMatchIndex > targetRange.max
                    ? actualMatchIndex - targetRange.max
                    : 0;
        return {
            id: calibrationCase.id,
            source: calibrationCase.source,
            expectedMatchIndex: calibrationCase.expectedMatchIndex ?? null,
            actualMatchIndex,
            targetRange,
            absoluteError,
            weightedAbsoluteError: absoluteError * calibrationCase.weight,
            status: result.status,
        };
    });
}
function summarizeOfficialCompoundBenchmarks(cases = spineCalibrationDataset_1.OFFICIAL_COMPOUND_BENCHMARK_CASES) {
    const results = evaluateOfficialCompoundBenchmarks(cases);
    const totalWeight = cases.reduce((sum, entry) => sum + entry.weight, 0);
    const inRangeCount = results.filter((result) => result.absoluteError === 0).length;
    return {
        meanAbsoluteError: results.reduce((sum, result) => sum + result.absoluteError, 0) / results.length,
        weightedMeanAbsoluteError: results.reduce((sum, result) => sum + result.weightedAbsoluteError, 0) / totalWeight,
        maxAbsoluteError: Math.max(...results.map((result) => result.absoluteError)),
        inRangeRate: inRangeCount / results.length,
        results,
    };
}
function analyzeOfficialCompoundBenchmarks(cases = spineCalibrationDataset_1.OFFICIAL_COMPOUND_BENCHMARK_CASES) {
    const results = evaluateOfficialCompoundBenchmarks(cases);
    const weights = cases.map((entry) => entry.weight);
    const categoryMaps = new Map();
    cases.forEach((calibrationCase, index) => {
        const categories = getOfficialCategories(calibrationCase);
        for (const [category, bucket] of Object.entries(categories)) {
            const key = `${category}:${bucket}`;
            categoryMaps.set(key, [...(categoryMaps.get(key) ?? []), index]);
        }
    });
    return {
        overall: summarizeOfficialCompoundBenchmarks(cases),
        worstCases: results.slice().sort((left, right) => right.absoluteError - left.absoluteError).slice(0, 8),
        categoryBreakdown: buildBucketSummary(results, weights, categoryMaps),
    };
}
function evaluateCompoundMonotonicity() {
    const baseBow = {
        iboVelocity: '335',
        drawLength: '29',
        drawWeight: '70',
        braceHeight: '6.5',
        axleToAxle: '34',
        percentLetoff: '85',
        archeryType: 'compound',
    };
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
        shaftUseCategory: 'base',
        insertType: 'default',
        fletchLength: '2',
        fletchHeight: '0.5',
    };
    const slow = (0, archeryCalculator_1.calculateSpineMatch)({ ...baseBow, iboVelocity: '295' }, baseArrow, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const medium = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, baseArrow, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const fast = (0, archeryCalculator_1.calculateSpineMatch)({ ...baseBow, iboVelocity: '350' }, baseArrow, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const forgivingBrace = (0, archeryCalculator_1.calculateSpineMatch)({ ...baseBow, braceHeight: '7' }, baseArrow, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const lowBrace = (0, archeryCalculator_1.calculateSpineMatch)({ ...baseBow, braceHeight: '6' }, baseArrow, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const lightFront = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, { ...baseArrow, pointWeight: '100', insertWeight: '0' }, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const heavyFront = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, { ...baseArrow, pointWeight: '125', insertWeight: '25' }, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const lightRear = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, { ...baseArrow, nockWeight: '6', bushingPin: '4' }, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const heavyRear = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, { ...baseArrow, nockWeight: '12', bushingPin: '10' }, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const shortFletch = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, { ...baseArrow, fletchLength: '1.75' }, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const longFletch = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, { ...baseArrow, fletchLength: '3' }, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const cleanString = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, baseArrow, { ...spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS, peep: '6', dLoop: '4', nockPoint: '2' });
    const heavyString = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, baseArrow, { ...spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS, peep: '14', dLoop: '8', nockPoint: '4', silencers: '12' });
    const mechanical = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, baseArrow, spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS);
    const finger = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, baseArrow, { ...spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS, releaseType: 'manual fingers' });
    const fastFlight = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, baseArrow, { ...spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS, stringMaterial: 'fastflight' });
    const dacron = (0, archeryCalculator_1.calculateSpineMatch)(baseBow, baseArrow, { ...spineCalibrationDataset_1.DEFAULT_CALIBRATION_STRING_WEIGHTS, stringMaterial: 'dacron' });
    return [
        {
            id: 'compound_speed_bucket_requires_stiffer_target_spine',
            passed: slow.spineRequired != null &&
                medium.spineRequired != null &&
                fast.spineRequired != null &&
                slow.spineRequired > medium.spineRequired &&
                medium.spineRequired > fast.spineRequired,
            details: `slow=${slow.spineRequired?.toFixed(4)} medium=${medium.spineRequired?.toFixed(4)} fast=${fast.spineRequired?.toFixed(4)}`,
        },
        {
            id: 'compound_low_brace_requires_stiffer_target_spine',
            passed: lowBrace.spineRequired != null &&
                forgivingBrace.spineRequired != null &&
                lowBrace.spineRequired < forgivingBrace.spineRequired,
            details: `lowBrace=${lowBrace.spineRequired?.toFixed(4)} forgiving=${forgivingBrace.spineRequired?.toFixed(4)}`,
        },
        {
            id: 'compound_heavier_front_stiffens_dynamic_spine',
            passed: lightFront.spineRequired != null &&
                heavyFront.spineRequired != null &&
                heavyFront.spineRequired < lightFront.spineRequired &&
                heavyFront.matchIndex != null &&
                lightFront.matchIndex != null &&
                heavyFront.matchIndex > lightFront.matchIndex,
            details: `lightFront=${lightFront.spineRequired?.toFixed(4)} heavyFront=${heavyFront.spineRequired?.toFixed(4)}`,
        },
        {
            id: 'compound_heavier_rear_weakens_dynamic_spine',
            passed: lightRear.spineRequired != null &&
                heavyRear.spineRequired != null &&
                heavyRear.spineRequired > lightRear.spineRequired &&
                heavyRear.matchIndex != null &&
                lightRear.matchIndex != null &&
                heavyRear.matchIndex < lightRear.matchIndex,
            details: `lightRear=${lightRear.spineRequired?.toFixed(4)} heavyRear=${heavyRear.spineRequired?.toFixed(4)}`,
        },
        {
            id: 'compound_longer_fletch_weakens_dynamic_spine',
            passed: shortFletch.spineRequired != null &&
                longFletch.spineRequired != null &&
                longFletch.spineRequired > shortFletch.spineRequired,
            details: `short=${shortFletch.spineRequired?.toFixed(4)} long=${longFletch.spineRequired?.toFixed(4)}`,
        },
        {
            id: 'compound_heavier_string_accessories_weaken_dynamic_spine',
            passed: cleanString.spineRequired != null &&
                heavyString.spineRequired != null &&
                heavyString.spineRequired > cleanString.spineRequired,
            details: `clean=${cleanString.spineRequired?.toFixed(4)} heavy=${heavyString.spineRequired?.toFixed(4)}`,
        },
        {
            id: 'compound_finger_release_requires_stiffer_target_spine',
            passed: mechanical.spineRequired != null &&
                finger.spineRequired != null &&
                finger.spineRequired < mechanical.spineRequired &&
                finger.matchIndex != null &&
                mechanical.matchIndex != null &&
                finger.matchIndex > mechanical.matchIndex,
            details: `mechanical=${mechanical.spineRequired?.toFixed(4)} finger=${finger.spineRequired?.toFixed(4)}`,
        },
        {
            id: 'compound_dacron_weakens_dynamic_spine',
            passed: fastFlight.spineRequired != null &&
                dacron.spineRequired != null &&
                dacron.spineRequired > fastFlight.spineRequired,
            details: `fastflight=${fastFlight.spineRequired?.toFixed(4)} dacron=${dacron.spineRequired?.toFixed(4)}`,
        },
    ];
}
function getOfficialCaseUsage(calibrationCase) {
    const officialCase = compoundDatabase_1.OFFICIAL_COMPOUND_CASES_V1.find((entry) => entry.id === calibrationCase.id);
    return officialCase?.usage ?? 'calibration';
}
