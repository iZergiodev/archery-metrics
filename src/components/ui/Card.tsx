import type { ReactNode } from 'react'

type CardProps = {
    children: ReactNode
    className?: string
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-800/90 to-slate-800/50 backdrop-blur-sm shadow-xl ${className}`}>
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }: CardProps) {
    return (
        <div className={`px-5 py-4 border-b border-slate-700/50 ${className}`}>
            {children}
        </div>
    )
}

export function CardContent({ children, className = '' }: CardProps) {
    return (
        <div className={`px-5 py-4 ${className}`}>
            {children}
        </div>
    )
}
