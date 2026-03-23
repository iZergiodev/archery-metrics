import {
    K_SPINE_CALIBRATION,
    K_RECURVE_CALIBRATION,
    K_FPS_CONVERSION,
    CAM_EFFICIENCY,
    MATCH_GOOD_MAX,
    MATCH_GOOD_MIN,
    MATCH_EXTREME_WEAK,
    MATCH_EXTREME_STIFF,
    GPP_MIN_SAFE,
    GPP_MIN_RECOMMENDED,
    GPP_MAX_RECOMMENDED,
    FOC_MIN_RECOMMENDED,
    FOC_MAX_RECOMMENDED,
    VELOCITY_MIN_TARGET,
    VELOCITY_MAX_SAFE,
    VELOCITY_OPTIMAL_MAX,
    TEMP_REFERENCE,
    TEMP_SPINE_COEFFICIENT,
    COMPONENT_POSITIONS,
    ARCHERY_TYPE,
    STATIC_SPINE_REFERENCE_LENGTH,
    DYNAMIC_SPINE_LENGTH_EXPONENT,
    FRONT_MASS_REFERENCE,
    FRONT_MASS_GRAINS_STEP,
    FRONT_MASS_SENSITIVITY,
    COMPOUND_REQUIRED_SPINE_DRAW_WEIGHT_EXPONENT,
    COMPOUND_REQUIRED_SPINE_REFERENCE_AVAILABLE_ENERGY,
    COMPOUND_REQUIRED_SPINE_ENERGY_EXPONENT,
    type ArcheryType,
} from '../constants'

export type SpineMatchStatus = 'weak' | 'good' | 'stiff' | 'unknown'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type ConfidenceInterval = {
    value: number
    lower: number
    upper: number
    confidence: ConfidenceLevel
}

export type SpineMatchResult = {
    // Core results
    spineRequired: number | null
    spineDynamic: number | null
    matchIndex: number | null
    status: SpineMatchStatus | null
    arrowTotalWeight: number
    foc: number | null
    calculatedFPS: number | null

    // Confidence intervals
    spineRequiredCI: ConfidenceInterval | null
    spineDynamicCI: ConfidenceInterval | null
    matchIndexCI: ConfidenceInterval | null

    // Metadata
    temperature?: number
    archeryType: ArcheryType
    recommendations: string[]
    warnings: string[]
}

export type BowSpecs = {
    drawWeight: string
    drawLength: string
    iboVelocity: string
    braceHeight: string
    axleToAxle: string
    percentLetoff: string
    camAggressiveness?: string // 'soft' | 'medium' | 'hard'
    archeryType?: ArcheryType
}

