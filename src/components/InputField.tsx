import { forwardRef } from 'react'

interface InputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  unit?: string
  required?: boolean
  tooltip?: string
  hint?: string
  id: string
  type?: 'text' | 'number'
  step?: string
  min?: string
  className?: string
  priority?: 'primary' | 'secondary'
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      value,
      onChange,
      placeholder,
      unit,
      required,
      tooltip,
      hint,
      id,
      type = 'number',
      step,
      min,
      className = '',
      priority: _priority = 'secondary',
    },
    ref,
  ) => {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <label htmlFor={id} className="text-[13px] font-medium text-[var(--text-primary)]">
              {label}
              {required && <span className="ml-1 text-[var(--gold)]">*</span>}
            </label>
            {hint && <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">{hint}</p>}
          </div>

          {tooltip && (
            <div className="relative group shrink-0">
              <button
                type="button"
                aria-label={tooltip}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-hover)] text-[10px] text-[var(--text-secondary)] transition-colors hover:border-[var(--ring-gold)] hover:text-[var(--gold)] focus:border-[var(--ring-gold)] focus:outline-none"
              >
                i
              </button>
              <div className="pointer-events-none absolute right-0 top-6 z-50 hidden w-60 rounded-[12px] border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-[11px] leading-relaxed text-[var(--text-secondary)] opacity-0 shadow-2xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:block">
                {tooltip}
              </div>
            </div>
          )}
        </div>

        <div className="focus-glow relative rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 transition-colors focus-within:border-[var(--ring-gold)] hover:border-[var(--border-hover)]">
          <input
            ref={ref}
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            step={step}
            min={min}
            inputMode={type === 'number' ? 'decimal' : undefined}
            className="w-full bg-transparent px-0 py-3 pr-12 text-right font-mono text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          {unit && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--text-secondary)]">
              {unit}
            </span>
          )}
        </div>

        {tooltip && <p className="text-[12px] leading-relaxed text-[var(--text-secondary)] md:hidden">{tooltip}</p>}
      </div>
    )
  },
)

InputField.displayName = 'InputField'
