import { useMemo, useState } from 'react'
import { useI18n } from './i18n.tsx'

type SpineMatchStatus = 'weak' | 'good' | 'stiff'

type SpineMatchResult = {
  spineRequired: number | null
  spineDynamic: number | null
  matchIndex: number | null
  status: SpineMatchStatus | null
  arrowTotalWeight: number
  calculatedFPS: number | null
  recommendations: string[]
  warnings: string[]
}

function calculateSpineMatch(
  bow: {
    drawWeight: string
    drawLength: string
    iboVelocity: string
    braceHeight: string
    axleToAxle: string
    percentLetoff: string
  },
  arrow: {
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
  },
  stringWeights: {
    peep: string
    dLoop: string
    nockPoint: string
    silencers: string
    silencerDfc: string
    releaseType: string
    stringMaterial: 'dacron' | 'fastflight' | 'unknown'
  },
): SpineMatchResult {
  // ============================================================================
  // GUÍA DE CALIBRACIÓN DEL MODELO
  // ============================================================================
  // Este modelo utiliza dos constantes de calibración empíricas que pueden
  // ajustarse basándose en datos del mundo real:
  //
  // 1. K_SPINE_CALIBRATION (línea 226)
  //    - Controla el spine requerido calculado
  //    - Valor actual: 0.5
  //    - Calibrar contra: Tablas de fabricantes (Easton, Gold Tip, etc.)
  //
  // 2. K_DYNAMIC_FLEX_CALIBRATION (línea 181)
  //    - Controla cuánto difiere el spine dinámico del estático
  //    - Valor actual: 10000
  //    - Calibrar contra: Resultados de tiro reales y ajuste fino
  //
  // Para calibrar el modelo:
  // a) Recopilar datos de configuraciones conocidas que funcionan bien
  // b) Comparar predicciones del modelo vs. realidad
  // c) Ajustar constantes iterativamente
  // d) Validar con nuevos casos de prueba
  // ============================================================================

  const toNumber = (value: string) =>
    value.trim() === '' ? 0 : Number(value.replace(',', '.'))

  const recommendations: string[] = []
  const warnings: string[] = []

  // --- 1. PARSEO DE DATOS ---

  console.log('=== DEBUG INPUTS ===')
  console.log('Bow inputs:', bow)
  console.log('Arrow inputs:', arrow)
  console.log('String weights:', stringWeights)

  // Especificaciones del Arco
  const drawWeight = toNumber(bow.drawWeight)
  const drawLength = toNumber(bow.drawLength)
  const iboVelocity = toNumber(bow.iboVelocity)
  const braceHeight = toNumber(bow.braceHeight)
  const axleToAxle = toNumber(bow.axleToAxle)

  // Especificaciones de la Flecha
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

  // Pesos en la cuerda
  const peepWeight = toNumber(stringWeights.peep)
  const dLoopWeight = toNumber(stringWeights.dLoop)
  const nockPointWeight = toNumber(stringWeights.nockPoint)
  const silencersWeight = toNumber(stringWeights.silencers)
  const silencerDfcWeight = toNumber(stringWeights.silencerDfc)
  const releaseType = stringWeights.releaseType

  // --- 2. CÁLCULOS INTERMEDIOS ---

  // Guard Clause: Si faltan datos clave, salimos.
  if (!drawWeight || !shaftLength || !staticSpine || !iboVelocity || !drawLength || !braceHeight) {
    return {
      spineRequired: null,
      spineDynamic: null,
      matchIndex: null,
      status: null,
      arrowTotalWeight: 0,
      calculatedFPS: null,
      recommendations,
      warnings,
    }
  }

  // --- 3. CÁLCULOS INTERMEDIOS ---

  // Peso total de la flecha (Total Arrow Weight - TAW)
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

  // Peso total en la cuerda (Total String Weight - TSW)
  const totalStringWeight = peepWeight + dLoopWeight + nockPointWeight + silencersWeight + silencerDfcWeight

  // Validación adicional: Prevenir división por cero
  const powerStroke = drawLength - braceHeight
  console.log('Debug - arrowTotalWeight:', arrowTotalWeight, 'powerStroke:', powerStroke)
  console.log('Debug - drawLength:', drawLength, 'braceHeight:', braceHeight)
  console.log('Debug - shaftGpi:', shaftGpi, 'shaftLength:', shaftLength)

  if (arrowTotalWeight === 0 || powerStroke === 0) {
    console.log('Validation triggered - returning null values')
    return {
      spineRequired: null,
      spineDynamic: null,
      matchIndex: null,
      status: null,
      arrowTotalWeight: arrowTotalWeight,
      calculatedFPS: null,
      recommendations,
      warnings,
    }
  }

  // --- 3. MODELOS FÍSICOS MEJORADOS ---

  // Función para calcular energía almacenada basada en curva fuerza-apertura
  function calculateStoredEnergy(drawWeight: number, drawLength: number, braceHeight: number): number {
    // Modelo simplificado de curva fuerza-apertura para arco compuesto
    // La energía es el área bajo la curva: ~0.85 × drawWeight × drawLength para compuestos
    const powerStroke = drawLength - braceHeight
    const forceDrawRatio = 0.85 // Ratio típico para arcos compuestos
    const storedEnergyInInchLbs = drawWeight * powerStroke * forceDrawRatio
    return storedEnergyInInchLbs / 12 // Convertir a foot-pounds
  }

  // Función para calcular eficiencia del arco
  function calculateBowEfficiency(braceHeight: number, iboVelocity: number): number {
    // Eficiencia base: 0.75-0.85 para arcos compuestos modernos
    let efficiency = 0.80

    // Brace height más largo = mayor eficiencia
    efficiency += (braceHeight - 7) * 0.01

    // IBO más alto = mejor diseño de levas = mayor eficiencia
    efficiency += (iboVelocity - 330) * 0.0001

    return Math.max(0.70, Math.min(0.90, efficiency))
  }

  // Función para calcular factor de flexión dinámica
  function calculateDynamicFlexFactor(availableEnergy: number, arrowMass: number, staticSpine: number, effectiveDrawLength: number): number {
    // === CONSTANTE DE CALIBRACIÓN EMPÍRICA ===
    // Este factor ajusta la magnitud del efecto de flexión dinámica.
    // Valor base: 10000
    // - Aumentar este valor (ej: 12000, 15000) = REDUCE el efecto de flexión dinámica
    //   -> Resultará en spine dinámico más cercano al estático
    //   -> Usar si el modelo predice flechas demasiado flexibles
    // - Disminuir este valor (ej: 8000, 6000) = AUMENTA el efecto de flexión dinámica
    //   -> Resultará en spine dinámico más alejado del estático
    //   -> Usar si el modelo predice flechas demasiado rígidas
    //
    // Para calibrar: comparar predicciones del modelo con resultados de tiro reales
    // y ajustar iterativamente hasta que coincidan.
    const K_DYNAMIC_FLEX_CALIBRATION = 10000

    // Convertir unidades a un sistema consistente:
    // availableEnergy está en ft-lbs
    // effectiveDrawLength está en pulgadas -> convertir a pies
    // arrowMass está en grains

    const drawLengthFt = effectiveDrawLength / 12 // Convertir pulgadas a pies

    // Fuerza promedio: F = E/d (Energía / distancia)
    // Resultado en lbs (libras-fuerza)
    const averageForce = availableEnergy / drawLengthFt

    // Aceleración: a = F/m
    // Para unidades consistentes: convertir masa de grains a lbs
    // 1 lb = 7000 grains
    const arrowMassLbs = arrowMass / 7000

    // Aceleración en ft/s² (pie por segundo al cuadrado)
    // a = F/m, donde F está en lbs y m en lbs (masa)
    // Necesitamos ajustar por gravedad: 1 lbf = 32.174 lb·ft/s²
    const acceleration = (averageForce * 32.174) / arrowMassLbs

    // La flexión dinámica aumenta con la aceleración
    // Flechas más ligeras experimentan más flexión dinámica
    // Normalizamos por el factor de calibración empírico
    const dynamicFactor = 1 + (acceleration / K_DYNAMIC_FLEX_CALIBRATION) * (1 / Math.sqrt(staticSpine))

    return dynamicFactor
  }

  // Función para calcular spine requerido basado en paradoja del arquero
  function calculateRequiredSpine(peakForce: number, arrowLength: number): number {
    // === CONSTANTE DE CALIBRACIÓN EMPÍRICA ===
    // Este factor ajusta el spine requerido basado en la paradoja del arquero.
    // Valor base: 0.5
    // - Aumentar este valor (ej: 0.6, 0.7) = Predice spine MÁS FLEXIBLE necesario
    //   -> Resultará en números de spine más altos (ej: 0.400 → 0.500)
    //   -> Usar si las flechas recomendadas son demasiado rígidas en la práctica
    // - Disminuir este valor (ej: 0.4, 0.3) = Predice spine MÁS RÍGIDO necesario
    //   -> Resultará en números de spine más bajos (ej: 0.400 → 0.300)
    //   -> Usar si las flechas recomendadas son demasiado flexibles en la práctica
    //
    // Para calibrar: comparar con tablas de fabricantes (Easton, Gold Tip, etc.)
    // y ajustar hasta que las recomendaciones coincidan.
    const K_SPINE_CALIBRATION = 0.5

    // El spine debe permitir la flexión necesaria alrededor del riser
    // Fórmula basada en la física de vigas: deflexión ∝ Force × Length³ / (3 × E × I)

    // Mayor fuerza pico = spine más rígido (número más bajo)
    // Mayor longitud = spine más flexible (número más alto)
    const spineRequired = K_SPINE_CALIBRATION * Math.sqrt(arrowLength / 28) * (70 / peakForce)

    return spineRequired
  }

  // Función para calcular factor de emplumado
  function calculateFletchingFactor(fletchQuantity: number, weightEach: number): number {
    // Más plumas = más estabilidad = menos flexión necesaria
    // Plumas más pesadas = más drag = más fuerza en punta = más flexión
    const baseFactor = 1.0

    // Factor por cantidad de plumas (3-4 es estándar)
    const quantityFactor = (fletchQuantity - 3) * 0.02

    // Factor por peso de plumas (más peso = más estabilización)
    const weightFactor = (weightEach - 8) * 0.005

    return baseFactor - quantityFactor - weightFactor
  }

  // Función para calcular factor de método de suelta
  function calculateReleaseFactor(releaseType: string): number {
    // Liberaciones manuales = más inconsistencia = más flexión necesaria
    // Liberaciones mecánicas = más consistentes = menos flexión
    if (releaseType.toLowerCase().includes('manual') || releaseType.toLowerCase().includes('fingers')) {
      return 1.12 // 12% más flexión para sueltas manuales
    } else if (releaseType.toLowerCase().includes('pre')) {
      return 0.95 // Pre-gate son muy consistentes
    }
    return 1.0 // Base para liberaciones mecánicas estándar
  }

  // Función para aplicar márgenes de seguridad
  function applySafetyMargin(spineRequired: number, massRatio: number): number {
    // Flechas muy ligeras necesitan más margen de seguridad
    if (massRatio < 4) {
      return spineRequired * 0.85 // 15% más rígido para seguridad
    } else if (massRatio < 5) {
      return spineRequired * 0.90 // 10% más rígido
    } else if (massRatio > 8) {
      return spineRequired * 0.95 // 5% más rígido para flechas pesadas
    }
    return spineRequired // Sin margen para rango óptimo
  }

  // Función para calcular factor de material de cuerda
  function calculateStringMaterialFactor(stringWeights: { silencers: string, silencerDfc: string, stringMaterial: 'dacron' | 'fastflight' | 'unknown' }): number {
    // Dacrón = menos eficiente = -3 a -5 lbs equivalentes
    // FastFlight = más eficiente = base

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
    // Easton: +3 lbs por cada 25 grains sobre 100 grains
    if (pointWeight > 100) {
      const extraGrains = pointWeight - 100
      const increments25 = Math.floor(extraGrains / 25)
      return increments25 * 3 // +3 lbs equivalentes por cada 25 grains
    }
    return 0 // Sin ajuste para puntas ≤ 100 grains
  }

  // Función para calcular factor de wrap (vinilo decorativo)
  function calculateWrapFactor(wrapWeight: number): number {
    // Wrap añade peso y rigidez local
    // Más peso = más estabilización = menos flexión necesaria
    if (wrapWeight > 0) {
      return 0.98 // -2% flexión para wraps
    }
    return 1.0
  }

  // Función para calcular apertura efectiva según Hattila
  function calculateEffectiveDrawLength(drawLength: number): number {
    // Hattila: redondear hacia abajo para evitar tubo demasiado rígido
    return Math.floor(drawLength)
  }

  // Función para obtener recomendaciones de casos límite
  function getEdgeCaseRecommendation(drawWeight: number): string {
    // Si potencia está entre rangos (ej: 34.5 lbs entre 30/34 y 35/39)
    if (drawWeight % 10 > 4 && drawWeight % 10 < 6) {
      return "Considerar spine más rígido si planea aumentar potencia en el futuro"
    }
    return "Spine recomendado para configuración actual"
  }

  // Función para calcular eficiencia de transferencia de masa
  function calculateTransferEfficiency(arrowMass: number, drawWeight: number): number {
    // Relación masa/potencia óptima: 5-8 grains por libra
    const massRatio = arrowMass / drawWeight

    let efficiency = 1.0

    if (massRatio < 4) {
      efficiency = 0.85 // Flecha muy ligera = menor eficiencia
    } else if (massRatio > 8) {
      efficiency = 0.90 // Flecha muy pesada = menor eficiencia
    } else {
      efficiency = 0.95 // Rango óptimo
    }

    return efficiency
  }

  // --- 4. NUESTRO MOTOR DE CÁLCULO FÍSICO MEJORADO ---

  // === PARTE A: MODELO DE ENERGÍA ALMACENADA ===
  const effectiveDrawLength = calculateEffectiveDrawLength(drawLength)
  const storedEnergy = calculateStoredEnergy(drawWeight, effectiveDrawLength, braceHeight)
  const bowEfficiency = calculateBowEfficiency(braceHeight, iboVelocity)
  const availableEnergy = storedEnergy * bowEfficiency

  // === PARTE B: CÁLCULO DE VELOCIDAD BASADO EN ENERGÍA ===
  const transferEfficiency = calculateTransferEfficiency(arrowTotalWeight, drawWeight)
  const stringMaterialFactor = calculateStringMaterialFactor(stringWeights)
  const pointWeightAdjustment = calculatePointWeightAdjustment(pointWeight)

  // Ajustar drawWeight efectivo según tablas Easton
  const effectiveDrawWeight = drawWeight + pointWeightAdjustment

  const kineticEnergy = availableEnergy * transferEfficiency * stringMaterialFactor

  // Convertir energía cinética a velocidad: E = 0.5 × m × v²
  // K_FPS_CONVERSION = 7000 (grains/lb) * 32.174 (ft/s²) * 2 = 450436
  const K_FPS_CONVERSION = 450436
  const calculatedFPS = Math.sqrt((kineticEnergy * K_FPS_CONVERSION) / arrowTotalWeight)

  // Ajustes finos por factores adicionales
  let finalFPS = calculatedFPS
  // Solo aplicar ajustes si calculatedFPS es válido
  if (isFinite(calculatedFPS)) {
    finalFPS += (axleToAxle - 35) * 0.5 // Arcos más largos ligeramente más eficientes
    finalFPS -= totalStringWeight / 6 // Peso en cuerda
    if (releaseType.includes('Pre')) {
      finalFPS += 2 // Liberaciones pre-gate más consistentes
    }
  }

  // === PARTE C: SPINE DINÁMICO REQUERIDO (SDR) ===
  const massRatio = arrowTotalWeight / effectiveDrawWeight
  const spineRequiredBase = calculateRequiredSpine(effectiveDrawWeight, shaftLength)
  const spineRequired = applySafetyMargin(spineRequiredBase, massRatio)

  // === PARTE D: SPINE DINÁMICO EFECTIVO (SDE) ===
  const frontMass = pointWeight + insertWeight
  const dynamicFlexFactor = calculateDynamicFlexFactor(availableEnergy, arrowTotalWeight, staticSpine, effectiveDrawLength)

  // Nuevos factores adicionales
  const fletchingFactor = calculateFletchingFactor(fletchQuantity, weightEach)
  const releaseFactor = calculateReleaseFactor(releaseType)
  const wrapFactor = calculateWrapFactor(wrapWeight)

  // Factores geométricos
  const lengthFactor = Math.pow(shaftLength / 28, 2)
  const massFactor = 1 + (frontMass - 100) * 0.002

  const spineDynamic = staticSpine * lengthFactor * massFactor * dynamicFlexFactor * fletchingFactor * releaseFactor * wrapFactor

  // === PARTE E: COMPARACIÓN Y RESULTADO ===
  const matchIndex = spineDynamic / spineRequired

  let status: SpineMatchStatus | null = null
  // Validar que matchIndex sea un número válido (no NaN, no Infinity)
  if (matchIndex != null && isFinite(matchIndex)) {
    if (matchIndex > 1.15) {
      status = 'weak'
      recommendations.push('Considera una flecha con spine más rígido (número más bajo)')
    } else if (matchIndex < 0.85) {
      status = 'stiff'
      recommendations.push('Considera una flecha con spine más flexible (número más alto)')
    } else {
      status = 'good'
    }
  }

  // === PARTE F: ADVERTENCIAS DE SEGURIDAD MEJORADAS ===

  // Advertencias críticas de seguridad para GPP (solo si massRatio es válido)
  if (isFinite(massRatio)) {
    if (massRatio < 4) {
      warnings.push('¡PELIGRO! Flecha muy ligera - puede dañar el arco o romperse durante el disparo')
    } else if (massRatio < 5) {
      warnings.push('Flecha ligera - considere aumentar el peso para mayor seguridad del arco')
    }
  }

  // Advertencias de spine extremo (solo si matchIndex es válido)
  if (isFinite(matchIndex)) {
    if (matchIndex > 1.3) {
      warnings.push('¡PELIGRO! Flecha demasiado flexible - riesgo de fractura y daño al arco')
    } else if (matchIndex < 0.7) {
      warnings.push('Flecha excesivamente rígida - puede causar vuelo errático y golpes en el arco')
    }
  }

  // Advertencias de velocidad extrema (solo si finalFPS es válido)
  if (isFinite(finalFPS)) {
    if (finalFPS > 340) {
      warnings.push('Velocidad extrema - asegúrese de que su equipo pueda manejar estas fuerzas')
    }
  }

  // Recomendaciones adicionales basadas en física (solo si finalFPS es válido)
  if (isFinite(finalFPS)) {
    if (finalFPS < 280) {
      recommendations.push('La velocidad es baja. Considera reducir el peso de la flecha o optimizar la eficiencia del arco.')
    } else if (finalFPS > 320) {
      recommendations.push('La velocidad es alta. Asegúrate de que tu equipo pueda manejar estas fuerzas.')
    }
  }

  // Recomendaciones de eficiencia (solo si massRatio es válido)
  if (isFinite(massRatio)) {
    if (massRatio < 5) {
      recommendations.push('La flecha es muy ligera para la potencia. Considera aumentar el peso para mejor eficiencia.')
    } else if (massRatio > 8) {
      recommendations.push('La flecha es muy pesada para la potencia. Considera reducir el peso para mejor velocidad.')
    }
  }

  // Recomendaciones de casos límite (Hattila)
  const edgeCaseRecommendation = getEdgeCaseRecommendation(drawWeight)
  if (edgeCaseRecommendation !== "Spine recomendado para configuración actual") {
    recommendations.push(edgeCaseRecommendation)
  }

  return {
    spineRequired: isFinite(spineRequired) ? spineRequired : null,
    spineDynamic: isFinite(spineDynamic) ? spineDynamic : null,
    matchIndex: isFinite(matchIndex) ? matchIndex : null,
    status,
    arrowTotalWeight,
    calculatedFPS: isFinite(finalFPS) ? finalFPS : null,
    recommendations,
    warnings,
  }
}

