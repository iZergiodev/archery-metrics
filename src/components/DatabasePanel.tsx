import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Loader } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { loadShaftCatalog } from './loadShaftCatalog'
import type { ShaftEntry } from '../data/equipment/types'

interface DatabasePanelProps {
  open: boolean
  onClose: () => void
  onApply: (shaft: ShaftEntry) => void
  hasExistingData: boolean
  t: (key: string) => string
}

type DatabaseState =
  | { status: 'loading' }
  | { status: 'ready'; shafts: ShaftEntry[] }
  | { status: 'error' }

export function DatabasePanel({ open, onClose, onApply, hasExistingData, t }: DatabasePanelProps) {
  const [db, setDb] = useState<DatabaseState>({ status: 'loading' })
  const catalogLoadInFlight = useRef(false)
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [size, setSize] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (open && db.status === 'loading' && !catalogLoadInFlight.current) {
      catalogLoadInFlight.current = true
      loadShaftCatalog().then((shafts) => {
        setDb({ status: 'ready', shafts })
      }).catch(() => {
        setDb({ status: 'error' })
      }).finally(() => {
        catalogLoadInFlight.current = false
      })
    }
  }, [open, db.status])

  const manufacturers = useMemo(() => {
    if (db.status !== 'ready') return []
    return [...new Set(db.shafts.map((s) => s.manufacturer))].sort()
  }, [db])

  const models = useMemo(() => {
    if (db.status !== 'ready' || !manufacturer) return []
    return [...new Set(db.shafts.filter((s) => s.manufacturer === manufacturer).map((s) => s.model))].sort()
  }, [db, manufacturer])

  const sizes = useMemo(() => {
    if (db.status !== 'ready' || !manufacturer || !model) return []
    return db.shafts
      .filter((s) => s.manufacturer === manufacturer && s.model === model)
      .map((s) => s.size)
  }, [db, manufacturer, model])

  const selectedShaft = useMemo(() => {
    if (db.status !== 'ready' || !size) return null
    return db.shafts.find(
      (s) => s.manufacturer === manufacturer && s.model === model && s.size === size,
    ) ?? null
  }, [db, manufacturer, model, size])

  const resetSelections = () => {
    setManufacturer('')
    setModel('')
    setSize('')
    setShowConfirm(false)
  }

  const handleClose = () => {
    resetSelections()
    onClose()
  }

  const handleApply = () => {
    if (selectedShaft) {
      onApply(selectedShaft)
    }
    resetSelections()
    onClose()
  }

  const handleApplyClick = () => {
    if (hasExistingData) {
      setShowConfirm(true)
    } else {
      handleApply()
    }
  }

  if (!open) return null

  return (
    <>
      <BottomSheet open={open} onClose={handleClose} title={t('db.title')}>
        {db.status === 'loading' && (
          <div className="flex items-center gap-3 py-12 text-[var(--text-secondary)]">
            <Loader size={18} className="animate-spin" />
            <span className="text-[13px]">{t('db.loading')}</span>
          </div>
        )}

        {db.status === 'error' && (
          <div className="py-12 text-center">
            <p className="text-[13px] text-[var(--text-secondary)]">{t('db.error')}</p>
            <button
              onClick={() => setDb({ status: 'loading' })}
              className="mt-3 text-[12px] font-medium text-[var(--gold)] press-scale"
            >
              {t('db.retry')}
            </button>
          </div>
        )}

        {db.status === 'ready' && (
          <div className="space-y-3">
            <PanelSelect
              label={t('db.selectManufacturer')}
              value={manufacturer}
              onChange={(v) => { setManufacturer(v); setModel(''); setSize('') }}
              options={manufacturers.map((m) => ({ value: m, label: m }))}
            />
            <PanelSelect
              label={t('db.selectModel')}
              value={model}
              onChange={(v) => { setModel(v); setSize('') }}
              options={models.map((m) => ({ value: m, label: m }))}
              disabled={!manufacturer}
            />
            <PanelSelect
              label={t('db.selectVariant')}
              value={size}
              onChange={setSize}
              options={sizes.map((s) => ({ value: s, label: s }))}
              disabled={!model}
            />

            {selectedShaft && (
              <PreviewCard>
                <PreviewRow label={t('db.preview.spine')} value={selectedShaft.spine.toString()} />
                <PreviewRow label={t('db.preview.gpi')} value={`${selectedShaft.gpi}`} />
                <PreviewRow label={t('db.preview.length')} value={`${selectedShaft.stockLength}"`} />
                <PreviewRow label={t('db.preview.od')} value={`${selectedShaft.od}"`} />
                {selectedShaft.nockWeight > 0 && <PreviewRow label={t('db.preview.nock')} value={`${selectedShaft.nockWeight}gr`} />}
                {selectedShaft.bushingPin > 0 && <PreviewRow label={t('db.preview.bushing')} value={`${selectedShaft.bushingPin}gr`} />}
                {selectedShaft.pointInsert > 0 && <PreviewRow label={t('db.preview.insert')} value={`${selectedShaft.pointInsert}gr`} />}
              </PreviewCard>
            )}

            {/* Apply button */}
            <button
              onClick={handleApplyClick}
              disabled={!selectedShaft}
              className={`mt-4 w-full rounded-[14px] py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-all duration-150 press-scale ${
                selectedShaft
                  ? 'bg-[var(--gold)] text-[var(--bg-primary)] hover:bg-[var(--gold-light)]'
                  : 'cursor-not-allowed bg-[var(--bg-elevated)] text-[var(--text-muted)]'
              }`}
            >
              {t('db.apply')}
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-[360px] rounded-[14px] border border-[var(--border)] p-5 card-surface animate-fade-in">
            <p className="text-[14px] leading-relaxed text-[var(--text-primary)]">{t('db.confirm')}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-[12px] border border-[var(--border)] py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] text-[var(--text-secondary)] transition-colors press-scale hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              >
                {t('db.cancel')}
              </button>
              <button
                onClick={handleApply}
                className="rounded-[12px] bg-[var(--gold)] py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--bg-primary)] transition-colors press-scale hover:bg-[var(--gold-light)]"
              >
                {t('db.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function PanelSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`text-[10px] uppercase tracking-[0.18em] ${disabled ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>
        {label}
      </span>
      <div className={`group relative rounded-[12px] border transition-colors ${
        disabled
          ? 'border-[var(--border)] opacity-50'
          : value
            ? 'border-[var(--gold)]/30 bg-[var(--gold)]/5'
            : 'border-[var(--border-hover)] hover:border-[var(--gold)]/40'
      }`}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{ colorScheme: 'dark' }}
          className={`w-full cursor-pointer appearance-none rounded-[12px] bg-transparent px-3 py-3 pr-10 text-[14px] focus:outline-none ${
            disabled
              ? 'cursor-not-allowed text-[var(--text-muted)]'
              : value
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)]'
          }`}
        >
          <option value="">—</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              {opt.label}
            </option>
          ))}
        </select>
        <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
          disabled ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--gold)]'
        }`}>
          <ChevronDown size={18} strokeWidth={2} />
        </span>
      </div>
    </div>
  )
}

function PreviewCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[var(--gold)]/20 bg-[var(--gold)]/5 px-3 py-3 animate-fade-in">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>
    </div>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</span>
      <span className="font-mono text-[13px] text-[var(--text-primary)]">{value}</span>
    </div>
  )
}
