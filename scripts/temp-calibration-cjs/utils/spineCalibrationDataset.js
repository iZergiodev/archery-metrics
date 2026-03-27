"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPOUND_CALIBRATION_CASES = exports.OFFICIAL_COMPOUND_BENCHMARK_CASES = exports.OFFICIAL_COMPOUND_CALIBRATION_CASES = exports.OFFICIAL_COMPOUND_SANITY_CASES = exports.SFAX_PRIMARY_REFERENCE_CASES = exports.SFAX_REFERENCE_DATASET_VERSION = exports.DEFAULT_CALIBRATION_STRING_WEIGHTS = void 0;
const compoundDatabase_1 = require("../data/official/compoundDatabase");
const compoundReference_1 = require("../data/sfax/compoundReference");
exports.DEFAULT_CALIBRATION_STRING_WEIGHTS = compoundDatabase_1.OFFICIAL_DEFAULT_COMPOUND_STRING_WEIGHTS;
exports.SFAX_REFERENCE_DATASET_VERSION = 'sfax-reference-v1';
exports.SFAX_PRIMARY_REFERENCE_CASES = compoundReference_1.SFAX_COMPOUND_REFERENCE_CASES_V1.map((entry) => ({
    ...entry,
    weight: entry.completeness === 'full' ? 1 : 0.7,
}));
exports.OFFICIAL_COMPOUND_SANITY_CASES = compoundDatabase_1.OFFICIAL_COMPOUND_CASES_V1.map((entry) => ({
    id: entry.id,
    source: entry.source,
    sourceType: 'official_chart',
    sourceIds: entry.sourceIds,
    confidence: entry.confidence,
    datasetVersion: 'official-compound-v2',
    expectedMatchIndex: entry.expectedMatchIndex,
    acceptableMatchRange: entry.acceptableMatchRange,
    weight: entry.calibrationWeight,
    bow: entry.bow,
    arrow: entry.arrow,
    stringWeights: entry.stringWeights,
}));
exports.OFFICIAL_COMPOUND_CALIBRATION_CASES = exports.OFFICIAL_COMPOUND_SANITY_CASES.filter((entry) => {
    const sourceEntry = compoundDatabase_1.OFFICIAL_COMPOUND_CASES_V1.find((candidate) => candidate.id === entry.id);
    return sourceEntry?.usage !== 'benchmark';
});
exports.OFFICIAL_COMPOUND_BENCHMARK_CASES = exports.OFFICIAL_COMPOUND_SANITY_CASES;
exports.COMPOUND_CALIBRATION_CASES = exports.OFFICIAL_COMPOUND_CALIBRATION_CASES;
