import type { SpineMatchStatus } from '../utils/archeryCalculator'

type SpineGaugeProps = {
    matchIndex: number | null
    status: SpineMatchStatus | null
    labels: {
        stiff: string
        good: string
        weak: string
        na: string
    }
}

export function SpineGauge({ matchIndex, status, labels }: SpineGaugeProps) {
    // Calculate angle for the needle (180° arc, 0° = stiff, 90° = good, 180° = weak)
    const getNeedleRotation = (index: number): number => {
        // Map 0.6-1.4 to 0-180 degrees
        const clamped = Math.max(0.6, Math.min(1.4, index))
        return ((clamped - 0.6) / 0.8) * 180
    }

    const getStatusColor = (s: SpineMatchStatus | null) => {
        switch (s) {
            case 'stiff': return 'text-sky-400'
            case 'good': return 'text-emerald-400'
            case 'weak': return 'text-amber-400'
            default: return 'text-slate-500'
        }
    }

    const getStatusLabel = (s: SpineMatchStatus | null) => {
        switch (s) {
            case 'stiff': return labels.stiff
            case 'good': return labels.good
            case 'weak': return labels.weak
            default: return labels.na
        }
    }

    const rotation = matchIndex != null ? getNeedleRotation(matchIndex) : 90

    return (
        <div className="flex flex-col items-center">
            {/* Gauge SVG */}
            <div className="relative w-48 h-28">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                    {/* Background arc segments */}
                    <defs>
                        <linearGradient id="stiffGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
                        </linearGradient>
                        <linearGradient id="goodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
                        </linearGradient>
                        <linearGradient id="weakGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>

                    {/* Stiff zone (0-60°) */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 60 34"
                        fill="none"
                        stroke="url(#stiffGradient)"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />

                    {/* Good zone (60-120°) */}
                    <path
                        d="M 60 34 A 80 80 0 0 1 140 34"
                        fill="none"
                        stroke="url(#goodGradient)"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />

                    {/* Weak zone (120-180°) */}
                    <path
                        d="M 140 34 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="url(#weakGradient)"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />

                    {/* Tick marks */}
                    {[0, 30, 60, 90, 120, 150, 180].map((angle) => {
                        const rad = (angle * Math.PI) / 180
                        const x1 = 100 - Math.cos(rad) * 65
                        const y1 = 100 - Math.sin(rad) * 65
                        const x2 = 100 - Math.cos(rad) * 72
                        const y2 = 100 - Math.sin(rad) * 72
                        return (
                            <line
                                key={angle}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="#475569"
                                strokeWidth="2"
                            />
                        )
                    })}

                    {/* Center point */}
                    <circle cx="100" cy="100" r="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />

                    {/* Needle */}
                    {matchIndex != null && (
                        <g transform={`rotate(${rotation} 100 100)`}>
                            <line
                                x1="100"
                                y1="100"
                                x2="100"
                                y2="30"
                                stroke="#f8fafc"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            <circle cx="100" cy="30" r="4" fill="#f8fafc" />
                        </g>
                    )}

                    {/* Center cap */}
                    <circle cx="100" cy="100" r="5" fill="#f8fafc" />
                </svg>

                {/* Labels */}
                <span className="absolute left-0 bottom-0 text-xs text-sky-400 font-medium">
                    {labels.stiff}
                </span>
                <span className="absolute left-1/2 -translate-x-1/2 -top-1 text-xs text-emerald-400 font-medium">
                    {labels.good}
                </span>
                <span className="absolute right-0 bottom-0 text-xs text-amber-400 font-medium">
                    {labels.weak}
                </span>
            </div>

            {/* Value display */}
            <div className="mt-2 text-center">
                <div className="text-3xl font-bold font-mono text-slate-100">
                    {matchIndex != null ? matchIndex.toFixed(3) : '--'}
                </div>
                <div className={`text-sm font-medium ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                </div>
            </div>
        </div>
    )
}
