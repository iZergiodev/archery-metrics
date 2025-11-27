import type { SelectHTMLAttributes, ReactNode } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    label: string
    children: ReactNode
}

export function Select({ label, id, children, ...props }: SelectProps) {
    return (
        <div className="flex items-center justify-between gap-3 py-2">
            <label htmlFor={id} className="text-sm text-slate-300">
                {label}
            </label>
            <select
                id={id}
                className="w-36 rounded-lg border border-slate-600/50 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all appearance-none cursor-pointer"
                {...props}
            >
                {children}
            </select>
        </div>
    )
}
