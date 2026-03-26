import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useI18n } from './i18n.tsx'
import { calculateSpineMatch } from './utils/archeryCalculator'
import { Toolbar } from './components/Toolbar'
import { TabNavigation } from './components/TabNavigation'
import { ResultsSummary } from './components/ResultsSummary'
import { TuningAssistant } from './components/TuningAssistant'
import { SetupComparator, type SetupComparisonEntry } from './components/SetupComparator'
import { FormSection } from './components/FormSection'
import { FieldGroup } from './components/FieldGroup'
import { InputField } from './components/InputField'
import { SelectField } from './components/SelectField'
import { buildTuningActions } from './utils/tuningAssistant'
import {
  formatInputDisplayValue,
  getUnitLabel,
  toCanonicalInputValue,
  type ConvertibleField,
  type UnitSystem,
} from './utils/unitSystem'

type ActiveTab = 'bow' | 'arrow' | 'string'

const UNIT_SYSTEM_STORAGE_KEY = 'archery-unit-system'
const BOW_CORE_FIELDS = ['drawWeight', 'drawLength', 'iboVelocity', 'braceHeight'] as const
const ARROW_CORE_FIELDS = ['staticSpine', 'shaftLength', 'shaftGpi', 'pointWeight'] as const
const STRING_CORE_FIELDS = ['releaseType', 'stringMaterial', 'dLoop', 'peep'] as const

const initialBowSpecs = {
  iboVelocity: '',
  measuredChronoSpeed: '',
  drawLength: '',
  drawWeight: '',
  braceHeight: '',
  axleToAxle: '',
  percentLetoff: '',
}

const initialArrowSpecs = {
  pointWeight: '',
  insertWeight: '',
  shaftLength: '',
  shaftGpi: '',
  measuredArrowTotalWeight: '',
  fletchQuantity: '',
  weightEach: '',
  fletchLength: '',
  fletchHeight: '',
  fletchOffset: '',
  wrapWeight: '',
  nockWeight: '',
  bushingPin: '',
  staticSpine: '',
  shaftUseCategory: 'base' as const,
  insertType: 'default' as const,
}

const initialStringWeights = {
  peep: '',
  dLoop: '',
  nockPoint: '',
  silencers: '',
  silencerDfc: '',
  releaseType: 'Post Gate Release',
  stringMaterial: 'unknown' as 'dacron' | 'fastflight' | 'unknown',
}

function countFilledFields<T extends Record<string, string>>(state: T, fields: readonly (keyof T)[]) {
  return fields.filter((field) => state[field].trim() !== '').length
}

function getSavedConfiguration(slot: number) {
  const saved = localStorage.getItem(`archery-config-${slot}`)
  if (!saved) return null

  try {
    return JSON.parse(saved) as {
      bowSpecs?: Partial<typeof initialBowSpecs>
      arrowSpecs?: Partial<typeof initialArrowSpecs>
      stringWeights?: Partial<typeof initialStringWeights>
    }
  } catch {
    return null
  }
}

