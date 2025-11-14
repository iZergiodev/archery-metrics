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
  },
): SpineMatchResult {
  const toNumber = (value: string) =>
    value.trim() === '' ? 0 : Number(value.replace(',', '.'))

  const recommendations: string[] = []
  const warnings: string[] = []

  // --- 1. PARSEO DE DATOS ---

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

  // --- 3. MODELOS FÍSICOS MEJORADOS ---

  // Función para calcular energía almacenada basada en curva fuerza-apertura
  function calculateStoredEnergy(drawWeight: number, drawLength: number, braceHeight: number): number {
    // Modelo simplificado de curva fuerza-apertura para arco compuesto
    // La energía es el área bajo la curva: ~0.85 × drawWeight × drawLength para compuestos
    const powerStroke = drawLength - braceHeight
    const forceDrawRatio = 0.85 // Ratio típico para arcos compuestos
    const storedEnergy = drawWeight * powerStroke * forceDrawRatio
    return storedEnergy // en foot-pounds
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
  function calculateDynamicFlexFactor(availableEnergy: number, arrowMass: number, staticSpine: number): number {
    // Fuerza de aceleración basada en energía disponible
    const accelerationForce = (availableEnergy * 2) / arrowMass // Simplificación de F = ma

    // La flexión dinámica aumenta con la fuerza de aceleración
    // Flechas más ligeras experimentan más flexión dinámica
    const dynamicFactor = 1 + (accelerationForce / 1000) * (1 / Math.sqrt(staticSpine))

    return dynamicFactor
  }

  // Función para calcular offset de center-shot
  function getCenterShotOffset(): number {
    // Valor típico para arcos compuestos modernos: 0.75"
    return 0.75 // en pulgadas
  }

  // Función para calcular spine requerido basado en paradoja del arquero
  function calculateRequiredSpine(peakForce: number, requiredFlex: number, arrowLength: number): number {
    // El spine debe permitir la flexión necesaria alrededor del riser
    // Fórmula basada en la física de vigas: deflexión ∝ Force × Length³ / (3 × E × I)
    const K_SPINE = 0.5 // Constante calibrada para arcos compuestos

    // Mayor fuerza pico = spine más rígido (número más bajo)
    // Mayor longitud = spine más flexible (número más alto)
    const spineRequired = K_SPINE * Math.sqrt(arrowLength / 28) * (70 / peakForce)

    return spineRequired
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
  const storedEnergy = calculateStoredEnergy(drawWeight, drawLength, braceHeight)
  const bowEfficiency = calculateBowEfficiency(braceHeight, iboVelocity)
  const availableEnergy = storedEnergy * bowEfficiency

  // === PARTE B: CÁLCULO DE VELOCIDAD BASADO EN ENERGÍA ===
  const transferEfficiency = calculateTransferEfficiency(arrowTotalWeight, drawWeight)
  const kineticEnergy = availableEnergy * transferEfficiency

  // Convertir energía cinética a velocidad: E = 0.5 × m × v²
  const calculatedFPS = Math.sqrt((kineticEnergy * 2 * 32.174) / arrowTotalWeight) // 32.174 = g (ft/s²)

  // Ajustes finos por factores adicionales
  let finalFPS = calculatedFPS
  finalFPS += (axleToAxle - 35) * 0.5 // Arcos más largos ligeramente más eficientes
  finalFPS -= totalStringWeight / 6 // Peso en cuerda
  if (releaseType.includes('Pre')) {
    finalFPS += 2 // Liberaciones pre-gate más consistentes
  }

  // === PARTE C: SPINE DINÁMICO REQUERIDO (SDR) ===
  const centerShotOffset = getCenterShotOffset()
  const spineRequired = calculateRequiredSpine(drawWeight, centerShotOffset, shaftLength)

  // === PARTE D: SPINE DINÁMICO EFECTIVO (SDE) ===
  const frontMass = pointWeight + insertWeight
  const dynamicFlexFactor = calculateDynamicFlexFactor(availableEnergy, arrowTotalWeight, staticSpine)

  // Factores geométricos
  const lengthFactor = Math.pow(shaftLength / 28, 2)
  const massFactor = 1 + (frontMass - 100) * 0.002

  const spineDynamic = staticSpine * lengthFactor * massFactor * dynamicFlexFactor

  // === PARTE E: COMPARACIÓN Y RESULTADO ===
  const matchIndex = spineDynamic / spineRequired

  let status: SpineMatchStatus | null = null
  if (matchIndex != null) {
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

  // Generar recomendaciones adicionales basadas en física
  if (finalFPS < 280) {
    recommendations.push('La velocidad es baja. Considera reducir el peso de la flecha o optimizar la eficiencia del arco.')
  } else if (finalFPS > 320) {
    recommendations.push('La velocidad es alta. Asegúrate de que tu equipo pueda manejar estas fuerzas.')
  }

  // Recomendaciones de eficiencia
  const massRatio = arrowTotalWeight / drawWeight
  if (massRatio < 4) {
    recommendations.push('La flecha es muy ligera para la potencia. Considera aumentar el peso para mejor eficiencia.')
  } else if (massRatio > 8) {
    recommendations.push('La flecha es muy pesada para la potencia. Considera reducir el peso para mejor velocidad.')
  }

  return {
    spineRequired,
    spineDynamic,
    matchIndex,
    status,
    arrowTotalWeight,
    calculatedFPS: finalFPS,
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
  })

  const spineMatch = useMemo(
    () => calculateSpineMatch(bowSpecs, arrowSpecs, stringWeights),
    [bowSpecs, arrowSpecs, stringWeights],
  )

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
                {t('field.iboVelocity')}
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
                {t('field.drawLength')}
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
                {t('field.drawWeight')}
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
                {t('field.braceHeight')}
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
                {t('field.shaftLength')}
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
              <label htmlFor="staticSpine" className="whitespace-nowrap">
                {t('field.staticSpine')}
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
          </section>
        </div>
      </div>
    </div>
  )
}

export default App