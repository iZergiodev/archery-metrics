import type { SpineMatchResult } from '../utils/archeryCalculator'

interface ResultsSummaryProps {
  result: SpineMatchResult
  matchColor: string
  matchLabel: string
  getMatchIndexPosition: (index: number) => number
}

export function ResultsSummary({ result, matchColor, matchLabel, getMatchIndexPosition }: ResultsSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Quick Stats Grid - 2x3 on mobile, inline on desktop */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3">
        <StatBox
          label="Spine Requerido"
          value={result.spineRequired?.toFixed(3) ?? '--'}
          unit=""
          color="text-slate-300"
        />
        <StatBox
          label="Spine Efectivo"
          value={result.spineDynamic?.toFixed(3) ?? '--'}
          unit=""
          color="text-slate-300"
        />
        <StatBox
          label="Estado"
          value={matchLabel}
          unit=""
          color={matchColor}
          isStatus
        />
        <StatBox
          label="Peso Flecha"
          value={result.arrowTotalWeight > 0 ? result.arrowTotalWeight.toFixed(0) : '--'}
          unit="gr"
          color="text-slate-300"
        />
        <StatBox
          label="Velocidad"
          value={result.calculatedFPS?.toFixed(0) ?? '--'}
          unit="FPS"
          color="text-slate-300"
        />
        <StatBox
          label="FOC"
          value={result.foc?.toFixed(1) ?? '--'}
          unit="%"
          color="text-slate-300"
        />
      </div>

      {/* Match Index Visual Bar */}
      {result.matchIndex != null && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span className="text-sky-400 font-medium">{result.matchIndex.toFixed(3)}</span>
            <span className={`font-medium ${matchColor}`}>{matchLabel}</span>
          </div>

          <div className="relative h-4 rounded-full overflow-hidden flex">
            <div className="w-[30%] bg-red-600/60"></div>
            <div className="w-[40%] bg-emerald-600/60"></div>
            <div className="w-[30%] bg-sky-600/60"></div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
            <span>{result.matchIndex < 0.85 ? 'RÍGIDO' : ''}</span>
            <span className="text-emerald-400">OPTIMO</span>
            <span>{result.matchIndex > 1.15 ? 'FLEXIBLE' : ''}</span>
          </div>

          {/* Indicator needle */}
          <div
            className="absolute top-0 h-10 w-0.5 bg-white shadow-lg transition-all duration-300"
            style={{
              left: `${Math.max(2, Math.min(98, getMatchIndexPosition(result.matchIndex)))}%`
            }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow"></div>
          </div>
        </div>
      )}

      {/* Confidence Indicator */}
      {result.matchIndexCI && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Confianza:</span>
          <span className={`px-2 py-0.5 rounded ${
            result.matchIndexCI.confidence === 'high' ? 'bg-emerald-900/30 text-emerald-400' :
            result.matchIndexCI.confidence === 'medium' ? 'bg-amber-900/30 text-amber-400' :
            'bg-slate-700 text-slate-400'
          }`}>
            {result.matchIndexCI.confidence === 'high' ? 'Alta' :
             result.matchIndexCI.confidence === 'medium' ? 'Media' : 'Baja'}
          </span>
          {result.temperature !== undefined && (
            <span className="ml-auto">
              {result.temperature}°F
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface StatBoxProps {
  label: string
  value: string
  unit: string
  color: string
  isStatus?: boolean
}

function StatBox({ label, value, unit, color, isStatus }: StatBoxProps) {
  return (
    <div className={`
      bg-slate-800/50 rounded-lg px-3 py-2 min-w-[100px]
      ${isStatus ? '' : 'border border-slate-700/50'}
    `}>
      <div className="text-[10px] uppercase text-slate-500 truncate">{label}</div>
      <div className={`font-mono text-sm md:text-base ${color}`}>
        {value}
        {unit && <span className="text-slate-500 text-xs ml-0.5">{unit}</span>}
      </div>
    </div>
  )
}
