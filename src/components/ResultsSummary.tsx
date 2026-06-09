import type { SpineMatchResult } from '../utils/archeryCalculator'
import {
  formatResultDisplayValue,
  formatTemperatureDisplayValue,
  getTemperatureUnitLabel,
  getUnitLabel,
  type UnitSystem,
} from '../utils/unitSystem'

interface ResultsSummaryProps {
  result: SpineMatchResult
  matchColor: string
  matchLabel: string
  getMatchIndexPosition: (index: number) => number
  unitSystem: UnitSystem
  t: (key: string) => string
}

export function ResultsSummary({
  result,
  matchColor,
  matchLabel,
  getMatchIndexPosition,
  unitSystem,
  t,
}: ResultsSummaryProps) {
  const primarySignal = result.warnings[0] ?? result.recommendations[0] ?? t('summary.readyHint')
  const fitPercent = result.matchIndex != null ? getIdealFitPercent(result.matchIndex) : null
  const confidenceLabel =
    result.matchIndexCI?.confidence === 'high'
      ? t('confidence.high')
      : result.matchIndexCI?.confidence === 'medium'
        ? t('confidence.medium')
        : result.matchIndexCI?.confidence === 'low'
          ? t('confidence.low')
          : null

  const metaParts = [
    t(`archeryType.${result.archeryType}`),
    result.usedChronographData ? t('summary.chronoActive') : null,
    confidenceLabel ? `${t('summary.confidence')}: ${confidenceLabel}` : null,
    result.temperature !== undefined
      ? `${formatTemperatureDisplayValue(result.temperature, unitSystem)}${getTemperatureUnitLabel(unitSystem)}`
      : null,
  ].filter(Boolean)
  const fitLabel =
    result.matchIndex == null
      ? null
      : result.matchIndex >= 0.85 && result.matchIndex <= 1.15
        ? t('summary.fitIdeal')
        : result.matchIndex >= 0.75 && result.matchIndex <= 1.25
          ? t('summary.fitNear')
          : t('summary.fitOff')

  return (
    <section className="pb-2" aria-labelledby="results-heading">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start" role="status" aria-live="polite">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--gold)]/80">{t('summary.live')}</p>
          <h2
            id="results-heading"
            className={`mt-3 break-words text-[34px] font-semibold leading-none tracking-tight sm:text-[38px] ${matchColor}`}
          >
            {matchLabel}
          </h2>
          {metaParts.length > 0 && (
            <p className="mt-3 max-w-[20rem] break-words text-[11px] leading-relaxed text-[var(--text-muted)]">{metaParts.join(' · ')}</p>
          )}
        </div>

        <div className="min-w-0 sm:text-right">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">{t('summary.matchIndex')}</div>
          <div className="mt-1 break-all font-mono text-[28px] text-[var(--text-primary)] sm:text-[30px]">{result.matchIndex?.toFixed(3) ?? '--'}</div>
        </div>
      </div>

      {result.matchIndex != null && (
        <div className="mt-6 rounded-[14px] border border-[var(--border)] card-surface px-4 py-4 animate-fade-slide-up">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('summary.spineFit')}</div>
              <div className="mt-2 break-words text-[16px] font-medium text-[var(--text-primary)]">{fitLabel}</div>
            </div>

            <div className="min-w-0 sm:text-right">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{t('summary.fitScore')}</div>
              <div className="mt-1 font-mono text-[24px] text-[var(--gold)]">{fitPercent}%</div>
            </div>
          </div>

          <div className="relative mt-4">
            {/* Target ring accents behind match bar */}
            <svg className="pointer-events-none absolute -inset-x-2 -inset-y-4 h-[calc(100%+2rem)] w-[calc(100%+1rem)]" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
              <ellipse cx="100" cy="30" rx="95" ry="28" fill="none" stroke="var(--target-red)" strokeWidth="0.5" opacity="0.06" />
              <ellipse cx="100" cy="30" rx="65" ry="20" fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.08" />
              <ellipse cx="100" cy="30" rx="35" ry="12" fill="none" stroke="var(--target-blue)" strokeWidth="0.5" opacity="0.06" />
            </svg>

            <div className="relative">
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                <span>{t('matchScale.stiff')}</span>
                <span>{t('summary.idealZone')}</span>
                <span>{t('matchScale.weak')}</span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="absolute inset-y-0 left-0 w-[28%]" style={{ backgroundColor: 'rgba(0, 161, 222, 0.6)' }} />
                <div className="absolute inset-y-0 left-[28%] w-[44%]" style={{ backgroundColor: 'rgba(212, 160, 23, 0.78)' }} />
                <div className="absolute inset-y-0 right-0 w-[28%]" style={{ backgroundColor: 'rgba(224, 60, 49, 0.65)' }} />
                <div className="absolute inset-y-[1px] left-[30%] right-[30%] rounded-full border border-[rgba(255,255,255,0.55)]" />
                <div
                  className="absolute -top-1 h-5 w-[3px] rounded-full bg-[var(--text-primary)] transition-all duration-400"
                  style={{
                    left: `${Math.max(2, Math.min(98, getMatchIndexPosition(result.matchIndex)))}%`,
                    boxShadow: '0 0 0 2px rgba(11,11,11,0.9), 0 0 8px rgba(212, 160, 23, 0.5)',
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                {t('summary.idealZone')}: 0.85 - 1.15
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-6">
        <StatRow label={t('summary.spineRequired')} value={result.spineRequired?.toFixed(3) ?? '--'} />
        <StatRow label={t('summary.spineDynamic')} value={result.spineDynamic?.toFixed(3) ?? '--'} />
        <StatRow
          label={t('summary.arrowWeight')}
          value={
            result.arrowTotalWeight > 0
              ? formatResultDisplayValue(result.arrowTotalWeight, 'componentWeight', unitSystem)
              : '--'
          }
          unit={getUnitLabel('componentWeight', unitSystem)}
        />
        <StatRow
          label={result.usedChronographData ? t('summary.measuredSpeed') : t('summary.speed')}
          value={formatResultDisplayValue(result.effectiveFPS, 'speed', unitSystem)}
          unit={getUnitLabel('speed', unitSystem)}
        />
        {result.usedChronographData && (
          <StatRow
            label={t('summary.estimatedSpeed')}
            value={formatResultDisplayValue(result.calculatedFPS, 'speed', unitSystem)}
            unit={getUnitLabel('speed', unitSystem)}
          />
        )}
        <StatRow
          label={t('summary.foc')}
          value={result.foc?.toFixed(1) ?? '--'}
          unit="%"
          className={result.usedChronographData ? '' : 'col-span-2'}
        />
      </div>

      <div className="mt-6 rounded-[14px] border border-[var(--border)] card-surface px-4 py-4 animate-fade-slide-up stagger-2">
        <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('summary.primarySignal')}</div>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">{primarySignal}</p>
      </div>
    </section>
  )
}

function StatRow({
  label,
  value,
  unit,
  className = '',
}: {
  label: string
  value: string
  unit?: string
  className?: string
}) {
  return (
    <div className={className}>
      <div className="break-words text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 break-all font-mono text-[17px] text-[var(--text-primary)] sm:text-[19px]">
        {value}
        {unit && <span className="ml-1 text-[11px] text-[var(--text-muted)]">{unit}</span>}
      </div>
    </div>
  )
}

function getIdealFitPercent(matchIndex: number): number {
  const normalizedDistance = Math.min(Math.abs(matchIndex - 1) / 0.4, 1)
  return Math.round((1 - normalizedDistance) * 100)
}
