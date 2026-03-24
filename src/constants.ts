/**
 * Archery Calculator Calibration Constants
 *
 * These constants are used to tune the physics engine of the calculator.
 * Adjusted based on Easton Arrow Spine Chart (2024):
 * - 70# @ 30" = spine 0.340
 * - 75# @ 30" = spine 0.300
 * - 60# @ 28" = spine 0.380
 */

// === SPINE CALIBRATION ===

// Controls the required spine calculation (Static Spine) - Compound
// Calibrado para coincidir con tabla Easton 2024
// Fórmula base: spine = K * weightFactor * sqrt(length/28)
// K ajustada con el set interno de casos compound del proyecto.
export const K_SPINE_CALIBRATION = 0.4

// Controls the required spine calculation - Recurve/Traditional
// Calibrado: 40# @ 28" → spine 0.500, 30# → ~0.640, 50# → ~0.410
// Fórmula: spine = K * (drawWeight/40)^(-0.85) * sqrt(arrowLength/28) / (drawLength/28)^0.3
export const K_RECURVE_CALIBRATION = 0.50

// === DYNAMIC SPINE CALIBRATION ===

// Static spine is measured on a standardized span. In real use, a longer shaft
// bends more and a shorter shaft bends less. The model uses an effective
// exponent instead of the full beam-theory cubic term.
export const STATIC_SPINE_REFERENCE_LENGTH = 28
export const DYNAMIC_SPINE_LENGTH_EXPONENT = 1.5

// Front mass weakens dynamic spine. We normalize around a common target setup:
// 100gr point + 25gr insert = 125gr total in the front.
export const FRONT_MASS_REFERENCE = 125
export const FRONT_MASS_GRAINS_STEP = 25
export const FRONT_MASS_SENSITIVITY = 0.035

// String-side mass and material also change how stiff the arrow acts at launch.
// Easton explicitly lists heavier string material, heavier serving/nock point and
// other string-side additions as factors that make an arrow act stiffer.
export const STRING_DYNAMIC_REFERENCE_WEIGHT = 25
export const STRING_DYNAMIC_WEIGHT_STEP = 10
export const STRING_DYNAMIC_WEIGHT_SENSITIVITY = 0.015
export const STRING_DYNAMIC_DACRON_FACTOR = 0.97
export const WRAP_WEIGHT_SENSITIVITY = 0.001
export const REAR_MASS_REFERENCE = 15
export const REAR_MASS_SENSITIVITY = 0.002

// === REQUIRED SPINE CALIBRATION (COMPOUND) ===

// Compound required spine should respond not only to peak draw weight, but also
// to the launch severity of the bow. This reference energy corresponds to a
// representative modern setup around 70# / 29" / 6.5" / 335 IBO / medium cams.
export const COMPOUND_REQUIRED_SPINE_DRAW_WEIGHT_EXPONENT = -0.8
export const COMPOUND_REQUIRED_SPINE_REFERENCE_AVAILABLE_ENERGY = 55.5
export const COMPOUND_REQUIRED_SPINE_ENERGY_EXPONENT = -0.12
// Keep a small length trend on the required side so the optimizer can decide
// the final split between bow severity and arrow response instead of forcing
// all length sensitivity into a single side of the ratio.
export const COMPOUND_REQUIRED_LENGTH_EXPONENT = 0.3
export const COMPOUND_REQUIRED_IBO_REFERENCE = 330
export const COMPOUND_REQUIRED_IBO_SENSITIVITY = 0.18
export const COMPOUND_REQUIRED_BRACE_REFERENCE = 7
export const COMPOUND_REQUIRED_BRACE_SENSITIVITY = 4.5
// The Easton chart already bakes several effects into discrete lb adjustments.
// Our energy model captures part of that continuously, so we blend the chart
// delta instead of applying it 1:1 to avoid double counting.
export const COMPOUND_REQUIRED_CHART_ADJUSTMENT_BLEND = 1
export const COMPOUND_REQUIRED_FRONT_WEIGHT_BASELINE = 100
export const COMPOUND_REQUIRED_FRONT_WEIGHT_STEP = 25
export const COMPOUND_REQUIRED_FRONT_WEIGHT_ADJUSTMENT_PER_STEP = 3.5

// === VELOCITY CONVERSION ===

// Conversion factor for Kinetic Energy to FPS
// Derived from: 7000 (grains/lb) * 32.174 (ft/s²) * 2
export const K_FPS_CONVERSION = 546000

// === CAM EFFICIENCY ===

// Cam Aggressiveness Factors (Force Draw Curve efficiency)
export const CAM_EFFICIENCY = {
    soft: 0.80,   // Round wheels, older bows
    medium: 0.85, // Standard modern hybrid/single cams
    hard: 0.90,   // Turbo/Speed cams, aggressive draw cycle
}

// === MATCH TOLERANCE ===

// Tolerance window for spine match (percentage)
// Extended to 10% to account for real-world variations in arrow spine
export const MATCH_TOLERANCE = 0.10
export const MATCH_GOOD_MAX = 1 + MATCH_TOLERANCE
export const MATCH_GOOD_MIN = 1 - MATCH_TOLERANCE

// === GPP (GRAINS PER POUND) THRESHOLDS ===

export const GPP_MIN_SAFE = 4       // Minimum safe for compound bows
export const GPP_MIN_RECOMMENDED = 5
export const GPP_MAX_RECOMMENDED = 8

// === FOC (FRONT OF CENTER) THRESHOLDS ===

export const FOC_MIN_RECOMMENDED = 7   // Minimum recommended FOC %
export const FOC_MAX_RECOMMENDED = 16  // Maximum recommended FOC % for target
export const FOC_OPTIMAL_LOW = 13
export const FOC_OPTIMAL_HIGH = 15

// === VELOCITY THRESHOLDS (FPS) ===

export const VELOCITY_MIN_TARGET = 260
export const VELOCITY_MAX_SAFE = 340
export const VELOCITY_OPTIMAL_MIN = 280
export const VELOCITY_OPTIMAL_MAX = 320

// === EXTREME MATCH THRESHOLDS ===

export const MATCH_EXTREME_WEAK = 1.25   // Dangerously weak
export const MATCH_EXTREME_STIFF = 0.75  // Dangerously stiff

// === MASS RATIO THRESHOLDS ===

export const MASS_RATIO_MIN_SAFE = 4
export const MASS_RATIO_MIN_RECOMMENDED = 5
export const MASS_RATIO_MAX_RECOMMENDED = 8

// === TEMPERATURE CALIBRATION ===

// Temperature reference (°F) for standard spine measurements
export const TEMP_REFERENCE = 70
// Spine change per 10°F from reference (carbon arrows)
export const TEMP_SPINE_COEFFICIENT = 0.001

// === COMPONENT POSITIONS (for FOC calculation) ===
// These are approximate positions from nock for moment calculations

export const COMPONENT_POSITIONS = {
    fletchCenter: 1.5,   // inches from nock
    wrapCenter: 2.5,     // inches from nock
    shaftCenterRatio: 0.5, // shaft CG is at length * this ratio
}

// === ARCHERY TYPES ===

export const ARCHERY_TYPE = {
    COMPOUND: 'compound',
    RECURVO: 'recurvo',
    TRADITIONAL: 'traditional',
} as const

export type ArcheryType = typeof ARCHERY_TYPE[keyof typeof ARCHERY_TYPE]
