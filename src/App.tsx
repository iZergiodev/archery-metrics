import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useI18n } from './i18n.tsx'
import { calculateSpineMatch } from './utils/archeryCalculator'
import { BottomNav, type BottomNavItem } from './components/BottomNav'
import { StatusStrip } from './components/StatusStrip'
import { SectionTabs, type SectionTabId } from './components/SectionTabs'
import { SettingsSheet } from './components/SettingsSheet'
import { ResultsSummary } from './components/ResultsSummary'
import { TuningAssistant } from './components/TuningAssistant'
import { SetupComparator, type SetupComparisonEntry } from './components/SetupComparator'
import { FormSection } from './components/FormSection'
import { FieldGroup } from './components/FieldGroup'
import { InputField } from './components/InputField'
import { SelectField } from './components/SelectField'
import { DatabasePanel } from './components/DatabasePanel'
import type { ShaftEntry } from './data/equipment/types'
import { Search, SlidersHorizontal } from 'lucide-react'
import { buildTuningActions } from './utils/tuningAssistant'
import {
  formatInputDisplayValue,
  getUnitLabel,
  toCanonicalInputValue,
  type ConvertibleField,
  type UnitSystem,
} from './utils/unitSystem'

type ActiveTab = 'bow' | 'arrow' | 'string' | 'results'

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
  shaftUseCategory: 'base' as 'base' | 'hunting' | 'target',
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