function App() {
  const { t, lang, setLang } = useI18n()
  const [activeTab, setActiveTab] = useState<ActiveTab>('bow')
  const [savedSetupsVersion, setSavedSetupsVersion] = useState(0)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    const saved = localStorage.getItem(UNIT_SYSTEM_STORAGE_KEY)
    return saved === 'metric' ? 'metric' : 'imperial'
  })

  const [bowSpecs, setBowSpecs] = useState(initialBowSpecs)
  const [arrowSpecs, setArrowSpecs] = useState(initialArrowSpecs)
  const [stringWeights, setStringWeights] = useState(initialStringWeights)

  const spineMatch = useMemo(
    () => calculateSpineMatch(bowSpecs, arrowSpecs, stringWeights),
    [bowSpecs, arrowSpecs, stringWeights],
  )

  const saveConfiguration = (slot: number) => {
    const config = { bowSpecs, arrowSpecs, stringWeights }
    localStorage.setItem(`archery-config-${slot}`, JSON.stringify(config))
    setSavedSetupsVersion((current) => current + 1)
  }

  const loadConfiguration = (slot: number) => {
    const saved = localStorage.getItem(`archery-config-${slot}`)
    if (saved) {
      const config = JSON.parse(saved)
      setBowSpecs({ ...initialBowSpecs, ...config.bowSpecs })
      setArrowSpecs({ ...initialArrowSpecs, ...config.arrowSpecs })
      setStringWeights({ ...initialStringWeights, ...config.stringWeights })
    }
  }

  const clearInputs = () => {
    setBowSpecs(initialBowSpecs)
    setArrowSpecs(initialArrowSpecs)
    setStringWeights(initialStringWeights)
  }

  const setGlobalUnitSystem = (nextUnitSystem: UnitSystem) => {
    setUnitSystem(nextUnitSystem)
    localStorage.setItem(UNIT_SYSTEM_STORAGE_KEY, nextUnitSystem)
  }

  const bindField = <T extends Record<string, string>>(
    state: T,
    setter: Dispatch<SetStateAction<T>>,
    field: keyof T,
    fieldType: ConvertibleField = 'none',
  ) => ({
    value: formatInputDisplayValue(state[field], fieldType, unitSystem),
    onChange: (nextValue: string) => {
      setter((current) => ({
        ...current,
        [field]: toCanonicalInputValue(nextValue, fieldType, unitSystem),
      }))
    },
  })

  const unitLabel = (fieldType: ConvertibleField) => getUnitLabel(fieldType, unitSystem)

  const bowField = <K extends keyof typeof bowSpecs>(field: K, fieldType: ConvertibleField = 'none') =>
    bindField(bowSpecs, setBowSpecs, field, fieldType)

  const arrowField = <K extends keyof typeof arrowSpecs>(field: K, fieldType: ConvertibleField = 'none') =>
    bindField(arrowSpecs, setArrowSpecs, field, fieldType)

  const stringField = <K extends keyof typeof stringWeights>(field: K, fieldType: ConvertibleField = 'none') =>
    bindField(stringWeights, setStringWeights, field, fieldType)

  const matchLabel: string = useMemo(() => {
    switch (spineMatch.status) {
      case 'weak':
        return t('match.weak')
      case 'stiff':
        return t('match.stiff')
      case 'good':
        return t('match.good')
      default:
        return t('match.na')
    }
  }, [spineMatch.status, t])

  const matchColor: string = useMemo(() => {
    switch (spineMatch.status) {
      case 'weak':
        return 'text-[var(--target-red)]'
      case 'stiff':
        return 'text-[var(--target-blue)]'
      case 'good':
        return 'text-[var(--gold)]'
      default:
        return 'text-[var(--text-secondary)]'
    }
  }, [spineMatch.status])

  const stickyBarBorderColor: string = useMemo(() => {
    switch (spineMatch.status) {
      case 'weak':
        return 'var(--target-red)'
      case 'stiff':
        return 'var(--target-blue)'
      case 'good':
        return 'var(--gold)'
      default:
        return 'var(--text-muted)'
    }
  }, [spineMatch.status])

  const tuningActions = useMemo(
    () => buildTuningActions(spineMatch, bowSpecs, arrowSpecs, unitSystem, t),
    [spineMatch, bowSpecs, arrowSpecs, unitSystem, t],
  )

  const comparisonEntries = useMemo<SetupComparisonEntry[]>(() => {
    const savedEntries = [1, 2, 3].flatMap((slot) => {
        const config = getSavedConfiguration(slot)
        if (!config) return []

        const savedBowSpecs = { ...initialBowSpecs, ...config.bowSpecs }
        const savedArrowSpecs = { ...initialArrowSpecs, ...config.arrowSpecs }
        const savedStringWeights = { ...initialStringWeights, ...config.stringWeights }

        return [{
          id: `slot-${slot}`,
          label: `${t('compare.slot')} ${slot}`,
          isCurrent: false,
          slot,
          setup: {
            bowSpecs: savedBowSpecs,
            arrowSpecs: savedArrowSpecs,
            stringWeights: savedStringWeights,
            result: calculateSpineMatch(savedBowSpecs, savedArrowSpecs, savedStringWeights),
          },
        } satisfies SetupComparisonEntry]
      })

    return [
      {
        id: 'current',
        label: t('compare.current'),
        isCurrent: true,
        setup: {
          bowSpecs,
          arrowSpecs,
          stringWeights,
          result: spineMatch,
        },
      },
      ...savedEntries,
    ]
  }, [arrowSpecs, bowSpecs, savedSetupsVersion, spineMatch, stringWeights, t])

  const bestComparisonEntryId = useMemo(() => {
    const candidates = comparisonEntries.filter((entry) => entry.setup.result.matchIndex != null)
    if (candidates.length === 0) return null

    return candidates
      .slice()
      .sort(
        (left, right) =>
          Math.abs((left.setup.result.matchIndex ?? 0) - 1) - Math.abs((right.setup.result.matchIndex ?? 0) - 1),
      )[0]
      ?.id ?? null
  }, [comparisonEntries])

  const getMatchIndexPosition = (matchIndex: number): number => {
    if (matchIndex <= 0.6) return 2
    if (matchIndex >= 1.4) return 98
    if (matchIndex <= 0.85) return 2 + ((matchIndex - 0.6) / 0.25) * 28
    if (matchIndex <= 1.15) return 30 + ((matchIndex - 0.85) / 0.3) * 40
    return 70 + ((matchIndex - 1.15) / 0.25) * 28
  }

  const bowProgress = countFilledFields(bowSpecs, BOW_CORE_FIELDS)
  const arrowProgress = countFilledFields(arrowSpecs, ARROW_CORE_FIELDS)
  const stringProgress = countFilledFields(stringWeights, STRING_CORE_FIELDS)
  const totalProgress = bowProgress + arrowProgress + stringProgress
  const totalCoreFields = BOW_CORE_FIELDS.length + ARROW_CORE_FIELDS.length + STRING_CORE_FIELDS.length

  const fitPercent = spineMatch.matchIndex != null
    ? Math.round((1 - Math.min(Math.abs(spineMatch.matchIndex - 1) / 0.4, 1)) * 100)
    : null

  const tabs = [
    {
      id: 'bow',
      label: t('section.bowSpecs'),
      icon: '01',
      detail: `${bowProgress}/${BOW_CORE_FIELDS.length}`,
      complete: bowProgress === BOW_CORE_FIELDS.length,
    },
    {
      id: 'arrow',
      label: t('section.arrowSpecs'),
      icon: '02',
      detail: `${arrowProgress}/${ARROW_CORE_FIELDS.length}`,
      complete: arrowProgress === ARROW_CORE_FIELDS.length,
    },
    {
      id: 'string',
      label: t('section.weightOnString'),
      icon: '03',
      detail: `${stringProgress}/${STRING_CORE_FIELDS.length}`,
      complete: stringProgress === STRING_CORE_FIELDS.length,
    },
  ]

  const renderBowSection = () => (
    <FormSection
      title={t('section.bowSpecs')}
      icon="01"
      eyebrow={`${bowProgress}/${BOW_CORE_FIELDS.length} ${t('app.progress')}`}
      description={t('section.bowSpecs.description')}
    >
      <FieldGroup title={t('group.core')}>
        <div className="space-y-5">
          <InputField
            {...bowField('drawWeight', 'drawWeight')}
            label={t('field.drawWeight')}
            placeholder={unitLabel('drawWeight')}
            id="drawWeight"
            required
            unit={unitLabel('drawWeight')}
          />
          <InputField
            {...bowField('drawLength', 'length')}
            label={t('field.drawLength')}
            placeholder={unitLabel('length')}
            id="drawLength"
            required
            unit={unitLabel('length')}
          />
          <InputField
            {...bowField('iboVelocity', 'speed')}
            label={t('field.iboVelocity')}
            placeholder={unitLabel('speed')}
            id="iboVelocity"
            required
            unit={unitLabel('speed')}
          />
          <InputField
            {...bowField('braceHeight', 'length')}
            label={t('field.braceHeight')}
            placeholder={unitLabel('length')}
            id="braceHeight"
            required
            unit={unitLabel('length')}
          />
        </div>
      </FieldGroup>

      <FieldGroup title={t('group.advanced')} collapsible defaultCollapsed>
        <div className="space-y-5">
          <InputField
            {...bowField('measuredChronoSpeed', 'speed')}
            label={t('field.measuredChronoSpeed')}
            placeholder={unitLabel('speed')}
            id="measuredChronoSpeed"
            unit={unitLabel('speed')}
            hint={t('field.measuredChronoSpeed.hint')}
            tooltip={t('field.measuredChronoSpeed.tooltip')}
          />
          <InputField
            {...bowField('axleToAxle', 'length')}
            label={t('field.axleToAxle')}
            placeholder={unitLabel('length')}
            id="axleToAxle"
            unit={unitLabel('length')}
          />
          <InputField
            {...bowField('percentLetoff')}
            label={t('field.percentLetoff')}
            placeholder="%"
            id="percentLetoff"
            unit="%"
          />
        </div>
      </FieldGroup>
    </FormSection>
  )

  const renderArrowSection = () => (
    <FormSection
      title={t('section.arrowSpecs')}
      icon="02"
      eyebrow={`${arrowProgress}/${ARROW_CORE_FIELDS.length} ${t('app.progress')}`}
      description={t('section.arrowSpecs.description')}
    >
      <FieldGroup title={t('group.core')}>
        <div className="space-y-5">
          <InputField
            {...arrowField('staticSpine')}
            label={t('field.staticSpine')}
            placeholder="0.400"
            id="staticSpine"
            required
            step="0.001"
            tooltip={t('field.staticSpine.tooltip')}
            hint={t('field.staticSpine.hint')}
          />
          <InputField
            {...arrowField('shaftLength', 'length')}
            label={t('field.shaftLength')}
            placeholder={unitLabel('length')}
            id="shaftLength"
            required
            unit={unitLabel('length')}
          />
          <InputField
            {...arrowField('shaftGpi', 'linearDensity')}
            label={t('field.shaftGpi')}
            placeholder={unitLabel('linearDensity')}
            id="shaftGpi"
            unit={unitLabel('linearDensity')}
          />
          <InputField
            {...arrowField('pointWeight', 'componentWeight')}
            label={t('field.pointWeight')}
            placeholder={unitLabel('componentWeight')}
            id="pointWeight"
            unit={unitLabel('componentWeight')}
          />
        </div>
      </FieldGroup>

      <FieldGroup title={t('group.build')} collapsible defaultCollapsed>
        <div className="space-y-5">
          <InputField
            {...arrowField('measuredArrowTotalWeight', 'componentWeight')}
            label={t('field.measuredArrowTotalWeight')}
            placeholder={unitLabel('componentWeight')}
            id="measuredArrowTotalWeight"
            unit={unitLabel('componentWeight')}
            hint={t('field.measuredArrowTotalWeight.hint')}
          />
          <InputField
            {...arrowField('insertWeight', 'componentWeight')}
            label={t('field.insertWeight')}
            placeholder={unitLabel('componentWeight')}
            id="insertWeight"
            unit={unitLabel('componentWeight')}
          />
          <SelectField
            label={t('field.insertType')}
            value={arrowSpecs.insertType}
            onChange={(value) =>
              setArrowSpecs({
                ...arrowSpecs,
                insertType: value as typeof arrowSpecs.insertType,
              })
            }
            options={[
              { value: 'default', label: t('option.insertType.default') },
              { value: 'shallow', label: t('option.insertType.shallow') },
              { value: 'halfOutsert', label: t('option.insertType.halfOutsert') },
              { value: 'fullOutsert', label: t('option.insertType.fullOutsert') },
              { value: 'extendedOutsert', label: t('option.insertType.extendedOutsert') },
            ]}
            id="insertType"
          />
          <SelectField
            label={t('field.shaftUseCategory')}
            value={arrowSpecs.shaftUseCategory}
            onChange={(value) =>
              setArrowSpecs({
                ...arrowSpecs,
                shaftUseCategory: value as typeof arrowSpecs.shaftUseCategory,
              })
            }
            options={[
              { value: 'base', label: t('option.shaftUse.base') },
              { value: 'hunting', label: t('option.shaftUse.hunting') },
              { value: 'target', label: t('option.shaftUse.target') },
            ]}
            id="shaftUseCategory"
          />
          <InputField
            {...arrowField('fletchQuantity')}
            label={t('field.fletchQuantity')}
            placeholder="#"
            id="fletchQuantity"
          />
          <InputField
            {...arrowField('weightEach', 'componentWeight')}
            label={t('field.weightEach')}
            placeholder={unitLabel('componentWeight')}
            id="weightEach"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...arrowField('fletchLength', 'length')}
            label={t('field.fletchLength')}
            placeholder={unitLabel('length')}
            id="fletchLength"
            unit={unitLabel('length')}
          />
          <InputField
            {...arrowField('fletchHeight', 'length')}
            label={t('field.fletchHeight')}
            placeholder={unitLabel('length')}
            id="fletchHeight"
            unit={unitLabel('length')}
          />
          <InputField
            {...arrowField('fletchOffset', 'length')}
            label={t('field.fletchOffset')}
            placeholder={unitLabel('length')}
            id="fletchOffset"
            unit={unitLabel('length')}
          />
          <InputField
            {...arrowField('wrapWeight', 'componentWeight')}
            label={t('field.wrapWeight')}
            placeholder={unitLabel('componentWeight')}
            id="wrapWeight"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...arrowField('nockWeight', 'componentWeight')}
            label={t('field.nockWeight')}
            placeholder={unitLabel('componentWeight')}
            id="nockWeight"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...arrowField('bushingPin', 'componentWeight')}
            label={t('field.bushingPin')}
            placeholder={unitLabel('componentWeight')}
            id="bushingPin"
            unit={unitLabel('componentWeight')}
          />
        </div>
      </FieldGroup>
    </FormSection>
  )

  const renderStringSection = () => (
    <FormSection
      title={t('section.weightOnString')}
      icon="03"
      eyebrow={`${stringProgress}/${STRING_CORE_FIELDS.length} ${t('app.progress')}`}
      description={t('section.weightOnString.description')}
    >
      <FieldGroup title={t('group.release')}>
        <div className="space-y-5">
          <SelectField
            label={t('field.release')}
            value={stringWeights.releaseType}
            onChange={(value) => setStringWeights({ ...stringWeights, releaseType: value })}
            options={[
              { value: 'manual fingers', label: t('option.release.finger') },
              { value: 'Rope Release', label: t('option.release.rope') },
              { value: 'Caliper Release', label: t('option.release.caliper') },
              { value: 'Post Gate Release', label: t('option.release.post') },
              { value: 'Pre Gate Release', label: t('option.release.pre') },
            ]}
            id="releaseType"
          />
          <SelectField
            label={t('field.stringMaterial')}
            value={stringWeights.stringMaterial}
            onChange={(value) =>
              setStringWeights({
                ...stringWeights,
                stringMaterial: value as typeof stringWeights.stringMaterial,
              })
            }
            options={[
              { value: 'unknown', label: t('option.stringMaterial.unknown') },
              { value: 'fastflight', label: t('option.stringMaterial.fastflight') },
              { value: 'dacron', label: t('option.stringMaterial.dacron') },
            ]}
            id="stringMaterial"
          />
          <InputField
            {...stringField('dLoop', 'componentWeight')}
            label={t('field.dLoop')}
            placeholder={unitLabel('componentWeight')}
            id="dLoop"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...stringField('peep', 'componentWeight')}
            label={t('field.peep')}
            placeholder={unitLabel('componentWeight')}
            id="peep"
            unit={unitLabel('componentWeight')}
          />
        </div>
      </FieldGroup>

      <FieldGroup title={t('group.accessories')} collapsible defaultCollapsed>
        <div className="space-y-5">
          <InputField
            {...stringField('nockPoint', 'componentWeight')}
            label={t('field.nockPoint')}
            placeholder={unitLabel('componentWeight')}
            id="nockPoint"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...stringField('silencers', 'componentWeight')}
            label={t('field.silencers')}
            placeholder={unitLabel('componentWeight')}
            id="silencers"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...stringField('silencerDfc', 'componentWeight')}
            label={t('field.silencerDfc')}
            placeholder={unitLabel('componentWeight')}
            id="silencerDfc"
            unit={unitLabel('componentWeight')}
          />
        </div>
      </FieldGroup>
    </FormSection>
  )

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] safe-top" style={{ backgroundColor: 'rgba(11,11,11,0.94)', backdropFilter: 'blur(12px)' }}>
        <div className="mx-auto max-w-[560px] px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--gold)]">{t('app.kicker')}</p>
                <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">{t('app.title')}</h1>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {totalProgress}/{totalCoreFields} {t('app.progress')}
                </p>
              </div>
            </div>

            <Toolbar
              onSave={saveConfiguration}
              onLoad={loadConfiguration}
              onClear={clearInputs}
              lang={lang}
              onSetLang={setLang}
              unitSystem={unitSystem}
              onSetUnitSystem={setGlobalUnitSystem}
              t={t}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[560px] px-4 py-4" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
        {/* Tabs first - immediately accessible */}
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as ActiveTab)} />

        {/* Form content - primary interaction area */}
        <div>
          {activeTab === 'bow' && renderBowSection()}
          {activeTab === 'arrow' && renderArrowSection()}
          {activeTab === 'string' && renderStringSection()}
        </div>

        {/* Results below form */}
        <div className="mt-8">
          <ResultsSummary
            result={spineMatch}
            matchColor={matchColor}
            matchLabel={matchLabel}
            getMatchIndexPosition={getMatchIndexPosition}
            unitSystem={unitSystem}
            t={t}
          />
        </div>

        <TuningAssistant actions={tuningActions} status={spineMatch.status} t={t} />

        {(spineMatch.warnings.length > 0 || spineMatch.recommendations.length > 0) && (
          <div className="mt-6 space-y-5">
            {spineMatch.warnings.length > 0 && (
              <AlertPanel title={t('alerts.warnings')} tone="warning" items={spineMatch.warnings} />
            )}
            {spineMatch.recommendations.length > 0 && (
              <AlertPanel title={t('alerts.recommendations')} tone="info" items={spineMatch.recommendations} />
            )}
          </div>
        )}

        <SetupComparator
          entries={comparisonEntries}
          bestEntryId={bestComparisonEntryId}
          onLoadSlot={loadConfiguration}
          unitSystem={unitSystem}
          t={t}
        />
      </main>

      {/* Sticky bottom match indicator */}
      {spineMatch.status != null && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
          style={{ backgroundColor: 'rgba(11,11,11,0.92)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className="mx-auto flex h-12 max-w-[560px] items-center gap-4 px-4"
            style={{ borderLeft: `3px solid ${stickyBarBorderColor}` }}
          >
            <span className={`text-[13px] font-semibold ${matchColor}`}>{matchLabel}</span>
            <span className="font-mono text-[14px] text-[var(--text-primary)]">
              {spineMatch.matchIndex?.toFixed(3) ?? '--'}
            </span>
            {fitPercent != null && (
              <span className="ml-auto text-[12px] text-[var(--text-secondary)]">
                {fitPercent}% fit
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AlertPanel({
  title,
  tone,
  items,
}: {
  title: string
  tone: 'warning' | 'info'
  items: string[]
}) {
  const titleColor = tone === 'warning' ? 'text-[var(--target-red)]' : 'text-[var(--target-blue)]'

  return (
    <section className="border-t border-[var(--border)] pt-4">
      <h3 className={`text-[10px] uppercase tracking-[0.28em] ${titleColor}`}>{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default App
