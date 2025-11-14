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

  // --- 3. NUESTRO MOTOR DE CÁLCULO MEJORADO ---

  // === PARTE A: CALCULAR VELOCIDAD DE SALIDA REAL (calculatedFPS) ===
  let calculatedFPS = iboVelocity

  // Ajuste por Potencia (Draw Weight): +/- 1.5 FPS por cada libra
  calculatedFPS += (drawWeight - 70) * 1.5

  // Ajuste por Apertura (Draw Length): +/- 10 FPS por cada pulgada
  calculatedFPS += (drawLength - 30) * 10

  // Ajuste por Brace Height: +/- 10 FPS por cada pulgada (7" es la base)
  calculatedFPS += (7 - braceHeight) * 10

  // Ajuste por Axle to Axle: Arcos más largos son ligeramente más eficientes
  // 35" es la base, cada pulgada extra añade ~0.5 FPS
  if (axleToAxle > 0) {
    calculatedFPS += (axleToAxle - 35) * 0.5
  }

  // Ajuste por Peso en Cuerda (TSW): -1 FPS por cada 6 grains
  calculatedFPS -= totalStringWeight / 6

  // Ajuste por Peso de Flecha (TAW):
  const gppBase = drawWeight * 5
  const weightDiff = arrowTotalWeight - gppBase
  calculatedFPS -= weightDiff / 3

  // Factor de corrección por tipo de liberación
  if (releaseType.includes('Pre')) {
    calculatedFPS += 2 // Las liberaciones pre-gate suelen ser ligeramente más consistentes
  }

  // === PARTE B: CALCULAR SPINE DINÁMICO REQUERIDO (SDR) ===
  // El spine requerido depende de la potencia pico que la flecha debe soportar
  const effectiveWeight = drawWeight
  const BPI = effectiveWeight * (calculatedFPS / 250)

  // K_REQ ajustado para mayor precisión
  const K_REQ = 25
  const spineRequired = K_REQ / BPI

  // === PARTE C: CALCULAR SPINE DINÁMICO EFECTIVO (SDE) ===
  const frontMass = pointWeight + insertWeight

  // Factor de Longitud mejorado (cuadrático)
  const F_len = Math.pow(shaftLength / 28, 2)

  // Factor de Masa Frontal mejorado
  const F_front = 1 + (frontMass - 100) * 0.002

  // Eliminado F_weight para evitar doble contabilización 
  // (el peso ya se considera en el cálculo de velocidad)

  const spineDynamic = staticSpine * F_len * F_front

  // === PARTE D: COMPARACIÓN Y RESULTADO ===
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

  // Generar recomendaciones adicionales
  if (calculatedFPS < 280) {
    recommendations.push('La velocidad es baja. Considera reducir el peso de la flecha o aumentar la potencia.')
  } else if (calculatedFPS > 320) {
    recommendations.push('La velocidad es alta. Asegúrate de que tu equipo pueda manejarla.')
  }

  return {
    spineRequired,
    spineDynamic,
    matchIndex,
    status,
    arrowTotalWeight,
    calculatedFPS,
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