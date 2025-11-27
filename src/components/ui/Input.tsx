import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string
    unit?: string
    required?: boolean
    tooltip?: string
}

export function Input({ label, unit, required, tooltip, id, ...props }: InputProps) {
    return (
        <div className="group">
            <div className="flex items-center justify-between gap-3 py-2">
                <label htmlFor={id} className="text-sm text-slate-300 flex items-center gap-1.5">
                    <span>{label}</span>
                    {required && <span className="text-amber-400 text-xs">*</span>}
                    {tooltip && (
                        <div className="relative inline-block">
                            <span className="cursor-help inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full border border-slate-600 text-slate-500 hover:border-sky-400 hover:text-sky-400 transition-colors">
                                ?
                            </span>
                            <div className="absolute left-0 top-6 z-50 invisible group-hover:visible w-72 p-3 text-xs leading-relaxed text-slate-200 bg-slate-900 border border-slate-600 rounded-lg shadow-xl whitespace-normal">
                                {tooltip}
                            </div>
                        </div>
                    )}
                </label>
                <div className="relative">
                    <input
                        id={id}
                        className="w-28 rounded-lg border border-slate-600/50 bg-slate-900/50 px-3 py-2 text-right text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                        {...props}
                    />
                    {unit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
                            {unit}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
