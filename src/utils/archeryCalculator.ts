import {
    K_SPINE_CALIBRATION,
    K_FPS_CONVERSION,
    CAM_EFFICIENCY
} from '../constants'

export type SpineMatchStatus = 'weak' | 'good' | 'stiff'

export type SpineMatchResult = {
    spineRequired: number | null
    spineDynamic: number | null
    matchIndex: number | null
    status: SpineMatchStatus | null
    arrowTotalWeight: number
    foc: number | null
    calculatedFPS: number | null
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



// Función para calcular spine requerido basado en paradoja del arquero
function calculateRequiredSpine(peakForce: number, arrowLength: number): number {
    // El spine debe permitir la flexión necesaria alrededor del riser
    // Fórmula basada en la física de vigas: deflexión ∝ Force × Length³ / (3 × E × I)
    const spineRequired = K_SPINE_CALIBRATION * Math.sqrt(arrowLength / 28) * (70 / peakForce)

    return spineRequired
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

// Función para ajuste de peso de punta según tablas Easton
function calculatePointWeightAdjustment(pointWeight: number): number {
    if (pointWeight > 100) {
        const extraGrains = pointWeight - 100
        const increments25 = Math.floor(extraGrains / 25)
        return increments25 * 2 // +2 lbs equivalentes por cada 25 grains
    }
    return 0 // Sin ajuste para puntas ≤ 100 grains
}

// Función para calcular factor de wrap (vinilo decorativo)
function calculateWrapFactor(wrapWeight: number): number {
    if (wrapWeight > 0) {
        return 0.98 // -2% flexión para wraps
    }
    return 1.0
}

// Función para calcular apertura efectiva según Hattila
function calculateEffectiveDrawLength(drawLength: number): number {
    return Math.floor(drawLength)
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

// Función para calcular FOC (Front of Center)
function calculateFOC(
    shaftLength: number,
    pointWeight: number,
    insertWeight: number,
    shaftWeight: number,
    fletchWeight: number,
    nockWeight: number,
    wrapWeight: number,
    bushingPin: number
): number {
    // Longitud total aproximada (shaft + nock + point insert length)
    // Simplificación: Usamos shaftLength como base, asumiendo que el FOC se mide sobre la longitud del tubo
    // Fórmula estándar AMO: FOC(%) = [ (L/2 + (M_p*L + M_i*L - M_n*L - M_f*L) / M_total) / L ] * 100 ??
    // Fórmula simplificada de momentos:
    // Centro de gravedad (CG) desde el nock:
    // CG = Sum(Momentos) / PesoTotal

    const totalWeight = shaftWeight + pointWeight + insertWeight + fletchWeight + nockWeight + wrapWeight + bushingPin
    if (totalWeight === 0 || shaftLength === 0) return 0

    // Momentos respecto al nock (posición 0)
    // Asumimos:
    // - Nock: en 0
    // - Fletching: cerca del nock (aprox 1-2 pulgadas) -> Usamos 1.5"
    // - Wrap: cerca del nock (aprox 2-3 pulgadas) -> Usamos 2.5"
    // - Shaft: centro en L/2
    // - Bushing: en 0
    // - Insert: en L
    // - Point: en L (simplificación, realmente sobresale)

    const mNock = nockWeight * 0
    const mBushing = bushingPin * 0
    const mFletch = fletchWeight * 1.5
    const mWrap = wrapWeight * 2.5
    const mShaft = shaftWeight * (shaftLength / 2)
    const mInsert = insertWeight * shaftLength
    const mPoint = pointWeight * shaftLength

    const sumMoments = mNock + mBushing + mFletch + mWrap + mShaft + mInsert + mPoint
    const centerOfGravity = sumMoments / totalWeight

    const geometricCenter = shaftLength / 2

    const foc = ((centerOfGravity - geometricCenter) / shaftLength) * 100

    return foc
}

export function calculateSpineMatch(
    bow: BowSpecs,
    arrow: ArrowSpecs,
    stringWeights: StringWeights,
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

    const peepWeight = toNumber(stringWeights.peep)
    const dLoopWeight = toNumber(stringWeights.dLoop)
    const nockPointWeight = toNumber(stringWeights.nockPoint)
    const silencersWeight = toNumber(stringWeights.silencers)
    const silencerDfcWeight = toNumber(stringWeights.silencerDfc)
    const releaseType = stringWeights.releaseType

    // --- 2. CÁLCULOS INTERMEDIOS ---

    // Guard Clause
    if (!drawWeight || !shaftLength || !staticSpine || !iboVelocity || !drawLength || !braceHeight) {
        return {
            spineRequired: null,
            spineDynamic: null,
            matchIndex: null,
            status: null,
            arrowTotalWeight: 0,
            foc: null,
            calculatedFPS: null,
            recommendations,
            warnings,
        }
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
    if (arrowTotalWeight === 0 || powerStroke === 0) {
        return {
            spineRequired: null,
            spineDynamic: null,
            matchIndex: null,
            status: null,
            arrowTotalWeight: arrowTotalWeight,
            foc: null,
            calculatedFPS: null,
            recommendations,
            warnings,
        }
    }
    // === PARTE A: MODELO DE ENERGÍA ALMACENADA ===
    const effectiveDrawLength = calculateEffectiveDrawLength(drawLength)
    const storedEnergy = calculateStoredEnergy(drawWeight, effectiveDrawLength, braceHeight, percentLetoff, camAggressiveness)
    const bowEfficiency = calculateBowEfficiency(braceHeight, iboVelocity, drawLength)
    const availableEnergy = storedEnergy * bowEfficiency

    // === PARTE B: CÁLCULO DE VELOCIDAD BASADO EN ENERGÍA ===
    const transferEfficiency = calculateTransferEfficiency(arrowTotalWeight, drawWeight)
    const stringMaterialFactor = calculateStringMaterialFactor(stringWeights)
    const pointWeightAdjustment = calculatePointWeightAdjustment(pointWeight)

    const effectiveDrawWeight = drawWeight + pointWeightAdjustment

    const kineticEnergy = availableEnergy * transferEfficiency * stringMaterialFactor

    const calculatedFPS = Math.sqrt((kineticEnergy * K_FPS_CONVERSION) / arrowTotalWeight)

    // Ajustes finos
    let finalFPS = calculatedFPS
    if (isFinite(calculatedFPS)) {
        finalFPS += (axleToAxle - 35) * 0.5
        finalFPS -= totalStringWeight / 6
        if (releaseType.includes('Pre')) {
            finalFPS += 2
        }
    }

    // === PARTE C: SPINE DINÁMICO REQUERIDO (SDR) ===
    const massRatio = arrowTotalWeight / effectiveDrawWeight
    // Base requirement based on Draw Weight and Arrow Length
    const spineRequiredBase = calculateRequiredSpine(effectiveDrawWeight, shaftLength)

    // === PARTE D: SPINE DINÁMICO (TARGET) ===
    // This is the spine the arrow SHOULD have to match the setup perfectly.
    // Factors adjust this requirement.

    // Point Weight Factor: Heavier point = Arrow acts weaker = Need Stiffer Spine (Lower Number)
    // 100gr is standard. 150gr is +50gr.
    // If arrow acts weaker, we need to compensate with a stiffer spine.
    // So factor should be < 1.0 for heavy points.
    const pointWeightFactor = 1.0

    // Dynamic Flex Factor (Calibration)
    const calibrationFactor = 1.0

    const fletchingFactor = calculateFletchingFactor(fletchQuantity, weightEach)
    const releaseFactor = calculateReleaseFactor(releaseType)
    const wrapFactor = calculateWrapFactor(wrapWeight)

    // Calculate Dynamic Spine Requirement
    // We start with the static requirement and apply factors that shift the NEED.
    // Note: This is different from "Effective Spine" of the arrow.
    const spineDynamic = spineRequiredBase * pointWeightFactor * fletchingFactor * releaseFactor * wrapFactor * calibrationFactor

    // === PARTE E: FOC ===
    const foc = calculateFOC(shaftLength, pointWeight, insertWeight, shaftWeight, fletchWeight, nockWeight, wrapWeight, bushingPin)

    // === PARTE F: COMPARACIÓN Y RESULTADO ===
    // Match Index = Static Spine / Dynamic Requirement
    // If Static (0.400) > Dynamic (0.382) -> Index > 1 -> WEAK (Arrow is too flexible for the need)
    // If Static (0.400) < Dynamic (0.406) -> Index < 1 -> STIFF (Arrow is too stiff for the need)
    const matchIndex = staticSpine / spineDynamic

    let status: SpineMatchStatus | null = null
    if (matchIndex != null && isFinite(matchIndex)) {
        if (matchIndex > 1.03) { // Tolerance window
            status = 'weak'
            recommendations.push('Considera una flecha con spine más rígido (número más bajo)')
        } else if (matchIndex < 0.97) {
            status = 'stiff'
            recommendations.push('Considera una flecha con spine más flexible (número más alto)')
        } else {
            status = 'good'
        }
    }

    // === PARTE G: ADVERTENCIAS Y RECOMENDACIONES ===
    if (isFinite(massRatio)) {
        if (massRatio < 4) {
            warnings.push('¡PELIGRO! Flecha muy ligera - puede dañar el arco o romperse durante el disparo')
        } else if (massRatio < 5) {
            warnings.push('Flecha ligera - considere aumentar el peso para mayor seguridad del arco')
        }
    }

    if (isFinite(matchIndex)) {
        if (matchIndex > 1.25) {
            warnings.push('¡PELIGRO! Flecha demasiado flexible - riesgo de fractura y daño al arco')
        } else if (matchIndex < 0.75) {
            warnings.push('Flecha excesivamente rígida - puede causar vuelo errático y golpes en el arco')
        }
    }

    if (isFinite(finalFPS)) {
        if (finalFPS > 340) {
            warnings.push('Velocidad extrema - asegúrese de que su equipo pueda manejar estas fuerzas')
        }
    }

    if (isFinite(finalFPS)) {
        if (finalFPS < 260) {
            recommendations.push('La velocidad es baja. Considera reducir el peso de la flecha o optimizar la eficiencia del arco.')
        } else if (finalFPS > 320) {
            recommendations.push('La velocidad es alta. Asegúrate de que tu equipo pueda manejar estas fuerzas.')
        }
    }

    if (isFinite(massRatio)) {
        if (massRatio < 5) {
            recommendations.push('La flecha es muy ligera para la potencia. Considera aumentar el peso para mejor eficiencia.')
        } else if (massRatio > 8) {
            recommendations.push('La flecha es muy pesada para la potencia. Considera reducir el peso para mejor velocidad.')
        }
    }

    // FOC Recommendations
    if (foc > 0) {
        if (foc < 7) {
            recommendations.push('FOC bajo (<7%). La flecha puede ser inestable a largas distancias. Aumenta el peso en punta.')
        } else if (foc > 16) {
            recommendations.push('FOC alto (>16%). Bueno para caza/penetración, pero la flecha caerá más rápido.')
        }
    }

    const edgeCaseRecommendation = getEdgeCaseRecommendation(drawWeight)
    if (edgeCaseRecommendation !== "Spine recomendado para configuración actual" && status !== 'weak') {
        recommendations.push(edgeCaseRecommendation)
    }

    return {
        spineRequired: isFinite(spineRequiredBase) ? spineRequiredBase : null,
        spineDynamic: isFinite(spineDynamic) ? spineDynamic : null,
        matchIndex: isFinite(matchIndex) ? matchIndex : null,
        status,
        arrowTotalWeight,
        foc: isFinite(foc) ? foc : null,
        calculatedFPS: isFinite(finalFPS) ? finalFPS : null,
        recommendations,
        warnings,
    }
}
