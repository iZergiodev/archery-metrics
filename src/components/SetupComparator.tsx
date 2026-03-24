import type { SpineMatchResult } from '../utils/archeryCalculator'
import { formatResultDisplayValue, getUnitLabel, type UnitSystem } from '../utils/unitSystem'
import { analyzeSetupDifference, type ComparisonFactor, type SetupSnapshot } from '../utils/setupComparison'

export type SetupComparisonEntry = {
  id: string
  label: string
  isCurrent: boolean
  slot?: number
  setup: SetupSnapshot
}

interface SetupComparatorProps {
  entries: SetupComparisonEntry[]
  bestEntryId: string | null
  onLoadSlot: (slot: number) => void
  unitSystem: UnitSystem
  t: (key: string) => string
}

export function SetupComparator({
  entries,
  bestEntryId,
  onLoadSlot,
  unitSystem,
  t,
}: SetupComparatorProps) {
  const currentEntry = entries.find((entry) => entry.isCurrent) ?? null

  return (
    <section className="mt-6 border-t border-[var(--border)] pt-4">
      <div className="min-w-0">
        <h3 className="text-[10px] uppercase tracking-[0.28em] text-[var(--gold)]">{t('compare.title')}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">{t('compare.subtitle')}</p>
      </div>

      {entries.length > 1 ? (
        <div className="mt-4 grid gap-3">
          {entries.map((entry) => (
            <ComparisonCard
              key={entry.id}
              entry={entry}
              currentEntry={currentEntry}
              bestEntryId={bestEntryId}
              onLoadSlot={onLoadSlot}
              unitSystem={unitSystem}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4 text-[13px] leading-relaxed text-[var(--text-secondary)]">
          {t('compare.empty')}
        </div>
      )}
    </section>
  )
}

function ComparisonCard({
  entry,
  currentEntry,
  bestEntryId,
  onLoadSlot,
  unitSystem,
  t,
}: {
  entry: SetupComparisonEntry
  currentEntry: SetupComparisonEntry | null
  bestEntryId: string | null
  onLoadSlot: (slot: number) => void
  unitSystem: UnitSystem
  t: (key: string) => string
}) {
  const analysis = !entry.isCurrent && currentEntry ? analyzeSetupDifference(currentEntry.setup, entry.setup) : null

  return (
    <article className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[14px] font-medium text-[var(--text-primary)]">{entry.label}</h4>
            {bestEntryId === entry.id && (
              <span className="rounded-full bg-[var(--gold)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--bg-primary)]">
                {t('compare.best')}
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">{getStatusLabel(entry.setup.result.status, t)}</p>
        </div>

        {!entry.isCurrent && entry.slot != null && (
          <button
            onClick={() => onLoadSlot(entry.slot!)}
            className="shrink-0 rounded-[10px] border border-[var(--border)] px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          >
            {t('compare.load')}
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric
          label={t('summary.matchIndex')}
          value={entry.setup.result.matchIndex?.toFixed(3) ?? '--'}
        />
        <Metric
          label={t('summary.speed')}
          value={formatResultDisplayValue(entry.setup.result.effectiveFPS, 'speed', unitSystem)}
          unit={getUnitLabel('speed', unitSystem)}
        />
        <Metric
          label={t('summary.arrowWeight')}
          value={formatResultDisplayValue(entry.setup.result.arrowTotalWeight, 'componentWeight', unitSystem)}
          unit={getUnitLabel('componentWeight', unitSystem)}
        />
      </div>

      <div className="mt-4 border-t border-[var(--border)] pt-3">
        {entry.isCurrent ? (
          <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">{t('compare.baseline')}</p>
        ) : (
          <ComparisonDetails analysis={analysis} unitSystem={unitSystem} t={t} />
        )}
      </div>
    </article>
  )
}

function ComparisonDetails({
  analysis,
  unitSystem,
  t,
}: {
  analysis: ReturnType<typeof analyzeSetupDifference> | null
  unitSystem: UnitSystem
  t: (key: string) => string
}) {
  if (!analysis) {
    return <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">{t('compare.noFactors')}</p>
  }

  const proximityText = getProximityText(analysis, t)
  const driverText = getDriverText(analysis.driver, t)

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-[12px] font-medium text-[var(--text-primary)]">{proximityText}</p>
        {driverText && <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">{driverText}</p>}
      </div>

      {analysis.factors.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{t('compare.factorsTitle')}</p>
          <ul className="space-y-2">
            {analysis.factors.map((factor) => (
              <li key={factor.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] text-[var(--text-primary)]">{getFactorLabel(factor.id, t)}</p>
                  <p className="mt-0.5 break-words text-[11px] text-[var(--text-secondary)]">
                    {formatFactorValues(factor, unitSystem)}
                  </p>
                </div>
                <span className={getFactorToneClass(factor.effect)}>
                  {factor.effect === 'weaker' ? t('compare.effect.weaker') : t('compare.effect.stiffer')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">{t('compare.noFactors')}</p>
      )}
    </div>
  )
}

function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 break-all font-mono text-[15px] text-[var(--text-primary)]">
        {value}
        {unit && <span className="ml-1 text-[11px] text-[var(--text-muted)]">{unit}</span>}
      </div>
    </div>
  )
}

function getProximityText(analysis: ReturnType<typeof analyzeSetupDifference>, t: (key: string) => string) {
  if (analysis.proximity === 'same' || analysis.proximityDelta == null) {
    return t('compare.proximity.same')
  }

  if (analysis.proximity === 'unknown') {
    return t('compare.noFactors')
  }

  return `${Math.abs(analysis.proximityDelta).toFixed(3)} ${t(`compare.proximity.${analysis.proximity}`)}`
}

function getDriverText(driver: ReturnType<typeof analyzeSetupDifference>['driver'], t: (key: string) => string) {
  if (driver === 'unknown') return ''
  return t(`compare.driver.${driver}`)
}

function getFactorLabel(factorId: ComparisonFactor['id'], t: (key: string) => string) {
  return t(`compare.factor.${factorId}`)
}

function formatFactorValues(factor: ComparisonFactor, unitSystem: UnitSystem) {
  if (factor.displayField === 'staticSpine') {
    return `${factor.currentValue.toFixed(3)} -> ${factor.compareValue.toFixed(3)}`
  }

  const unit = getUnitLabel(factor.displayField, unitSystem)
  return `${formatResultDisplayValue(factor.currentValue, factor.displayField, unitSystem)} -> ${formatResultDisplayValue(factor.compareValue, factor.displayField, unitSystem)} ${unit}`
}

function getFactorToneClass(effect: ComparisonFactor['effect']) {
  return effect === 'weaker'
    ? 'shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--target-red)]'
    : 'shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--target-blue)]'
}

function getStatusLabel(status: SpineMatchResult['status'], t: (key: string) => string) {
  switch (status) {
    case 'weak':
      return t('match.weak')
    case 'stiff':
      return t('match.stiff')
    case 'good':
      return t('match.good')
    default:
      return t('match.na')
  }
}
