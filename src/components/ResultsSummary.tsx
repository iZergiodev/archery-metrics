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
    <section className="border-b border-[rgba(255,255,255,0.08)] pb-6">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#facc15]/80">{t('summary.live')}</p>
          <h2 className={`mt-3 break-words text-[30px] font-semibold leading-none tracking-tight sm:text-[34px] ${matchColor}`}>{matchLabel}</h2>
          {metaParts.length > 0 && (
            <p className="mt-3 max-w-[20rem] break-words text-[11px] leading-relaxed text-[#6d6d6d]">{metaParts.join(' · ')}</p>
          )}
        </div>

        <div className="min-w-0 sm:text-right">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#5b5b5b]">{t('summary.matchIndex')}</div>
          <div className="mt-1 break-all font-mono text-[28px] text-[#f5f5f5] sm:text-[30px]">{result.matchIndex?.toFixed(3) ?? '--'}</div>
        </div>
      </div>

      {result.matchIndex != null && (
        <div className="mt-6 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#121212] px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a7a7a]">{t('summary.spineFit')}</div>
              <div className="mt-2 break-words text-[16px] font-medium text-[#f2f2f2]">{fitLabel}</div>
            </div>

            <div className="min-w-0 sm:text-right">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#7a7a7a]">{t('summary.fitScore')}</div>
              <div className="mt-1 font-mono text-[24px] text-[#facc15]">{fitPercent}%</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[#727272]">
              <span>{t('matchScale.stiff')}</span>
              <span>{t('summary.idealZone')}</span>
              <span>{t('matchScale.weak')}</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
              <div className="absolute inset-y-0 left-0 w-[28%] bg-[rgba(96,165,250,0.6)]" />
              <div className="absolute inset-y-0 left-[28%] w-[44%] bg-[rgba(250,204,21,0.78)]" />
              <div className="absolute inset-y-0 right-0 w-[28%] bg-[rgba(239,68,68,0.65)]" />
              <div className="absolute inset-y-[1px] left-[30%] right-[30%] rounded-full border border-[rgba(255,255,255,0.55)]" />
              <div
                className="absolute -top-1 h-5 w-[3px] rounded-full bg-[#f5f5f5] shadow-[0_0_0_2px_rgba(12,12,12,0.9)] transition-all duration-300"
                style={{ left: `${Math.max(2, Math.min(98, getMatchIndexPosition(result.matchIndex)))}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[#8c8c8c]">
              {t('summary.idealZone')}: 0.85 - 1.15
            </p>
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

      <div className="mt-6 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#131313] px-4 py-4">
        <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a7a7a]">{t('summary.primarySignal')}</div>
        <p className="mt-2 text-[13px] leading-relaxed text-[#d2d2d2]">{primarySignal}</p>
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
      <div className="break-words text-[10px] uppercase tracking-[0.14em] text-[#5f5f5f]">{label}</div>
      <div className="mt-1 break-all font-mono text-[17px] text-[#f0f0f0] sm:text-[19px]">
        {value}
        {unit && <span className="ml-1 text-[11px] text-[#6b6b6b]">{unit}</span>}
      </div>
    </div>
  )
}

function getIdealFitPercent(matchIndex: number): number {
  const normalizedDistance = Math.min(Math.abs(matchIndex - 1) / 0.4, 1)
  return Math.round((1 - normalizedDistance) * 100)
}