export type ArrowSpecs = {
    shaftLength: string
    pointWeight: string
    insertWeight: string
    shaftGpi: string
    fletchQuantity: string
    weightEach: string
    wrapWeight: string
    nockWeight: string
    bushingPin: string
    staticSpine: string
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

const toNumber = (value: string) =>
    value.trim() === '' ? 0 : Number(value.replace(',', '.'))

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

// Helper to create confidence interval
function createConfidenceInterval(
    value: number,
    uncertaintyPercent: number,
    confidence: ConfidenceLevel
): ConfidenceInterval {
    const uncertainty = value * uncertaintyPercent
    return {
        value,
        lower: value - uncertainty,
        upper: value + uncertainty,
        confidence,
    }
}

// Confidence based on data completeness
function calculateConfidenceLevel(
    hasAllInputs: boolean,
    hasTemperature: boolean,
    hasPreciseMeasurements: boolean
): ConfidenceLevel {
    if (hasAllInputs && hasTemperature && hasPreciseMeasurements) return 'high'
    if (hasAllInputs) return 'medium'
    return 'low'
}

// Función para calcular energía almacenada basada en curva fuerza-apertura
function calculateStoredEnergy(
    drawWeight: number,
    drawLength: number,
    braceHeight: number,
    percentLetoff: number,
    camAggressiveness: string = 'medium'
): number {
    // Modelo simplificado de curva fuerza-apertura para arco compuesto
    const powerStroke = drawLength - braceHeight

    // Seleccionar eficiencia base según el tipo de polea
    const forceDrawRatioBase = CAM_EFFICIENCY[camAggressiveness as keyof typeof CAM_EFFICIENCY] || CAM_EFFICIENCY.medium

    const letOffRatio = clamp(1 - (percentLetoff / 100) * 0.35, 0.7, 1.05)
    const forceDrawRatio = forceDrawRatioBase * letOffRatio
    const storedEnergyInInchLbs = drawWeight * powerStroke * forceDrawRatio
    return storedEnergyInInchLbs / 12 // Convertir a foot-pounds
}

// Función para calcular eficiencia del arco
function calculateBowEfficiency(braceHeight: number, iboVelocity: number, drawLength: number): number {
    // Eficiencia base: 0.75-0.85 para arcos compuestos modernos
    let efficiency = 0.80

    // Brace height más largo = mayor eficiencia
    efficiency += (braceHeight - 7) * 0.01

    // IBO más alto = mejor diseño de levas = mayor eficiencia
    efficiency += (iboVelocity - 330) * 0.0001

    // Draw length largo (>30") = mayor tiempo de aceleración = mayor eficiencia
    if (drawLength > 30) {
        efficiency += (drawLength - 30) * 0.02
    }

    return Math.max(0.70, Math.min(0.90, efficiency))
}



function calculateCompoundRequiredSpine(
    drawWeight: number,
    arrowLength: number,
    availableEnergy: number,
): number {
    const drawWeightFactor = Math.pow(drawWeight / 70, COMPOUND_REQUIRED_SPINE_DRAW_WEIGHT_EXPONENT)
    const energyFactor = Math.pow(
        availableEnergy / COMPOUND_REQUIRED_SPINE_REFERENCE_AVAILABLE_ENERGY,
        COMPOUND_REQUIRED_SPINE_ENERGY_EXPONENT,
    )

    // The base chart trend still anchors the model, but available energy adds
    // explicit sensitivity to draw length, brace height, let-off, IBO and cams.
    return K_SPINE_CALIBRATION * drawWeightFactor * Math.sqrt(arrowLength / 28) * energyFactor
}

// Función para calcular factor de emplumado
function calculateFletchingFactor(fletchQuantity: number, weightEach: number): number {
    const baseFactor = 1.0
    const quantityFactor = (fletchQuantity - 3) * 0.02
    const weightFactor = (weightEach - 8) * 0.005
    return baseFactor - quantityFactor - weightFactor
}

// Función para calcular factor de método de suelta
function calculateReleaseFactor(releaseType: string): number {
    if (releaseType.toLowerCase().includes('manual') || releaseType.toLowerCase().includes('fingers')) {
        return 1.12 // 12% más flexión para sueltas manuales
    } else if (releaseType.toLowerCase().includes('pre')) {
        return 0.95 // Pre-gate son muy consistentes
    }
    return 1.0 // Base para liberaciones mecánicas estándar
}



// Función para calcular factor de material de cuerda
function calculateStringMaterialFactor(stringWeights: { silencers: string, silencerDfc: string, stringMaterial: 'dacron' | 'fastflight' | 'unknown' }): number {
    switch (stringWeights.stringMaterial) {
        case 'dacron':
            return 0.92 // -8% eficiencia para Dacrón (equivalente a -4 lbs)
        case 'fastflight':
            return 1.0 // Base para FastFlight
        case 'unknown':
        default:
            // Mantener compatibilidad con versiones anteriores: usar silenciador como indicador
            const silencerDfcWeight = toNumber(stringWeights.silencerDfc)
            return silencerDfcWeight > 0 ? 0.92 : 1.0
    }
}

// Un eje más largo actúa más débil. Usamos un exponente efectivo para
// introducir la tendencia estructural sin duplicar toda la dependencia de
// longitud que ya existe en el spine requerido.
function calculateLengthAdjustedSpineFactor(shaftLength: number): number {
    const factor = Math.pow(shaftLength / STATIC_SPINE_REFERENCE_LENGTH, DYNAMIC_SPINE_LENGTH_EXPONENT)
    return clamp(factor, 0.75, 1.35)
}

// Basado en guías prácticas de spine: aumentar el peso frontal debilita la
// reacción dinámica; reducirlo la endurece.
function calculateFrontMassFactor(pointWeight: number, insertWeight: number): number {
    const totalFrontWeight = pointWeight + insertWeight
    const deviation = totalFrontWeight - FRONT_MASS_REFERENCE
    const factor = 1 + (deviation / FRONT_MASS_GRAINS_STEP) * FRONT_MASS_SENSITIVITY

    return clamp(factor, 0.75, 1.35)
}

// Función para calcular factor de wrap (vinilo decorativo)
function calculateWrapFactor(wrapWeight: number): number {
    if (wrapWeight > 0) {
        return 0.98 // -2% flexión para wraps
    }
    return 1.0
}

// Función para obtener recomendaciones de casos límite
function getEdgeCaseRecommendation(drawWeight: number): string {
    if (drawWeight % 10 > 4 && drawWeight % 10 < 6) {
        return "Considerar spine más rígido si planea aumentar potencia en el futuro"
    }
    return "Spine recomendado para configuración actual"
}

// Función para calcular eficiencia de transferencia de masa
function calculateTransferEfficiency(arrowMass: number, drawWeight: number): number {
    const massRatio = arrowMass / drawWeight
    let efficiency = 1.0

    if (massRatio < 4) {
        efficiency = 0.85 // Flecha muy ligera = menor eficiencia
    } else if (massRatio > 8) {
        efficiency = 0.90 // Flecha muy pesada = menor eficiencia
    } else {
        efficiency = 0.95 // Rango óptimo
        // Slight boost for heavier arrows (momentum efficiency)
        if (massRatio > 5.5) {
            efficiency += (massRatio - 5.5) * 0.015
        }
    }

    return Math.min(efficiency, 0.98)
}

// Función para calcular FOC (Front of Center) con posiciones configurables
function calculateFOC(
    shaftLength: number,
    pointWeight: number,
    insertWeight: number,
    shaftWeight: number,
    fletchWeight: number,
    nockWeight: number,
    wrapWeight: number,
    bushingPin: number,
    positions: typeof COMPONENT_POSITIONS = COMPONENT_POSITIONS
): number {
    const totalWeight = shaftWeight + pointWeight + insertWeight + fletchWeight + nockWeight + wrapWeight + bushingPin
    if (totalWeight === 0 || shaftLength === 0) return 0

    // Momentos respecto al nock usando posiciones configurables
    const mNock = nockWeight * 0
    const mBushing = bushingPin * 0
    const mFletch = fletchWeight * positions.fletchCenter
    const mWrap = wrapWeight * positions.wrapCenter
    const mShaft = shaftWeight * (shaftLength * positions.shaftCenterRatio)
    const mInsert = insertWeight * shaftLength
    const mPoint = pointWeight * shaftLength

    const sumMoments = mNock + mBushing + mFletch + mWrap + mShaft + mInsert + mPoint
    const centerOfGravity = sumMoments / totalWeight

    const geometricCenter = shaftLength / 2

    const foc = ((centerOfGravity - geometricCenter) / shaftLength) * 100

    return foc
}

// Función para corregir spine por temperatura
function temperatureCorrection(
    spine: number,
    temperatureF: number,
    shaftMaterial: string = 'carbon'
): number {
    // Solo afecta significativamente a flechas de carbono
    if (shaftMaterial !== 'carbon') return spine

    const tempDiff = temperatureF - TEMP_REFERENCE
    const spineChange = tempDiff * TEMP_SPINE_COEFFICIENT

    return spine * (1 + spineChange)
}

// Función para calcular spine requerido para recurvo/tradicional
// Modelo de ley de potencias calibrado contra tablas de spine para recurvo
// Referencia: 40# @ 28" con flecha de 28" → spine 0.500
function calculateRecurveSpine(drawWeight: number, drawLength: number, arrowLength: number): number {
    // Factor de apertura: mayor apertura = más energía = spine más rígido necesario
    const drawLengthAdjust = Math.pow(drawLength / 28, 0.3)

    const spineRequired = K_RECURVE_CALIBRATION *
        Math.pow(drawWeight / 40, -0.85) *
        Math.sqrt(arrowLength / 28) /
        drawLengthAdjust

    return clamp(spineRequired, 0.200, 1.200)
}

// Función para calcular energía almacenada en recurvo (curva lineal)
function calculateRecurveStoredEnergy(
    drawWeight: number,
    drawLength: number,
    braceHeight: number
): number {
    // Para recurvo, la curva fuerza-apertura es aproximadamente lineal
    const powerStroke = drawLength - braceHeight
    const avgForce = drawWeight * 0.5 // Fuerza promedio ~50% del pico
    return (avgForce * powerStroke) / 12 // foot-pounds
}

// Función para obtener el tipo de arco efectivo
function getEffectiveArcheryType(type: ArcheryType | undefined): ArcheryType {
    return type || ARCHERY_TYPE.COMPOUND
}

export function calculateSpineMatch(
    bow: BowSpecs,
    arrow: ArrowSpecs,
    stringWeights: StringWeights,
    temperatureF?: number,
): SpineMatchResult {
    const recommendations: string[] = []
    const warnings: string[] = []

    // --- 1. PARSEO DE DATOS ---
    const drawWeight = toNumber(bow.drawWeight)
    const drawLength = toNumber(bow.drawLength)
    const iboVelocity = toNumber(bow.iboVelocity)
    const braceHeight = toNumber(bow.braceHeight)
    const axleToAxle = toNumber(bow.axleToAxle)
    const percentLetoff = toNumber(bow.percentLetoff)
    const camAggressiveness = bow.camAggressiveness || 'medium'
    const archeryType = getEffectiveArcheryType(bow.archeryType)

    const shaftLength = toNumber(arrow.shaftLength)
    const pointWeight = toNumber(arrow.pointWeight)
    const insertWeight = toNumber(arrow.insertWeight)
    const shaftGpi = toNumber(arrow.shaftGpi)
    const fletchQuantity = toNumber(arrow.fletchQuantity)
    const weightEach = toNumber(arrow.weightEach)
    const wrapWeight = toNumber(arrow.wrapWeight)
    const nockWeight = toNumber(arrow.nockWeight)
    const bushingPin = toNumber(arrow.bushingPin)
    const staticSpine = toNumber(arrow.staticSpine)
    const shaftMaterial = arrow.shaftMaterial || 'carbon'

    const peepWeight = toNumber(stringWeights.peep)
    const dLoopWeight = toNumber(stringWeights.dLoop)
    const nockPointWeight = toNumber(stringWeights.nockPoint)
    const silencersWeight = toNumber(stringWeights.silencers)
    const silencerDfcWeight = toNumber(stringWeights.silencerDfc)
    const releaseType = stringWeights.releaseType

    // --- 2. CÁLCULOS INTERMEDIOS ---

    // Guard Clause
    const hasAllInputs = drawWeight > 0 && shaftLength > 0 && staticSpine > 0 &&
        drawLength > 0 && braceHeight > 0

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

    // Peso total de la flecha
    const shaftWeight = shaftLength * shaftGpi
    const fletchWeight = fletchQuantity * weightEach
    const arrowTotalWeight =
        shaftWeight +
        pointWeight +
        insertWeight +
        fletchWeight +
        wrapWeight +
        nockWeight +
        bushingPin

    // Peso total en la cuerda
    const totalStringWeight = peepWeight + dLoopWeight + nockPointWeight + silencersWeight + silencerDfcWeight

    // Validación
    const powerStroke = drawLength - braceHeight
    if (arrowTotalWeight === 0) {
        recommendations.push('Falta peso de flecha para calcular el resultado. Añade al menos el GPI del eje y/o el peso de la punta.')
        return createEmptyResult(archeryType, recommendations, warnings)
    }

    if (powerStroke <= 0) {
        warnings.push('La longitud de tiro debe ser mayor que el brace height para poder calcular el disparo.')
        return createEmptyResult(archeryType, recommendations, warnings)
    }

    // === PARTE A: MODELO DE ENERGÍA ALMACENADA ===
    let storedEnergy: number
    let bowEfficiency: number

    if (archeryType === ARCHERY_TYPE.COMPOUND) {
        storedEnergy = calculateStoredEnergy(drawWeight, drawLength, braceHeight, percentLetoff, camAggressiveness)
        bowEfficiency = calculateBowEfficiency(braceHeight, iboVelocity, drawLength)
    } else {
        // Recurvo/Traditional - different physics
        storedEnergy = calculateRecurveStoredEnergy(drawWeight, drawLength, braceHeight)
        bowEfficiency = 0.75 // Fixed efficiency for recurvo
    }

    const availableEnergy = storedEnergy * bowEfficiency

    // === PARTE B: CÁLCULO DE VELOCIDAD BASADO EN ENERGÍA ===
    const transferEfficiency = calculateTransferEfficiency(arrowTotalWeight, drawWeight)
    const stringMaterialFactor = calculateStringMaterialFactor(stringWeights)

    const kineticEnergy = availableEnergy * transferEfficiency * stringMaterialFactor

    let calculatedFPS = Math.sqrt((kineticEnergy * K_FPS_CONVERSION) / arrowTotalWeight)

    // Ajustes finos
    let finalFPS = calculatedFPS
    if (isFinite(calculatedFPS)) {
        // ATA más corto = arco más rápido, ATA más largo = más lento
        finalFPS -= (axleToAxle - 35) * 0.5
        finalFPS -= totalStringWeight / 6
        if (releaseType.includes('Pre')) {
            finalFPS += 2
        }
    }

    // === PARTE C: FOC (necesario para cálculos posteriores) ===
    const foc = calculateFOC(shaftLength, pointWeight, insertWeight, shaftWeight, fletchWeight, nockWeight, wrapWeight, bushingPin)

    // === PARTE D: SPINE DINÁMICO REQUERIDO (SDR) ===
    // GPP usa drawWeight real del arco (no ajustado por peso de punta)
    const massRatio = arrowTotalWeight / drawWeight
    let spineRequiredBase: number

    if (archeryType === ARCHERY_TYPE.COMPOUND) {
        // Spine requerido basado solo en specs del arco (drawWeight + longitud de flecha)
        // El spine requerido responde a la severidad real del lanzamiento,
        // no solo al pico de libras del arco.
        spineRequiredBase = calculateCompoundRequiredSpine(drawWeight, shaftLength, availableEnergy)
    } else {
        spineRequiredBase = calculateRecurveSpine(drawWeight, drawLength, shaftLength)
    }

    // === PARTE E: SPINE EFECTIVO DE LA FLECHA ===
    const lengthAdjustedSpineFactor = calculateLengthAdjustedSpineFactor(shaftLength)
    const frontMassFactor = calculateFrontMassFactor(pointWeight, insertWeight)

    const fletchingFactor = calculateFletchingFactor(fletchQuantity, weightEach)
    const releaseFactor = calculateReleaseFactor(releaseType)
    const wrapFactor = calculateWrapFactor(wrapWeight)

    // Spine Dinámico (Efectivo)
    let spineDynamic = staticSpine * lengthAdjustedSpineFactor * frontMassFactor * fletchingFactor * releaseFactor * wrapFactor

    // Aplicar corrección por temperatura si está disponible
    if (temperatureF !== undefined) {
        spineDynamic = temperatureCorrection(spineDynamic, temperatureF, shaftMaterial)
    }

    // === PARTE F: COMPARACIÓN Y RESULTADO ===
    const matchIndex = spineDynamic / spineRequiredBase

    let status: SpineMatchStatus | null = null
    if (matchIndex != null && isFinite(matchIndex)) {
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

    // === PARTE G: ADVERTENCIAS Y RECOMENDACIONES ===
    if (isFinite(massRatio)) {
        if (massRatio < GPP_MIN_SAFE) {
            warnings.push('¡PELIGRO! Flecha muy ligera - puede dañar el arco o romperse durante el disparo')
        } else if (massRatio < GPP_MIN_RECOMMENDED) {
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

    if (isFinite(finalFPS)) {
        if (finalFPS > VELOCITY_MAX_SAFE) {
            warnings.push('Velocidad extrema - asegúrese de que su equipo pueda manejar estas fuerzas')
        }
    }

    if (isFinite(finalFPS)) {
        if (finalFPS < VELOCITY_MIN_TARGET) {
            recommendations.push('La velocidad es baja. Considera reducir el peso de la flecha o optimizar la eficiencia del arco.')
        } else if (finalFPS > VELOCITY_OPTIMAL_MAX) {
            recommendations.push('La velocidad es alta. Asegúrate de que tu equipo pueda manejar estas fuerzas.')
        }
    }

    if (isFinite(massRatio)) {
        if (massRatio < GPP_MIN_RECOMMENDED) {
            recommendations.push('La flecha es muy ligera para la potencia. Considera aumentar el peso para mejor eficiencia.')
        } else if (massRatio > GPP_MAX_RECOMMENDED) {
            recommendations.push('La flecha es muy pesada para la potencia. Considera reducir el peso para mejor velocidad.')
        }
    }

    // FOC Recommendations
    if (foc > 0) {
        if (foc < FOC_MIN_RECOMMENDED) {
            recommendations.push(`FOC bajo (<${FOC_MIN_RECOMMENDED}%). La flecha puede ser inestable a largas distancias. Aumenta el peso en punta.`)
        } else if (foc > FOC_MAX_RECOMMENDED) {
            recommendations.push(`FOC alto (>${FOC_MAX_RECOMMENDED}%). Bueno para caza/penetración, pero la flecha caerá más rápido.`)
        }
    }

    // Temperature recommendation
    if (temperatureF !== undefined && Math.abs(temperatureF - TEMP_REFERENCE) > 20) {
        const direction = temperatureF > TEMP_REFERENCE ? 'más' : 'menos'
        recommendations.push(`Temperatura ${direction} flexible. Considera ajustar el spine ${temperatureF > TEMP_REFERENCE ? 'más rígido' : 'más flexible'}.`)
    }

    const edgeCaseRecommendation = getEdgeCaseRecommendation(drawWeight)
    if (edgeCaseRecommendation !== "Spine recomendado para configuración actual" && status !== 'weak') {
        recommendations.push(edgeCaseRecommendation)
    }

    // Calcular niveles de confianza
    const hasPreciseMeasurements = shaftGpi > 0 && pointWeight > 0 && insertWeight > 0
    const confidence = calculateConfidenceLevel(hasAllInputs, temperatureF !== undefined, hasPreciseMeasurements)

    return {
        spineRequired: isFinite(spineRequiredBase) ? spineRequiredBase : null,
        spineDynamic: isFinite(spineDynamic) ? spineDynamic : null,
        matchIndex: isFinite(matchIndex) ? matchIndex : null,
        status,
        arrowTotalWeight,
        foc: isFinite(foc) ? foc : null,
        calculatedFPS: isFinite(finalFPS) ? finalFPS : null,
        spineRequiredCI: isFinite(spineRequiredBase) ? createConfidenceInterval(spineRequiredBase, 0.05, confidence) : null,
        spineDynamicCI: isFinite(spineDynamic) ? createConfidenceInterval(spineDynamic, 0.08, confidence) : null,
        matchIndexCI: isFinite(matchIndex) ? createConfidenceInterval(matchIndex, 0.10, confidence) : null,
        temperature: temperatureF,
        archeryType,
        recommendations,
        warnings,
    }
}

// Helper function for empty results
function createEmptyResult(
    archeryType: ArcheryType,
    recommendations: string[],
    warnings: string[]
): SpineMatchResult {
    return {
        spineRequired: null,
        spineDynamic: null,
        matchIndex: null,
        status: null,
        arrowTotalWeight: 0,
        foc: null,
        calculatedFPS: null,
        spineRequiredCI: null,
        spineDynamicCI: null,
        matchIndexCI: null,
        archeryType,
        recommendations,
        warnings,
    }
}
