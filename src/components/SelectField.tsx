import { forwardRef } from 'react'

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  id: string
  className?: string
  priority?: 'primary' | 'secondary'
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, value, onChange, options, id, className = '', priority: _priority = 'secondary' }, ref) => {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <label htmlFor={id} className="text-[13px] font-medium text-[var(--text-primary)]">
          {label}
        </label>

        <div className="relative rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 transition-colors focus-within:border-[var(--ring-gold)] hover:border-[var(--border-hover)]">
          <select
            ref={ref}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-full appearance-none bg-transparent px-0 py-3 pr-8 text-[16px] text-[var(--text-primary)] focus:outline-none"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
                {option.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]">
            ▼
          </span>
        </div>
      </div>
    )
  },
)

SelectField.displayName = 'SelectField'
