interface StatusStripProps {
  label: string
  matchIndex: number | null
  accentColor: string
  textClass: string
  onClick: () => void
  ariaLabel: string
}

export function StatusStrip({ label, matchIndex, accentColor, textClass, onClick, ariaLabel }: StatusStripProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="block w-full border-t border-[var(--border)] animate-slide-up-entry"
      style={{ backgroundColor: 'rgba(11,11,11,0.94)', backdropFilter: 'blur(16px)' }}
    >
      <div className="mx-auto flex h-11 max-w-[560px] items-center gap-3 px-4" style={{ borderLeft: `3px solid ${accentColor}` }}>
        <span
          className="inline-flex h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
        <span className={`text-[13px] font-semibold ${textClass}`}>{label}</span>
        <span className="ml-auto font-mono text-[13px] text-[var(--text-secondary)]">
          {matchIndex?.toFixed(3) ?? '--'}
        </span>
      </div>
    </button>
  )
}
