/**
 * Archery calculator constants.
 *
 * Compound tuning is now centered on the reverse-engineered SFAX formulas.
 * Recurve/traditional keep the previous calibrated approximation.
 */

// === ARCHERY TYPES ===

export const ARCHERY_TYPE = {
    COMPOUND: 'compound',
    RECURVO: 'recurvo',
    TRADITIONAL: 'traditional',
} as const

export type ArcheryType = typeof ARCHERY_TYPE[keyof typeof ARCHERY_TYPE]

// === SFAX COMPOUND MODEL ===

export const SFAX_REFERENCE_DRAW_WEIGHT = 70
export const SFAX_REFERENCE_DRAW_LENGTH = 30
export const SFAX_REFERENCE_BRACE_HEIGHT = 7
export const SFAX_REFERENCE_ARROW_WEIGHT = 350
export const SFAX_REFERENCE_PERCENT = 100
export const SFAX_REFERENCE_HOLDING_PERCENT = 65
export const SFAX_SPINE_TEST_LENGTH = 28

export const SFAX_VELOCITY_DRAW_WEIGHT_FPS = 0.325
export const SFAX_VELOCITY_BRACE_HEIGHT_FPS = 10.2
export const SFAX_VELOCITY_DIVISOR = 5.35
export const SFAX_VELOCITY_COMPOUND_BASE_OFFSET = 325
export const SFAX_VELOCITY_NON_COMPOUND_BASE_OFFSET = 220
export const SFAX_VELOCITY_COMPOUND_BASE_EFFICIENCY = 82
export const SFAX_VELOCITY_NON_COMPOUND_BASE_EFFICIENCY = 76
export const SFAX_VELOCITY_SCALING_FACTOR = 1.5
export const SFAX_VELOCITY_WEIGHT_CLASS_SIZE = 10
export const SFAX_VELOCITY_WEIGHT_CLASS_START = 300
export const SFAX_VELOCITY_DECAY_MID = 0.55
export const SFAX_VELOCITY_DECAY_HIGH = 0.45
export const SFAX_VELOCITY_DEFAULT_DW_FACTOR = 2
export const SFAX_VELOCITY_DEFAULT_DL_FACTOR = 10.2
export const SFAX_VELOCITY_DW_MICRO_FACTOR = 0.01
export const SFAX_VELOCITY_DL_MICRO_FACTOR = 0.03175
export const SFAX_VELOCITY_LOW_IBO_THRESHOLD = 200
export const SFAX_VELOCITY_LOW_IBO_EFFICIENCY = 0.2

export const SFAX_DYNAMIC_DRAW_CURVE_START = -70
export const SFAX_DYNAMIC_DRAW_CURVE_END = 110
export const SFAX_DYNAMIC_DRAW_CURVE_AMPLITUDE = 15
export const SFAX_DYNAMIC_DRAW_CURVE_AMPLITUDE_NON_COMPOUND = 22
export const SFAX_DYNAMIC_A2A_CURVE_START = 24
export const SFAX_DYNAMIC_A2A_CURVE_END = 45
export const SFAX_DYNAMIC_A2A_CURVE_AMPLITUDE = 2
export const SFAX_DYNAMIC_A2A_REF_NON_COMPOUND = 60
export const SFAX_DYNAMIC_A2A_SENSITIVITY_NON_COMPOUND = 6.5
export const SFAX_DYNAMIC_A2A_DIVISOR_NON_COMPOUND = 40
export const SFAX_DYNAMIC_FINGER_START = 10
export const SFAX_DYNAMIC_FINGER_END = 60
export const SFAX_DYNAMIC_FINGER_BASE = 1.25
export const SFAX_DYNAMIC_FINGER_DELTA = 2.5
export const SFAX_DYNAMIC_LENGTH_MULTIPLIER = 2.75
export const SFAX_DYNAMIC_LENGTH_DIVISOR = 80
export const SFAX_DYNAMIC_LENGTH_REFERENCE = 50
export const SFAX_DYNAMIC_LENGTH_BASE = 20.75
export const SFAX_DYNAMIC_NON_COMPOUND_CURVE_DIVISOR = 40
export const SFAX_DYNAMIC_DEFAULT_LENGTH_FALLBACK = 20

