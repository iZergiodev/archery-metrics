import { useMemo, useState } from 'react'
import { useI18n } from './i18n.tsx'
import { calculateSpineMatch, type SpineMatchStatus } from './utils/archeryCalculator'
import { Toolbar } from './components/Toolbar'
import { TabNavigation } from './components/TabNavigation'
import { ResultsSummary } from './components/ResultsSummary'
import { FormSection } from './components/FormSection'
import { InputField } from './components/InputField'
import { SelectField } from './components/SelectField'

type ActiveTab = 'bow' | 'arrow' | 'string'

function App() {
  const { t, lang, setLang } = useI18n()
  const [activeTab, setActiveTab] = useState<ActiveTab>('bow')

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
    const config = { bowSpecs, arrowSpecs, stringWeights }
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
    setBowSpecs({ iboVelocity: '', drawLength: '', drawWeight: '', braceHeight: '', axleToAxle: '', percentLetoff: '' })
    setArrowSpecs({ pointWeight: '', insertWeight: '', shaftLength: '', shaftGpi: '', fletchQuantity: '', weightEach: '', wrapWeight: '', nockWeight: '', bushingPin: '', staticSpine: '' })
    setStringWeights({ peep: '', dLoop: '', nockPoint: '', silencers: '', silencerDfc: '', releaseType: 'Post Gate Release', stringMaterial: 'unknown' })
  }

  const matchLabel: string = useMemo(() => {
    switch (spineMatch.status) {
      case 'weak': return t('match.weak')
      case 'stiff': return t('match.stiff')
      case 'good': return t('match.good')
      default: return t('match.na')
    }
  }, [spineMatch.status, t])

  const matchColor: string = useMemo(() => {
    switch (spineMatch.status) {
      case 'weak': return 'text-amber-400'
      case 'stiff': return 'text-sky-400'
      case 'good': return 'text-emerald-400'
      default: return 'text-slate-400'
    }
  }, [spineMatch.status])

  const getMatchIndexPosition = (matchIndex: number): number => {
    if (matchIndex <= 0.6) return 2
    if (matchIndex >= 1.4) return 98
    if (matchIndex <= 0.85) return 2 + ((matchIndex - 0.6) / 0.25) * 28
    if (matchIndex <= 1.15) return 30 + ((matchIndex - 0.85) / 0.3) * 40
    return 70 + ((matchIndex - 1.15) / 0.25) * 28
  }

  const tabs = [
    { id: 'bow', label: t('section.bowSpecs'), icon: '🎯' },
    { id: 'arrow', label: t('section.arrowSpecs'), icon: '➜' },
    { id: 'string', label: t('section.weightOnString'), icon: '🎣' },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 safe-top">
        <div className="max-w-4xl mx-auto px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg font-semibold text-slate-100 truncate">
              {t('app.title')}
            </h1>
            <Toolbar
              onSave={saveConfiguration}
              onLoad={loadConfiguration}
              onClear={clearInputs}
              lang={lang}
              onSetLang={setLang}
              t={t}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 py-4 pb-24 safe-bottom">
        {/* Results Summary - Always visible */}
        <div className="mb-4">
          <ResultsSummary
            result={spineMatch}
            matchColor={matchColor}
            matchLabel={matchLabel}
            getMatchIndexPosition={getMatchIndexPosition}
          />
        </div>

        {/* Alerts Section */}
        {(spineMatch.warnings.length > 0 || spineMatch.recommendations.length > 0) && (
          <div className="mb-4 space-y-2">
            {spineMatch.warnings.length > 0 && (
              <div className="rounded-lg border border-amber-600/30 bg-amber-900/20 p-3">
                <h3 className="text-xs font-medium mb-1.5 text-amber-300 flex items-center gap-1.5">
                  ⚠️ <span className="hidden xs:inline">Advertencias</span>
                </h3>
                <ul className="text-[10px] xs:text-xs space-y-0.5 text-amber-200">
                  {spineMatch.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                </ul>
              </div>
            )}
            {spineMatch.recommendations.length > 0 && (
              <div className="rounded-lg border border-sky-600/30 bg-sky-900/20 p-3">
                <h3 className="text-xs font-medium mb-1.5 text-sky-300 flex items-center gap-1.5">
                  💡 <span className="hidden xs:inline">Recomendaciones</span>
                </h3>
                <ul className="text-[10px] xs:text-xs space-y-0.5 text-sky-200">
                  {spineMatch.recommendations.map((r, i) => <li key={i}>• {r}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation - Mobile */}
        <div className="md:hidden mb-4">
          <TabNavigation tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as ActiveTab)} />
        </div>

        {/* Form Sections */}
        <div className="space-y-4">
          {/* Desktop: All sections visible */}
          <div className="hidden md:block space-y-4">
            <FormSection title={t('section.bowSpecs')} icon="🎯">
              <InputField label={t('field.iboVelocity')} value={bowSpecs.iboVelocity} onChange={(v) => setBowSpecs({ ...bowSpecs, iboVelocity: v })} placeholder="fps" id="iboVelocity" required unit="fps" />
              <InputField label={t('field.drawLength')} value={bowSpecs.drawLength} onChange={(v) => setBowSpecs({ ...bowSpecs, drawLength: v })} placeholder="in" id="drawLength" required unit="in" />
              <InputField label={t('field.drawWeight')} value={bowSpecs.drawWeight} onChange={(v) => setBowSpecs({ ...bowSpecs, drawWeight: v })} placeholder="lbs" id="drawWeight" required unit="lbs" />
              <InputField label={t('field.braceHeight')} value={bowSpecs.braceHeight} onChange={(v) => setBowSpecs({ ...bowSpecs, braceHeight: v })} placeholder="in" id="braceHeight" required unit="in" />
              <InputField label={t('field.axleToAxle')} value={bowSpecs.axleToAxle} onChange={(v) => setBowSpecs({ ...bowSpecs, axleToAxle: v })} placeholder="in" id="axleToAxle" unit="in" />
              <InputField label={t('field.percentLetoff')} value={bowSpecs.percentLetoff} onChange={(v) => setBowSpecs({ ...bowSpecs, percentLetoff: v })} placeholder="%" id="percentLetoff" unit="%" />
            </FormSection>

            <FormSection title={t('section.arrowSpecs')} icon="➜">
              <InputField label={t('field.pointWeight')} value={arrowSpecs.pointWeight} onChange={(v) => setArrowSpecs({ ...arrowSpecs, pointWeight: v })} placeholder="gr" id="pointWeight" unit="gr" />
              <InputField label={t('field.insertWeight')} value={arrowSpecs.insertWeight} onChange={(v) => setArrowSpecs({ ...arrowSpecs, insertWeight: v })} placeholder="gr" id="insertWeight" unit="gr" />
              <InputField label={t('field.shaftLength')} value={arrowSpecs.shaftLength} onChange={(v) => setArrowSpecs({ ...arrowSpecs, shaftLength: v })} placeholder="in" id="shaftLength" required unit="in" />
              <InputField label={t('field.shaftGpi')} value={arrowSpecs.shaftGpi} onChange={(v) => setArrowSpecs({ ...arrowSpecs, shaftGpi: v })} placeholder="gr/in" id="shaftGpi" unit="gr/in" />
              <InputField label={t('field.fletchQuantity')} value={arrowSpecs.fletchQuantity} onChange={(v) => setArrowSpecs({ ...arrowSpecs, fletchQuantity: v })} placeholder="#" id="fletchQuantity" />
              <InputField label={t('field.weightEach')} value={arrowSpecs.weightEach} onChange={(v) => setArrowSpecs({ ...arrowSpecs, weightEach: v })} placeholder="gr" id="weightEach" unit="gr" />
              <InputField label={t('field.wrapWeight')} value={arrowSpecs.wrapWeight} onChange={(v) => setArrowSpecs({ ...arrowSpecs, wrapWeight: v })} placeholder="gr" id="wrapWeight" unit="gr" />
              <InputField label={t('field.nockWeight')} value={arrowSpecs.nockWeight} onChange={(v) => setArrowSpecs({ ...arrowSpecs, nockWeight: v })} placeholder="gr" id="nockWeight" unit="gr" />
              <InputField label={t('field.bushingPin')} value={arrowSpecs.bushingPin} onChange={(v) => setArrowSpecs({ ...arrowSpecs, bushingPin: v })} placeholder="gr" id="bushingPin" unit="gr" />
              <InputField label={t('field.staticSpine')} value={arrowSpecs.staticSpine} onChange={(v) => setArrowSpecs({ ...arrowSpecs, staticSpine: v })} placeholder="0.400" id="staticSpine" required step="0.001" tooltip={t('field.staticSpine.tooltip')} />
            </FormSection>

            <FormSection title={t('section.weightOnString')} icon="🎣">
              <InputField label={t('field.peep')} value={stringWeights.peep} onChange={(v) => setStringWeights({ ...stringWeights, peep: v })} placeholder="gr" id="peep" unit="gr" />
              <InputField label={t('field.dLoop')} value={stringWeights.dLoop} onChange={(v) => setStringWeights({ ...stringWeights, dLoop: v })} placeholder="gr" id="dLoop" unit="gr" />
              <InputField label={t('field.nockPoint')} value={stringWeights.nockPoint} onChange={(v) => setStringWeights({ ...stringWeights, nockPoint: v })} placeholder="gr" id="nockPoint" unit="gr" />
              <InputField label={t('field.silencers')} value={stringWeights.silencers} onChange={(v) => setStringWeights({ ...stringWeights, silencers: v })} placeholder="gr" id="silencers" unit="gr" />
              <InputField label={t('field.silencerDfc')} value={stringWeights.silencerDfc} onChange={(v) => setStringWeights({ ...stringWeights, silencerDfc: v })} placeholder="gr" id="silencerDfc" unit="gr" />
              <SelectField label={t('field.release')} value={stringWeights.releaseType} onChange={(v) => setStringWeights({ ...stringWeights, releaseType: v })} options={[
                { value: 'Post Gate Release', label: t('option.release.post') },
                { value: 'Pre Gate Release', label: t('option.release.pre') },
              ]} id="releaseType" />
              <SelectField label={t('field.stringMaterial')} value={stringWeights.stringMaterial} onChange={(v) => setStringWeights({ ...stringWeights, stringMaterial: v as typeof stringWeights.stringMaterial })} options={[
                { value: 'unknown', label: t('option.stringMaterial.unknown') },
                { value: 'fastflight', label: t('option.stringMaterial.fastflight') },
                { value: 'dacron', label: t('option.stringMaterial.dacron') },
              ]} id="stringMaterial" />
            </FormSection>
          </div>

          {/* Mobile: Single section based on active tab */}
          <div className="md:hidden">
            {activeTab === 'bow' && (
              <FormSection title={t('section.bowSpecs')} icon="🎯">
                <InputField label={t('field.iboVelocity')} value={bowSpecs.iboVelocity} onChange={(v) => setBowSpecs({ ...bowSpecs, iboVelocity: v })} placeholder="fps" id="iboVelocity" required unit="fps" />
                <InputField label={t('field.drawLength')} value={bowSpecs.drawLength} onChange={(v) => setBowSpecs({ ...bowSpecs, drawLength: v })} placeholder="in" id="drawLength" required unit="in" />
                <InputField label={t('field.drawWeight')} value={bowSpecs.drawWeight} onChange={(v) => setBowSpecs({ ...bowSpecs, drawWeight: v })} placeholder="lbs" id="drawWeight" required unit="lbs" />
                <InputField label={t('field.braceHeight')} value={bowSpecs.braceHeight} onChange={(v) => setBowSpecs({ ...bowSpecs, braceHeight: v })} placeholder="in" id="braceHeight" required unit="in" />
                <InputField label={t('field.axleToAxle')} value={bowSpecs.axleToAxle} onChange={(v) => setBowSpecs({ ...bowSpecs, axleToAxle: v })} placeholder="in" id="axleToAxle" unit="in" />
                <InputField label={t('field.percentLetoff')} value={bowSpecs.percentLetoff} onChange={(v) => setBowSpecs({ ...bowSpecs, percentLetoff: v })} placeholder="%" id="percentLetoff" unit="%" />
              </FormSection>
            )}

            {activeTab === 'arrow' && (
              <FormSection title={t('section.arrowSpecs')} icon="➜">
                <InputField label={t('field.pointWeight')} value={arrowSpecs.pointWeight} onChange={(v) => setArrowSpecs({ ...arrowSpecs, pointWeight: v })} placeholder="gr" id="pointWeight" unit="gr" />
                <InputField label={t('field.insertWeight')} value={arrowSpecs.insertWeight} onChange={(v) => setArrowSpecs({ ...arrowSpecs, insertWeight: v })} placeholder="gr" id="insertWeight" unit="gr" />
                <InputField label={t('field.shaftLength')} value={arrowSpecs.shaftLength} onChange={(v) => setArrowSpecs({ ...arrowSpecs, shaftLength: v })} placeholder="in" id="shaftLength" required unit="in" />
                <InputField label={t('field.shaftGpi')} value={arrowSpecs.shaftGpi} onChange={(v) => setArrowSpecs({ ...arrowSpecs, shaftGpi: v })} placeholder="gr/in" id="shaftGpi" unit="gr/in" />
                <InputField label={t('field.fletchQuantity')} value={arrowSpecs.fletchQuantity} onChange={(v) => setArrowSpecs({ ...arrowSpecs, fletchQuantity: v })} placeholder="#" id="fletchQuantity" />
                <InputField label={t('field.weightEach')} value={arrowSpecs.weightEach} onChange={(v) => setArrowSpecs({ ...arrowSpecs, weightEach: v })} placeholder="gr" id="weightEach" unit="gr" />
                <InputField label={t('field.wrapWeight')} value={arrowSpecs.wrapWeight} onChange={(v) => setArrowSpecs({ ...arrowSpecs, wrapWeight: v })} placeholder="gr" id="wrapWeight" unit="gr" />
                <InputField label={t('field.nockWeight')} value={arrowSpecs.nockWeight} onChange={(v) => setArrowSpecs({ ...arrowSpecs, nockWeight: v })} placeholder="gr" id="nockWeight" unit="gr" />
                <InputField label={t('field.bushingPin')} value={arrowSpecs.bushingPin} onChange={(v) => setArrowSpecs({ ...arrowSpecs, bushingPin: v })} placeholder="gr" id="bushingPin" unit="gr" />
                <InputField label={t('field.staticSpine')} value={arrowSpecs.staticSpine} onChange={(v) => setArrowSpecs({ ...arrowSpecs, staticSpine: v })} placeholder="0.400" id="staticSpine" required step="0.001" tooltip={t('field.staticSpine.tooltip')} />
              </FormSection>
            )}

            {activeTab === 'string' && (
              <FormSection title={t('section.weightOnString')} icon="🎣">
                <InputField label={t('field.peep')} value={stringWeights.peep} onChange={(v) => setStringWeights({ ...stringWeights, peep: v })} placeholder="gr" id="peep" unit="gr" />
                <InputField label={t('field.dLoop')} value={stringWeights.dLoop} onChange={(v) => setStringWeights({ ...stringWeights, dLoop: v })} placeholder="gr" id="dLoop" unit="gr" />
                <InputField label={t('field.nockPoint')} value={stringWeights.nockPoint} onChange={(v) => setStringWeights({ ...stringWeights, nockPoint: v })} placeholder="gr" id="nockPoint" unit="gr" />
                <InputField label={t('field.silencers')} value={stringWeights.silencers} onChange={(v) => setStringWeights({ ...stringWeights, silencers: v })} placeholder="gr" id="silencers" unit="gr" />
                <InputField label={t('field.silencerDfc')} value={stringWeights.silencerDfc} onChange={(v) => setStringWeights({ ...stringWeights, silencerDfc: v })} placeholder="gr" id="silencerDfc" unit="gr" />
                <SelectField label={t('field.release')} value={stringWeights.releaseType} onChange={(v) => setStringWeights({ ...stringWeights, releaseType: v })} options={[
                  { value: 'Post Gate Release', label: t('option.release.post') },
                  { value: 'Pre Gate Release', label: t('option.release.pre') },
                ]} id="releaseType" />
                <SelectField label={t('field.stringMaterial')} value={stringWeights.stringMaterial} onChange={(v) => setStringWeights({ ...stringWeights, stringMaterial: v as typeof stringWeights.stringMaterial })} options={[
                  { value: 'unknown', label: t('option.stringMaterial.unknown') },
                  { value: 'fastflight', label: t('option.stringMaterial.fastflight') },
                  { value: 'dacron', label: t('option.stringMaterial.dacron') },
                ]} id="stringMaterial" />
              </FormSection>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
