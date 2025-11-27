import type { ReactNode } from 'react'

type MetricCardProps = {
    label: string
    value: string | number
    unit?: string
    icon?: ReactNode
    variant?: 'default' | 'highlight' | 'warning'
}

export function MetricCard({ label, value, unit, icon, variant = 'default' }: MetricCardProps) {
    const variantStyles = {
        default: 'border-slate-700/50 bg-slate-800/50',
        highlight: 'border-emerald-500/30 bg-emerald-900/20',
        warning: 'border-amber-500/30 bg-amber-900/20',
    }

    return (
        <div className={`rounded-xl border p-4 ${variantStyles[variant]}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                        {label}
                    </p>
                    <p className="text-xl font-bold font-mono text-slate-100 truncate">
                        {value}
                        {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
                    </p>
                </div>
                {icon && (
                    <div className="text-slate-500 flex-shrink-0">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    )
}