export const SFAX_COMPONENT_SENSITIVITY = 0.12
export const SFAX_FRONT_MASS_REFERENCE = 75
export const SFAX_FLETCH_WEIGHT_REFERENCE = 30
export const SFAX_REAR_MASS_REFERENCE = 12
export const SFAX_MIN_INTERMEDIATE_SPINE = 15

export const SFAX_RELEASE_FACTOR_UNKNOWN = 0.25
export const SFAX_RELEASE_FACTOR_POST = 1.0
export const SFAX_RELEASE_FACTOR_ROPE = 1.75
export const SFAX_RELEASE_FACTOR_FINGER = 5.0

export const SFAX_DACRON_BASE_ADJUSTMENT = 3
export const SFAX_DACRON_MAX_ADJUSTMENT = 5
export const SFAX_DACRON_DRAW_LENGTH_FLOOR = 14
export const SFAX_DACRON_DRAW_LENGTH_CEILING = 35
export const SFAX_DACRON_CURVE_DIVISOR = 21

export const SFAX_SHAFT_CATEGORY_BASE = 0.00421875
export const SFAX_SHAFT_CATEGORY_HUNTING = 0.01265625
export const SFAX_SHAFT_CATEGORY_TARGET = 0.02109375

export const SFAX_FOC_NOCK_OVERHANG = 0.5
export const SFAX_FOC_FRONT_MASS_DEPTH_MULTIPLIER = 0.75
export const SFAX_FOC_WRAP_OFFSET = 3
export const SFAX_FOC_FLETCH_DIVISOR = 3
export const SFAX_FOC_FLETCH_BASE_OFFSET = 1

export const SFAX_INSERT_DEPTHS = {
    default: 0.65,
    shallow: 0.75,
    halfOutsert: 1.25,
    fullOutsert: 1.5,
    extendedOutsert: 1.75,
} as const

// Chronograph should refine the SFAX target, not replace the model wholesale.
export const SFAX_CHRONOGRAPH_MIN_RATIO = 0.85
export const SFAX_CHRONOGRAPH_MAX_RATIO = 1.15

export const SFAX_DEFAULT_CAM_EFFICIENCY_FACTOR = 0.00000104

// Easton 2023 (verificado contra el PDF 301055-A): suelta con dedos = +5 lb
// de peso de arco. Sustituye a la curva SFAX en la rama finger, que no está
// anclada por ningún caso de referencia y degeneraba con letoff bajo/ausente.
export const EASTON_FINGER_RELEASE_LB = 5

// IBO típico de un compound de caza moderno; se usa como fallback con
// confianza "low" cuando el usuario no introduce IBO (antes producía spines
// sin sentido al propagar 0).
export const SFAX_DEFAULT_IBO_FALLBACK = 320

// === CAM FDR (Force-Draw Ratio) ===

export const CAM_FDR = {
    round: 0.35,
    medium: 0.45,
    aggressive: 0.55,
    speed: 0.65,
    max: 0.75,
} as const

// Conversión FDR -> libras equivalentes de carta: (FDR - medium) * 25 da
// round -2.5, aggressive +2.5, speed +5, max +7.5 (escala Easton, donde una
// clase entera de velocidad equivale a +5/+10 lb).
export const CAM_FDR_TO_LB = 25