const DESKTOP_QUERY = '(min-width: 1024px)'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isDesktop
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
  const [dbPanelOpen, setDbPanelOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const isDesktop = useIsDesktop()

  const spineMatch = useMemo(() => {
    console.log('%c── ARCHERY CONFIG ──', 'color:#D4A017;font-weight:bold')
    console.log('%cBOW', 'color:#60a5fa;font-weight:bold', {
      iboVelocity: bowSpecs.iboVelocity,
      drawWeight: bowSpecs.drawWeight,
      drawLength: bowSpecs.drawLength,
      braceHeight: bowSpecs.braceHeight,
      axleToAxle: bowSpecs.axleToAxle,
      percentLetoff: bowSpecs.percentLetoff,
      measuredChronoSpeed: bowSpecs.measuredChronoSpeed,
    })
    console.log('%cARROW', 'color:#34d399;font-weight:bold', {
      staticSpine: arrowSpecs.staticSpine,
      shaftLength: arrowSpecs.shaftLength,
      shaftGpi: arrowSpecs.shaftGpi,
      measuredArrowTotalWeight: arrowSpecs.measuredArrowTotalWeight,
      pointWeight: arrowSpecs.pointWeight,
      insertWeight: arrowSpecs.insertWeight,
      insertType: arrowSpecs.insertType,
      fletchQuantity: arrowSpecs.fletchQuantity,
      weightEach: arrowSpecs.weightEach,
      fletchLength: arrowSpecs.fletchLength,
      fletchHeight: arrowSpecs.fletchHeight,
      fletchOffset: arrowSpecs.fletchOffset,
      wrapWeight: arrowSpecs.wrapWeight,
      nockWeight: arrowSpecs.nockWeight,
      bushingPin: arrowSpecs.bushingPin,
      shaftUseCategory: arrowSpecs.shaftUseCategory,
    })
    console.log('%cSTRING', 'color:#f472b6;font-weight:bold', {
      peep: stringWeights.peep,
      dLoop: stringWeights.dLoop,
      nockPoint: stringWeights.nockPoint,
      silencers: stringWeights.silencers,
      silencerDfc: stringWeights.silencerDfc,
      releaseType: stringWeights.releaseType,
      stringMaterial: stringWeights.stringMaterial,
    })
    return calculateSpineMatch(bowSpecs, arrowSpecs, stringWeights)
  }, [bowSpecs, arrowSpecs, stringWeights])

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

  // Database entries are in imperial (canonical) units — write directly to state
  const applyDatabaseSelection = (shaft: ShaftEntry) => {
    setArrowSpecs((current) => ({
      ...current,
      staticSpine: shaft.spine.toString(),
      shaftGpi: shaft.gpi.toString(),
      shaftLength: shaft.stockLength.toString(),
      shaftUseCategory: shaft.useCategory,
      ...(shaft.nockWeight > 0 ? { nockWeight: shaft.nockWeight.toString() } : {}),
      ...(shaft.bushingPin > 0 ? { bushingPin: shaft.bushingPin.toString() } : {}),
      ...(shaft.pointInsert > 0 ? { insertWeight: shaft.pointInsert.toString() } : {}),
    }))
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

  const statusAccentColor: string = useMemo(() => {
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

  const formTab: SectionTabId = activeTab === 'results' ? 'bow' : activeTab

  const sectionTabs = [
    {
      id: 'bow' as const,
      label: t('nav.bow'),
      detail: `${bowProgress}/${BOW_CORE_FIELDS.length}`,
      complete: bowProgress === BOW_CORE_FIELDS.length,
    },
    {
      id: 'arrow' as const,
      label: t('nav.arrow'),
      detail: `${arrowProgress}/${ARROW_CORE_FIELDS.length}`,
      complete: arrowProgress === ARROW_CORE_FIELDS.length,
    },
    {
      id: 'string' as const,
      label: t('nav.string'),
      detail: `${stringProgress}/${STRING_CORE_FIELDS.length}`,
      complete: stringProgress === STRING_CORE_FIELDS.length,
    },
  ]

  const navItems: BottomNavItem[] = [
    { id: 'bow', label: t('nav.bow'), complete: bowProgress === BOW_CORE_FIELDS.length },
    { id: 'arrow', label: t('nav.arrow'), complete: arrowProgress === ARROW_CORE_FIELDS.length },
    { id: 'string', label: t('nav.string'), complete: stringProgress === STRING_CORE_FIELDS.length },
    {
      id: 'results',
      label: t('nav.results'),
      statusColor: spineMatch.status != null ? statusAccentColor : null,
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
            placeholder=""
            id="drawWeight"
            required
            unit={unitLabel('drawWeight')}
          />
          <InputField
            {...bowField('drawLength', 'length')}
            label={t('field.drawLength')}
            placeholder=""
            id="drawLength"
            required
            unit={unitLabel('length')}
          />
          <InputField
            {...bowField('iboVelocity', 'speed')}
            label={t('field.iboVelocity')}
            placeholder=""
            id="iboVelocity"
            required
            unit={unitLabel('speed')}
          />
          <InputField
            {...bowField('braceHeight', 'length')}
            label={t('field.braceHeight')}
            placeholder=""
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
            placeholder=""
            id="measuredChronoSpeed"
            unit={unitLabel('speed')}
            hint={t('field.measuredChronoSpeed.hint')}
            tooltip={t('field.measuredChronoSpeed.tooltip')}
          />
          <InputField
            {...bowField('axleToAxle', 'length')}
            label={t('field.axleToAxle')}
            placeholder=""
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
      <button
        onClick={() => setDbPanelOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-[var(--gold)]/30 bg-[var(--gold)]/5 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--gold)] transition-all duration-150 press-scale hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/10"
      >
        <Search size={14} />
        {t('db.button')}
      </button>
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
            placeholder=""
            id="shaftLength"
            required
            unit={unitLabel('length')}
          />
          <InputField
            {...arrowField('shaftGpi', 'linearDensity')}
            label={t('field.shaftGpi')}
            placeholder=""
            id="shaftGpi"
            unit={unitLabel('linearDensity')}
          />
          <InputField
            {...arrowField('pointWeight', 'componentWeight')}
            label={t('field.pointWeight')}
            placeholder=""
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
            placeholder=""
            id="measuredArrowTotalWeight"
            unit={unitLabel('componentWeight')}
            hint={t('field.measuredArrowTotalWeight.hint')}
          />
          <InputField
            {...arrowField('insertWeight', 'componentWeight')}
            label={t('field.insertWeight')}
            placeholder=""
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
            placeholder=""
            id="weightEach"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...arrowField('fletchLength', 'length')}
            label={t('field.fletchLength')}
            placeholder=""
            id="fletchLength"
            unit={unitLabel('length')}
          />
          <InputField
            {...arrowField('fletchHeight', 'length')}
            label={t('field.fletchHeight')}
            placeholder=""
            id="fletchHeight"
            unit={unitLabel('length')}
          />
          <InputField
            {...arrowField('fletchOffset', 'length')}
            label={t('field.fletchOffset')}
            placeholder=""
            id="fletchOffset"
            unit={unitLabel('length')}
          />
          <InputField
            {...arrowField('wrapWeight', 'componentWeight')}
            label={t('field.wrapWeight')}
            placeholder=""
            id="wrapWeight"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...arrowField('nockWeight', 'componentWeight')}
            label={t('field.nockWeight')}
            placeholder=""
            id="nockWeight"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...arrowField('bushingPin', 'componentWeight')}
            label={t('field.bushingPin')}
            placeholder=""
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
            placeholder=""
            id="dLoop"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...stringField('peep', 'componentWeight')}
            label={t('field.peep')}
            placeholder=""
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
            placeholder=""
            id="nockPoint"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...stringField('silencers', 'componentWeight')}
            label={t('field.silencers')}
            placeholder=""
            id="silencers"
            unit={unitLabel('componentWeight')}
          />
          <InputField
            {...stringField('silencerDfc', 'componentWeight')}
            label={t('field.silencerDfc')}
            placeholder=""
            id="silencerDfc"
            unit={unitLabel('componentWeight')}
          />
        </div>
      </FieldGroup>
    </FormSection>
  )

  const resultsContent = (
    <>
      <ResultsSummary
        result={spineMatch}
        matchColor={matchColor}
        matchLabel={matchLabel}
        getMatchIndexPosition={getMatchIndexPosition}
        unitSystem={unitSystem}
        t={t}
      />

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
    </>
  )

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header
        className="sticky top-0 z-40 safe-top"
        style={{ backgroundColor: 'rgba(11,11,11,0.94)', backdropFilter: 'blur(12px)' }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[560px] items-center justify-between px-4 lg:max-w-[1080px]">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--gold)]">{t('app.kicker')}</p>
            <h1 className="truncate text-[17px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
              {t('app.title')}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label={t('settings.title')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-all duration-150 press-scale hover:border-[var(--gold)]/40 hover:text-[var(--text-primary)]"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
        <div className="header-accent" />
      </header>

      <main className="mx-auto w-full max-w-[560px] px-4 pt-4 pb-[calc(9rem+env(safe-area-inset-bottom,0px))] lg:grid lg:max-w-[1080px] lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-10 lg:pb-16">
        <div className="min-w-0">
          {isDesktop && (
            <SectionTabs tabs={sectionTabs} active={formTab} onChange={(tab) => setActiveTab(tab)} />
          )}

          {(isDesktop || activeTab !== 'results') && (
            <div key={formTab} className="animate-fade-in">
              {formTab === 'bow' && renderBowSection()}
              {formTab === 'arrow' && renderArrowSection()}
              {formTab === 'string' && renderStringSection()}
            </div>
          )}

          {!isDesktop && activeTab === 'results' && (
            <div className="animate-fade-in">{resultsContent}</div>
          )}
        </div>

        {isDesktop && (
          <aside className="min-w-0">
            <div className="sticky top-20">{resultsContent}</div>
          </aside>
        )}
      </main>

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={saveConfiguration}
        onLoad={loadConfiguration}
        onClear={clearInputs}
        lang={lang}
        onSetLang={setLang}
        unitSystem={unitSystem}
        onSetUnitSystem={setGlobalUnitSystem}
        t={t}
      />

      <DatabasePanel
        open={dbPanelOpen}
        onClose={() => setDbPanelOpen(false)}
        onApply={applyDatabaseSelection}
        hasExistingData={arrowSpecs.staticSpine.trim() !== '' || arrowSpecs.shaftGpi.trim() !== '' || arrowSpecs.shaftLength.trim() !== ''}
        t={t}
      />

      {!isDesktop && (
        <div className="fixed inset-x-0 bottom-0 z-40">
          {spineMatch.status != null && activeTab !== 'results' && (
            <StatusStrip
              label={matchLabel}
              matchIndex={spineMatch.matchIndex}
              accentColor={statusAccentColor}
              textClass={matchColor}
              onClick={() => setActiveTab('results')}
              ariaLabel={t('nav.viewResults')}
            />
          )}
          <BottomNav
            items={navItems}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab)}
            ariaLabel={t('nav.aria')}
          />
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
    <section className="border-t border-[var(--border)] pt-4 animate-fade-slide-up">
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
