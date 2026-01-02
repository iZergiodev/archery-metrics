import { forwardRef } from 'react'

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  id: string
  className?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, value, onChange, options, id, className = '' }, ref) => {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label htmlFor={id} className="text-xs md:text-sm text-slate-300 font-medium">
          {label}
        </label>
        <select
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5
                     text-sm md:text-base text-left
                     focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500
                     cursor-pointer"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }
)

SelectField.displayName = 'SelectField'
