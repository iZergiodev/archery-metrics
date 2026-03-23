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
        <label htmlFor={id} className="text-[13px] font-medium text-[#e8e8e8]">
          {label}
        </label>

        <div className="relative rounded-[12px] border border-[rgba(255,255,255,0.12)] bg-[#151515] px-3 transition-colors focus-within:border-[#facc15]/65 hover:border-[rgba(255,255,255,0.22)]">
          <select
            ref={ref}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-full appearance-none bg-transparent px-0 py-3 pr-8 text-[16px] text-[#f8f8f8] focus:outline-none"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#151515] text-[#f8f8f8]">
                {option.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#909090]">
            ▼
          </span>
        </div>
      </div>
    )
  },
)

SelectField.displayName = 'SelectField'