// === NON-COMPOUND (CARTA EASTON HUNTING 2023) ===
// Ajuste log-lineal sobre los puntos medios de las 13 filas de la columna
// RECURVE de la carta (desviación máxima ~1.5%, dentro de la cuantización de
// celda): spine = BASE * exp(-SLOPE * E), con E en libras equivalentes.
export const RECURVE_SPINE_BASE = 0.7116
export const RECURVE_SPINE_SLOPE = 0.011285
export const RECURVE_REFERENCE_ARROW_LENGTH = 28
export const RECURVE_REFERENCE_POINT_WEIGHT = 100
export const RECURVE_REFERENCE_DRAW_LENGTH = 28
// Estructura diagonal de la carta: +1" de flecha equivale a +5 lb.
export const RECURVE_LENGTH_LB_PER_INCH = 5
// Regla Easton de puntas: ±3 lb por cada 25 gr respecto a 100 gr.
export const RECURVE_POINT_LB_PER_25GR = 3
// Regla Easton de inserts: sin ajuste hasta 25 gr; +3 lb por 25 gr extra.
export const RECURVE_INSERT_FREE_ALLOWANCE_GR = 25
// Un recurvo gana ~2.5 lb por pulgada de apertura sobre el marcado a 28".
export const RECURVE_DRAW_LENGTH_LB_PER_INCH = 2.5
// La columna recurvo de la carta asume cuerda tradicional (dacron); una
// cuerda de bajo estiramiento exige ~3 lb más de rigidez.
export const RECURVE_FASTFLIGHT_LB = 3
export const RECURVE_UNKNOWN_STRING_LB = 1.5
// Mapeo impreso en la carta: la columna LONGBOW va desplazada ~+20 lb
// respecto a la columna RECURVE en la misma fila de celdas.
export const TRADITIONAL_LONGBOW_LB_OFFSET = 20
export const RECURVE_MIN_EFFECTIVE_LB = 10
export const RECURVE_MAX_EFFECTIVE_LB = 120

// === CONFIDENCE INTERVAL WIDTHS ===
// Incertidumbre relativa por nivel de confianza (antes era fija ±3%/±2%
// aunque la confianza fuese "low").
export const CI_REQUIRED_UNCERTAINTY: { high: number; medium: number; low: number } = {
    high: 0.02,
    medium: 0.04,
    low: 0.07,
}
export const CI_DYNAMIC_UNCERTAINTY: { high: number; medium: number; low: number } = {
    high: 0.015,
    medium: 0.025,
    low: 0.04,
}

// === VELOCITY / ENERGY CONVERSION ===

export const K_FPS_CONVERSION = 546000
export const KINETIC_ENERGY_DIVISOR = 450240

// === MATCH TOLERANCE ===

export const MATCH_TOLERANCE = 0.10
export const MATCH_GOOD_MAX = 1 + MATCH_TOLERANCE
export const MATCH_GOOD_MIN = 1 - MATCH_TOLERANCE
export const MATCH_EXTREME_WEAK = 1.25
export const MATCH_EXTREME_STIFF = 0.75

// === MASS RATIO THRESHOLDS ===

export const GPP_MIN_SAFE = 4
export const GPP_MIN_RECOMMENDED = 5
export const GPP_MAX_RECOMMENDED = 8

export const MASS_RATIO_MIN_SAFE = 4
export const MASS_RATIO_MIN_RECOMMENDED = 5
export const MASS_RATIO_MAX_RECOMMENDED = 8

// === FOC / SPEED RECOMMENDATION THRESHOLDS ===

export const FOC_MIN_RECOMMENDED = 7
export const FOC_MAX_RECOMMENDED = 16
export const FOC_OPTIMAL_LOW = 13
export const FOC_OPTIMAL_HIGH = 15

export const VELOCITY_MIN_TARGET = 260
export const VELOCITY_MAX_SAFE = 340
export const VELOCITY_OPTIMAL_MIN = 280
export const VELOCITY_OPTIMAL_MAX = 320

// === TEMPERATURE CALIBRATION ===

export const TEMP_REFERENCE = 70
export const TEMP_SPINE_COEFFICIENT = 0.001
