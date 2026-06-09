import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      triggerRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />
      <div className="relative z-10 mx-auto flex max-h-[88dvh] w-full max-w-[560px] flex-col rounded-t-[24px] border-x border-t border-[var(--border)] bg-[var(--bg-surface)] animate-sheet-up">
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-[var(--border-hover)]" aria-hidden="true" />
        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors press-scale hover:text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 safe-bottom">{children}</div>
      </div>
    </div>
  )
}
