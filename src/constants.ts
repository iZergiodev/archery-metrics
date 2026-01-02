/**
 * Archery Calculator Calibration Constants
 *
 * These constants are used to tune the physics engine of the calculator.
 * Adjust these values based on real-world feedback and manufacturer charts.
 */

// === SPINE CALIBRATION ===

// Controls the required spine calculation (Static Spine)
// Higher value = Weaker spine required (higher spine number)
// Lower value = Stiffer spine required (lower spine number)
// Calibrado para 70# @ 28" con punta 125gr = matchIndex ~1.0 con spine 0.340
export const K_SPINE_CALIBRATION = 0.365

// Controls the dynamic spine flex calculation
// Higher value = Less aggressive adjustment (closer to static spine)
// Lower value = More aggressive adjustment
export const K_DYNAMIC_FLEX_CALIBRATION = 2000000

// === VELOCITY CONVERSION ===

// Conversion factor for Kinetic Energy to FPS
// Derived from: 7000 (grains/lb) * 32.174 (ft/s²) * 2
export const K_FPS_CONVERSION = 553000

// === CAM EFFICIENCY ===

// Cam Aggressiveness Factors (Force Draw Curve efficiency)
export const CAM_EFFICIENCY = {
    soft: 0.80,   // Round wheels, older bows
    medium: 0.85, // Standard modern hybrid/single cams
    hard: 0.90,   // Turbo/Speed cams, aggressive draw cycle
}

// === MATCH TOLERANCE ===

// Tolerance window for spine match (percentage)
export const MATCH_TOLERANCE = 0.03  // ±3%
export const MATCH_GOOD_MAX = 1 + MATCH_TOLERANCE
export const MATCH_GOOD_MIN = 1 - MATCH_TOLERANCE

// === GPP (GRAINS PER POUND) THRESHOLDS ===

export const GPP_MIN_SAFE = 4       // Minimum safe for compound bows
export const GPP_MIN_RECOMMENDED = 5
export const GPP_MAX_RECOMMENDED = 8

// === FOC (FRONT OF CENTER) THRESHOLDS ===

export const FOC_MIN_RECOMMENDED = 7   // Minimum recommended FOC %
export const FOC_MAX_RECOMMENDED = 16  // Maximum recommended FOC % for target
export const FOC_OPTIMAL_LOW = 10
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
