import { useMemo, useState } from 'react'
import { useI18n } from './i18n.tsx'
import { calculateSpineMatch } from './utils/archeryCalculator'

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
                <span>{t('match.stiff')}</span>
                <span className="font-medium text-emerald-400">{t('match.good')}</span>
                <span>{t('match.weak')}</span>
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
    </div >
  )
}

export default App