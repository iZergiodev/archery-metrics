import { forwardRef } from 'react'

interface InputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  unit?: string
  required?: boolean
  tooltip?: string
  id: string
  type?: 'text' | 'number'
  step?: string
  min?: string
  className?: string
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, value, onChange, placeholder, unit, required, tooltip, id, type = 'number', step, className = '' }, ref) => {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className="flex items-center gap-1">
          <label htmlFor={id} className="text-xs md:text-sm text-slate-300 font-medium">
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          {tooltip && (
            <div className="relative group">
              <span className="cursor-help inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full border border-slate-600 text-slate-400 hover:border-sky-400 hover:text-sky-400 transition-colors">
                ?
              </span>
              <div className="absolute left-full top-0 ml-2 z-50 w-64 p-2 text-[10px] leading-relaxed text-slate-200 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            step={step}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 pr-12
                       text-sm md:text-base text-right font-mono
                       focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500
                       placeholder:text-slate-600"
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
              {unit}
            </span>
          )}
        </div>
      </div>
    )
  }
)

InputField.displayName = 'InputField'
