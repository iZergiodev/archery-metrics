/**
 * Archery Calculator Calibration Constants
 * 
 * These constants are used to tune the physics engine of the calculator.
 * Adjust these values based on real-world feedback and manufacturer charts.
 */

// Controls the required spine calculation (Static Spine)
// Higher value = Weaker spine required (higher spine number)
// Lower value = Stiffer spine required (lower spine number)
// Base value aligned with Easton charts for 70# @ 28"
export const K_SPINE_CALIBRATION = 0.315

// Controls the dynamic spine flex calculation
// Higher value = Less aggressive adjustment (closer to static spine)
// Lower value = More aggressive adjustment
export const K_DYNAMIC_FLEX_CALIBRATION = 2000000

// Conversion factor for Kinetic Energy to FPS
// Derived from: 7000 (grains/lb) * 32.174 (ft/s²) * 2
export const K_FPS_CONVERSION = 553000

// Cam Aggressiveness Factors (Force Draw Curve efficiency)
export const CAM_EFFICIENCY = {
    soft: 0.80,   // Round wheels, older bows
    medium: 0.85, // Standard modern hybrid/single cams
    hard: 0.90,   // Turbo/Speed cams, aggressive draw cycle
}