function App() {
  const { t, lang, setLang } = useI18n()
  const [bowSpecs, setBowSpecs] = useState({
    iboVelocity: '',
    drawLength: '',
    drawWeight: '',
    braceHeight: '',
    axleToAxle: '',
    percentLetoff: '',
  })

  const [arrowSpecs, setArrowSpecs] = useState({
    pointWeight: '',
    insertWeight: '',
    shaftLength: '',
    shaftGpi: '',
    fletchQuantity: '',
    weightEach: '',
    wrapWeight: '',
    nockWeight: '',
    bushingPin: '',
    staticSpine: '',
  })

  const [stringWeights, setStringWeights] = useState({
    peep: '',
    dLoop: '',
    nockPoint: '',
    silencers: '',
    silencerDfc: '',
    releaseType: 'Post Gate Release',
    stringMaterial: 'unknown' as 'dacron' | 'fastflight' | 'unknown',
  })

  const spineMatch = useMemo(
    () => calculateSpineMatch(bowSpecs, arrowSpecs, stringWeights),
    [bowSpecs, arrowSpecs, stringWeights],
  )

  // Configuration save/load functions
  const saveConfiguration = (slot: number) => {
    const config = {
      bowSpecs,
      arrowSpecs,
      stringWeights,
    }
    localStorage.setItem(`archery-config-${slot}`, JSON.stringify(config))
  }

  const loadConfiguration = (slot: number) => {
    const saved = localStorage.getItem(`archery-config-${slot}`)
    if (saved) {
      const config = JSON.parse(saved)
      setBowSpecs(config.bowSpecs)
      setArrowSpecs(config.arrowSpecs)
      setStringWeights(config.stringWeights)
    }
  }

  const clearInputs = () => {
    setBowSpecs({
      iboVelocity: '',
      drawLength: '',
      drawWeight: '',
      braceHeight: '',
      axleToAxle: '',
      percentLetoff: '',
    })
    setArrowSpecs({
      pointWeight: '',
      insertWeight: '',
      shaftLength: '',
      shaftGpi: '',
      fletchQuantity: '',
      weightEach: '',
      wrapWeight: '',
      nockWeight: '',
      bushingPin: '',
      staticSpine: '',
    })
    setStringWeights({
      peep: '',
      dLoop: '',
      nockPoint: '',
      silencers: '',
      silencerDfc: '',
      releaseType: 'Post Gate Release',
      stringMaterial: 'unknown',
    })
  }

  const matchLabel =
    spineMatch.status === 'weak'
      ? t('match.weak')
      : spineMatch.status === 'stiff'
        ? t('match.stiff')
        : spineMatch.status === 'good'
          ? t('match.good')
          : t('match.na')

  const matchColor =
    spineMatch.status === 'weak'
      ? 'text-amber-400'
      : spineMatch.status === 'stiff'
        ? 'text-sky-400'
        : spineMatch.status === 'good'
          ? 'text-emerald-400'
          : 'text-slate-400'

  // Function to calculate position of match index on visual bar
  const getMatchIndexPosition = (matchIndex: number): number => {
    // Map match index range to percentage position
    // Weak zone: 0.6-0.85 (0-30%)
    // Good zone: 0.85-1.15 (30-70%) 
    // Stiff zone: 1.15-1.4 (70-100%)

    if (matchIndex <= 0.6) return 2 // Minimum position
    if (matchIndex >= 1.4) return 98 // Maximum position

    if (matchIndex <= 0.85) {
      // Weak zone: map 0.6-0.85 to 2-30%
      return 2 + ((matchIndex - 0.6) / 0.25) * 28
    } else if (matchIndex <= 1.15) {
      // Good zone: map 0.85-1.15 to 30-70%
      return 30 + ((matchIndex - 0.85) / 0.3) * 40
    } else {
      // Stiff zone: map 1.15-1.4 to 70-98%
      return 70 + ((matchIndex - 1.15) / 0.25) * 28
    }
  }

  return (
    <div className="min-h-screen flex justify-center py-10 px-4">
      <div className="w-full max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-slate-100">
            {t('app.title')}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => setLang('es')}
              className={`flex items-center gap-1 rounded px-2 py-1 border text-xs transition-colors ${lang === 'es' ? 'border-sky-400 bg-sky-500/10' : 'border-slate-600 hover:border-slate-400'}`}
            >
              <span>🇪🇸</span>
              <span>ES</span>
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`flex items-center gap-1 rounded px-2 py-1 border text-xs transition-colors ${lang === 'en' ? 'border-sky-400 bg-sky-500/10' : 'border-slate-600 hover:border-slate-400'}`}
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
          </div>
        </div>

        {/* Configuration Save/Load Buttons */}
        <div className="mb-4 rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-slate-300 mr-2">Configuraciones:</span>
            <button
              type="button"
              onClick={() => saveConfiguration(1)}
              className="rounded px-3 py-1.5 text-xs font-medium border border-emerald-600 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              Guardar 1
            </button>
            <button
              type="button"
              onClick={() => saveConfiguration(2)}
              className="rounded px-3 py-1.5 text-xs font-medium border border-emerald-600 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              Guardar 2
            </button>
            <button
              type="button"
              onClick={() => saveConfiguration(3)}
              className="rounded px-3 py-1.5 text-xs font-medium border border-emerald-600 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              Guardar 3
            </button>
            <div className="w-px h-6 bg-slate-600 mx-1"></div>
            <button
              type="button"
              onClick={() => loadConfiguration(1)}
              className="rounded px-3 py-1.5 text-xs font-medium border border-sky-600 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
            >
              Cargar 1
            </button>
            <button
              type="button"
              onClick={() => loadConfiguration(2)}
              className="rounded px-3 py-1.5 text-xs font-medium border border-sky-600 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
            >
              Cargar 2
            </button>
            <button
              type="button"
              onClick={() => loadConfiguration(3)}
              className="rounded px-3 py-1.5 text-xs font-medium border border-sky-600 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
            >
              Cargar 3
            </button>
            <div className="w-px h-6 bg-slate-600 mx-1"></div>
            <button
              type="button"
              onClick={clearInputs}
              className="rounded px-3 py-1.5 text-xs font-medium border border-red-600 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Limpiar Todo
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-sm flex flex-wrap gap-4 items-center">
          <div>
            <span className="text-xs uppercase text-slate-400">
              {t('summary.spineRequired')}
            </span>
            <div className="font-mono">
              {spineMatch.spineRequired != null
                ? spineMatch.spineRequired.toFixed(3)
                : '--'}
            </div>
          </div>
          <div>
            <span className="text-xs uppercase text-slate-400">
              {t('summary.spineDynamic')}
            </span>
            <div className="font-mono">
              {spineMatch.spineDynamic != null
                ? spineMatch.spineDynamic.toFixed(3)
                : '--'}
            </div>
          </div>
          <div>
            <span className="text-xs uppercase text-slate-400">
              {t('summary.match')}
            </span>
            <div className={`font-medium ${matchColor}`}>{matchLabel}</div>
          </div>
          <div>
            <span className="text-xs uppercase text-slate-400">
              {t('summary.arrowWeight')}
            </span>
            <div className="font-mono">
              {spineMatch.arrowTotalWeight.toFixed(1)} gr
            </div>
          </div>
          <div>
            <span className="text-xs uppercase text-slate-400">
              Velocidad Estimada
            </span>
            <div className="font-mono">
              {spineMatch.calculatedFPS != null
                ? spineMatch.calculatedFPS.toFixed(1) + ' FPS'
                : '--'}
            </div>
          </div>
        </div>

        {/* Spine Match Visual Bar */}
        {spineMatch.matchIndex != null && (
          <div className="mb-4 rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3">
            <div className="text-xs uppercase text-slate-400 mb-2">
              {t('summary.match')} - Indicador Visual
            </div>
            <div className="relative">
              {/* Background bar with three zones */}
              <div className="h-6 rounded-full overflow-hidden flex">
                {/* Weak zone (red) */}
                <div className="w-[30%] bg-red-600"></div>
                {/* Good zone (green) */}
                <div className="w-[40%] bg-emerald-600"></div>
                {/* Stiff zone (red) */}
                <div className="w-[30%] bg-red-600"></div>
              </div>

              {/* Zone labels */}
              <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
                <span>{t('match.weak')}</span>
                <span className="font-medium text-emerald-400">{t('match.good')}</span>
                <span>{t('match.stiff')}</span>
              </div>

              {/* Indicator needle */}
              <div
                className="absolute top-0 h-6 w-0.5 bg-white shadow-lg transition-all duration-300"
                style={{
                  left: `${Math.max(2, Math.min(98, getMatchIndexPosition(spineMatch.matchIndex)))}%`
                }}
              >
                {/* Triangle pointer at top */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
              </div>

              {/* Current value display */}
              <div className="text-center mt-2">
                <span className="text-sm font-mono">
                  Match Index: {spineMatch.matchIndex.toFixed(3)}
                </span>
                <span className={`ml-2 text-sm font-medium ${matchColor}`}>
                  ({matchLabel})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations and Warnings */}
        {(spineMatch.recommendations.length > 0 || spineMatch.warnings.length > 0) && (
          <div className="mb-4 space-y-2">
            {spineMatch.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-600/30 bg-amber-900/20 px-4 py-3">
                <h3 className="text-sm font-medium mb-2 text-amber-300">⚠️ Advertencias</h3>
                <ul className="text-xs space-y-1 text-amber-200">
                  {spineMatch.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
            {spineMatch.recommendations.length > 0 && (
              <div className="rounded-lg border border-sky-600/30 bg-sky-900/20 px-4 py-3">
                <h3 className="text-sm font-medium mb-2 text-sky-300">💡 Recomendaciones</h3>
                <ul className="text-xs space-y-1 text-sky-200">
                  {spineMatch.recommendations.map((recommendation, index) => (
                    <li key={index}>• {recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          {/* Bow Specs */}
          <section className="flex-1 min-w-[260px] max-w-sm rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 shadow-sm">
            <h2 className="text-sm font-semibold mb-3 text-slate-100">
              {t('section.bowSpecs')}
            </h2>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="iboVelocity" className="whitespace-nowrap">
                {t('field.iboVelocity')} <span className="text-red-400">*</span>
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="iboVelocity"
                type="number"
                value={bowSpecs.iboVelocity}
                onChange={(e) =>
                  setBowSpecs({ ...bowSpecs, iboVelocity: e.target.value })
                }
                placeholder="fps"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="drawLength" className="whitespace-nowrap">
                {t('field.drawLength')} <span className="text-red-400">*</span>
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="drawLength"
                type="number"
                value={bowSpecs.drawLength}
                onChange={(e) =>
                  setBowSpecs({ ...bowSpecs, drawLength: e.target.value })
                }
                placeholder="in"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="drawWeight" className="whitespace-nowrap">
                {t('field.drawWeight')} <span className="text-red-400">*</span>
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="drawWeight"
                type="number"
                value={bowSpecs.drawWeight}
                onChange={(e) =>
                  setBowSpecs({ ...bowSpecs, drawWeight: e.target.value })
                }
                placeholder="lbs"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="braceHeight" className="whitespace-nowrap">
                {t('field.braceHeight')} <span className="text-red-400">*</span>
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="braceHeight"
                type="number"
                value={bowSpecs.braceHeight}
                onChange={(e) =>
                  setBowSpecs({ ...bowSpecs, braceHeight: e.target.value })
                }
                placeholder="in"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="axleToAxle" className="whitespace-nowrap">
                {t('field.axleToAxle')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="axleToAxle"
                type="number"
                value={bowSpecs.axleToAxle}
                onChange={(e) =>
                  setBowSpecs({ ...bowSpecs, axleToAxle: e.target.value })
                }
                placeholder="in"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="percentLetoff" className="whitespace-nowrap">
                {t('field.percentLetoff')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="percentLetoff"
                type="number"
                value={bowSpecs.percentLetoff}
                onChange={(e) =>
                  setBowSpecs({ ...bowSpecs, percentLetoff: e.target.value })
                }
                placeholder="%"
              />
            </div>
          </section>

          {/* Arrow Specs */}
          <section className="flex-1 min-w-[260px] max-w-sm rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 shadow-sm">
            <h2 className="text-sm font-semibold mb-3 text-slate-100">
              {t('section.arrowSpecs')}
            </h2>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="pointWeight" className="whitespace-nowrap">
                {t('field.pointWeight')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="pointWeight"
                type="number"
                value={arrowSpecs.pointWeight}
                onChange={(e) =>
                  setArrowSpecs({ ...arrowSpecs, pointWeight: e.target.value })
                }
                placeholder="gr"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="insertWeight" className="whitespace-nowrap">
                {t('field.insertWeight')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="insertWeight"
                type="number"
                value={arrowSpecs.insertWeight}
                onChange={(e) =>
                  setArrowSpecs({ ...arrowSpecs, insertWeight: e.target.value })
                }
                placeholder="gr"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="shaftLength" className="whitespace-nowrap">
                {t('field.shaftLength')} <span className="text-red-400">*</span>
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="shaftLength"
                type="number"
                value={arrowSpecs.shaftLength}
                onChange={(e) =>
                  setArrowSpecs({ ...arrowSpecs, shaftLength: e.target.value })
                }
                placeholder="in"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="shaftGpi" className="whitespace-nowrap">
                {t('field.shaftGpi')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="shaftGpi"
                type="number"
                value={arrowSpecs.shaftGpi}
                onChange={(e) =>
                  setArrowSpecs({ ...arrowSpecs, shaftGpi: e.target.value })
                }
                placeholder="gr/in"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="fletchQuantity" className="whitespace-nowrap">
                {t('field.fletchQuantity')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="fletchQuantity"
                type="number"
                value={arrowSpecs.fletchQuantity}
                onChange={(e) =>
                  setArrowSpecs({ ...arrowSpecs, fletchQuantity: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="weightEach" className="whitespace-nowrap">
                {t('field.weightEach')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="weightEach"
                type="number"
                value={arrowSpecs.weightEach}
                onChange={(e) =>
                  setArrowSpecs({ ...arrowSpecs, weightEach: e.target.value })
                }
                placeholder="gr"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="wrapWeight" className="whitespace-nowrap">
                {t('field.wrapWeight')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="wrapWeight"
                type="number"
                value={arrowSpecs.wrapWeight}
                onChange={(e) =>
                  setArrowSpecs({ ...arrowSpecs, wrapWeight: e.target.value })
                }
                placeholder="gr"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="nockWeight" className="whitespace-nowrap">
                {t('field.nockWeight')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="nockWeight"
                type="number"
                value={arrowSpecs.nockWeight}
                onChange={(e) =>
                  setArrowSpecs({ ...arrowSpecs, nockWeight: e.target.value })
                }
                placeholder="gr"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="bushingPin" className="whitespace-nowrap">
                {t('field.bushingPin')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="bushingPin"
                type="number"
                value={arrowSpecs.bushingPin}
                onChange={(e) =>
                  setArrowSpecs({ ...arrowSpecs, bushingPin: e.target.value })
                }
                placeholder="gr"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="staticSpine" className="whitespace-nowrap flex items-center gap-1">
                <span>{t('field.staticSpine')} <span className="text-red-400">*</span></span>
                <div className="relative inline-block group">
                  <span className="cursor-help inline-flex items-center justify-center w-4 h-4 text-xs rounded-full border border-slate-500 text-slate-400 hover:border-sky-400 hover:text-sky-400 transition-colors">
                    ?
                  </span>
                  <div className="absolute left-0 top-6 z-50 invisible group-hover:visible w-80 max-w-sm p-3 text-xs leading-relaxed text-slate-200 bg-slate-800 border border-slate-600 rounded-lg shadow-xl whitespace-normal">
                    {t('field.staticSpine.tooltip')}
                  </div>
                </div>
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="staticSpine"
                type="number"
                step="0.001"
                value={arrowSpecs.staticSpine}
                onChange={(e) =>
                  setArrowSpecs({ ...arrowSpecs, staticSpine: e.target.value })
                }
                placeholder="0.400"
              />
            </div>
          </section>

          {/* Weight On String */}
          <section className="flex-1 min-w-[260px] max-w-sm rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 shadow-sm">
            <h2 className="text-sm font-semibold mb-3 text-slate-100">
              {t('section.weightOnString')}
            </h2>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="peep" className="whitespace-nowrap">
                {t('field.peep')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="peep"
                type="number"
                value={stringWeights.peep}
                onChange={(e) =>
                  setStringWeights({ ...stringWeights, peep: e.target.value })
                }
                placeholder="gr"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="dLoop" className="whitespace-nowrap">
                {t('field.dLoop')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="dLoop"
                type="number"
                value={stringWeights.dLoop}
                onChange={(e) =>
                  setStringWeights({ ...stringWeights, dLoop: e.target.value })
                }
                placeholder="gr"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="nockPoint" className="whitespace-nowrap">
                {t('field.nockPoint')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="nockPoint"
                type="number"
                value={stringWeights.nockPoint}
                onChange={(e) =>
                  setStringWeights({ ...stringWeights, nockPoint: e.target.value })
                }
                placeholder="gr"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="silencers" className="whitespace-nowrap">
                {t('field.silencers')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="silencers"
                type="number"
                value={stringWeights.silencers}
                onChange={(e) =>
                  setStringWeights({ ...stringWeights, silencers: e.target.value })
                }
                placeholder="gr"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-2 text-sm">
              <label htmlFor="silencerDfc" className="whitespace-nowrap">
                {t('field.silencerDfc')}
              </label>
              <input
                className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="silencerDfc"
                type="number"
                value={stringWeights.silencerDfc}
                onChange={(e) =>
                  setStringWeights({
                    ...stringWeights,
                    silencerDfc: e.target.value,
                  })
                }
                placeholder="gr"
              />
            </div>

            <div className="flex items-center justify-between gap-3 mb-1 text-sm">
              <label htmlFor="releaseType" className="whitespace-nowrap">
                {t('field.release')}
              </label>
              <select
                className="w-32 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="releaseType"
                value={stringWeights.releaseType}
                onChange={(e) =>
                  setStringWeights({
                    ...stringWeights,
                    releaseType: e.target.value,
                  })
                }
              >
                <option value="Post Gate Release">{t('option.release.post')}</option>
                <option value="Pre Gate Release">{t('option.release.pre')}</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3 mb-1 text-sm">
              <label htmlFor="stringMaterial" className="whitespace-nowrap">
                {t('field.stringMaterial')}
              </label>
              <select
                className="w-32 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                id="stringMaterial"
                value={stringWeights.stringMaterial}
                onChange={(e) =>
                  setStringWeights({
                    ...stringWeights,
                    stringMaterial: e.target.value as 'dacron' | 'fastflight' | 'unknown',
                  })
                }
              >
                <option value="unknown">{t('option.stringMaterial.unknown')}</option>
                <option value="fastflight">{t('option.stringMaterial.fastflight')}</option>
                <option value="dacron">{t('option.stringMaterial.dacron')}</option>
              </select>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default App