import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, X, Loader } from 'lucide-react'
import type { ShaftEntry, FletchEntry, NockEntry } from '../data/equipment/types'

interface DatabasePanelProps {
  open: boolean
  onClose: () => void
  onApply: (selection: DatabaseSelection) => void
  hasExistingData: boolean
  t: (key: string) => string
}

export interface DatabaseSelection {
  shaft: ShaftEntry | null
  fletch: FletchEntry | null
  nock: NockEntry | null
}

type DatabaseState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; shafts: ShaftEntry[]; fletches: FletchEntry[]; nocks: NockEntry[] }
  | { status: 'error' }

export function DatabasePanel({ open, onClose, onApply, hasExistingData, t }: DatabasePanelProps) {
  const [db, setDb] = useState<DatabaseState>({ status: 'idle' })
  const [shaftMfg, setShaftMfg] = useState('')
  const [shaftModel, setShaftModel] = useState('')
  const [shaftSize, setShaftSize] = useState('')
  const [fletchMfg, setFletchMfg] = useState('')
  const [fletchModel, setFletchModel] = useState('')
  const [nockMfg, setNockMfg] = useState('')
  const [nockModel, setNockModel] = useState('')
  const [shaftOpen, setShaftOpen] = useState(true)
  const [fletchOpen, setFletchOpen] = useState(false)
  const [nockOpen, setNockOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (open && db.status === 'idle') {
      setDb({ status: 'loading' })
      Promise.all([
        import('../data/equipment/shaftDatabase'),
        import('../data/equipment/fletchDatabase'),
        import('../data/equipment/nockDatabase'),
      ]).then(([shaftMod, fletchMod, nockMod]) => {
        setDb({
          status: 'ready',
          shafts: shaftMod.SHAFT_DATABASE,
          fletches: fletchMod.FLETCH_DATABASE,
          nocks: nockMod.NOCK_DATABASE,
        })
      }).catch(() => {
        setDb({ status: 'error' })
      })
    }
  }, [open, db.status])

  const shaftManufacturers = useMemo(() => {
    if (db.status !== 'ready') return []
    return [...new Set(db.shafts.map((s) => s.manufacturer))].sort()
  }, [db])

  const shaftModels = useMemo(() => {
    if (db.status !== 'ready' || !shaftMfg) return []
    return [...new Set(db.shafts.filter((s) => s.manufacturer === shaftMfg).map((s) => s.model))].sort()
  }, [db, shaftMfg])

  const shaftSizes = useMemo(() => {
    if (db.status !== 'ready' || !shaftMfg || !shaftModel) return []
    return db.shafts
      .filter((s) => s.manufacturer === shaftMfg && s.model === shaftModel)
      .map((s) => s.size)
  }, [db, shaftMfg, shaftModel])

  const selectedShaft = useMemo(() => {
    if (db.status !== 'ready' || !shaftSize) return null
    return db.shafts.find(
      (s) => s.manufacturer === shaftMfg && s.model === shaftModel && s.size === shaftSize,
    ) ?? null
  }, [db, shaftMfg, shaftModel, shaftSize])

  const fletchManufacturers = useMemo(() => {
    if (db.status !== 'ready') return []
    return [...new Set(db.fletches.map((f) => f.manufacturer))].sort()
  }, [db])

  const fletchModels = useMemo(() => {
    if (db.status !== 'ready' || !fletchMfg) return []
    return [...new Set(db.fletches.filter((f) => f.manufacturer === fletchMfg).map((f) => f.model))].sort()
  }, [db, fletchMfg])

  const selectedFletch = useMemo(() => {
    if (db.status !== 'ready' || !fletchModel) return null
    return db.fletches.find(
      (f) => f.manufacturer === fletchMfg && f.model === fletchModel,
    ) ?? null
  }, [db, fletchMfg, fletchModel])

  const nockManufacturers = useMemo(() => {
    if (db.status !== 'ready') return []
    return [...new Set(db.nocks.map((n) => n.manufacturer))].sort()
  }, [db])

  const nockModels = useMemo(() => {
    if (db.status !== 'ready' || !nockMfg) return []
    return [...new Set(db.nocks.filter((n) => n.manufacturer === nockMfg).map((n) => n.model))].sort()
  }, [db, nockMfg])

  const selectedNock = useMemo(() => {
    if (db.status !== 'ready' || !nockModel) return null
    return db.nocks.find(
      (n) => n.manufacturer === nockMfg && n.model === nockModel,
    ) ?? null
  }, [db, nockMfg, nockModel])

  const hasSelection = selectedShaft !== null || selectedFletch !== null || selectedNock !== null

  const resetSelections = () => {
    setShaftMfg('')
    setShaftModel('')
    setShaftSize('')
    setFletchMfg('')
    setFletchModel('')
    setNockMfg('')
    setNockModel('')
    setShaftOpen(true)
    setFletchOpen(false)
    setNockOpen(false)
    setShowConfirm(false)
  }

  const handleClose = () => {
    resetSelections()
    onClose()
  }

  const handleApply = () => {
    onApply({ shaft: selectedShaft, fletch: selectedFletch, nock: selectedNock })
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
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-[560px] px-4 py-4">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-[var(--gold)]">{t('db.title')}</h2>
            <button onClick={handleClose} className="rounded-full p-2 text-[var(--text-secondary)] transition-colors press-scale hover:text-[var(--text-primary)]">
              <X size={20} />
            </button>
          </div>

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
                onClick={() => setDb({ status: 'idle' })}
                className="mt-3 text-[12px] font-medium text-[var(--gold)] press-scale"
              >
                {t('db.retry')}
              </button>
            </div>
          )}

          {db.status === 'ready' && (
            <div className="space-y-4">
              {/* Shaft section */}
              <CollapsibleSection title={t('db.section.shaft')} open={shaftOpen} onToggle={() => setShaftOpen((o) => !o)}>
                <div className="space-y-3">
                  <PanelSelect
                    label={t('db.selectManufacturer')}
                    value={shaftMfg}
                    onChange={(v) => { setShaftMfg(v); setShaftModel(''); setShaftSize('') }}
                    options={shaftManufacturers.map((m) => ({ value: m, label: m }))}
                  />
                  <PanelSelect
                    label={t('db.selectModel')}
                    value={shaftModel}
                    onChange={(v) => { setShaftModel(v); setShaftSize('') }}
                    options={shaftModels.map((m) => ({ value: m, label: m }))}
                    disabled={!shaftMfg}
                  />
                  <PanelSelect
                    label={t('db.selectVariant')}
                    value={shaftSize}
                    onChange={setShaftSize}
                    options={shaftSizes.map((s) => ({ value: s, label: s }))}
                    disabled={!shaftModel}
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
                </div>
              </CollapsibleSection>

              {/* Fletching section */}
              <CollapsibleSection title={t('db.section.fletching')} open={fletchOpen} onToggle={() => setFletchOpen((o) => !o)}>
                <div className="space-y-3">
                  <PanelSelect
                    label={t('db.selectManufacturer')}
                    value={fletchMfg}
                    onChange={(v) => { setFletchMfg(v); setFletchModel('') }}
                    options={fletchManufacturers.map((m) => ({ value: m, label: m }))}
                  />
                  <PanelSelect
                    label={t('db.selectModel')}
                    value={fletchModel}
                    onChange={setFletchModel}
                    options={fletchModels.map((m) => ({ value: m, label: m }))}
                    disabled={!fletchMfg}
                  />
                  {selectedFletch && (
                    <PreviewCard>
                      <PreviewRow label={t('db.preview.weight')} value={`${selectedFletch.weight}gr`} />
                      <PreviewRow label={t('db.preview.length')} value={`${selectedFletch.length}"`} />
                      <PreviewRow label={t('db.preview.height')} value={`${selectedFletch.height}"`} />
                      <PreviewRow label={t('db.preview.type')} value={selectedFletch.type} />
                    </PreviewCard>
                  )}
                </div>
              </CollapsibleSection>

              {/* Nock section */}
              <CollapsibleSection title={t('db.section.nock')} open={nockOpen} onToggle={() => setNockOpen((o) => !o)}>
                <div className="space-y-3">
                  <PanelSelect
                    label={t('db.selectManufacturer')}
                    value={nockMfg}
                    onChange={(v) => { setNockMfg(v); setNockModel('') }}
                    options={nockManufacturers.map((m) => ({ value: m, label: m }))}
                  />
                  <PanelSelect
                    label={t('db.selectModel')}
                    value={nockModel}
                    onChange={setNockModel}
                    options={nockModels.map((m) => ({ value: m, label: m }))}
                    disabled={!nockMfg}
                  />
                  {selectedNock && (
                    <PreviewCard>
                      <PreviewRow label={t('db.preview.weight')} value={`${selectedNock.weight}gr`} />
                      {selectedNock.bushingPin > 0 && <PreviewRow label={t('db.preview.bushing')} value={`${selectedNock.bushingPin}gr`} />}
                    </PreviewCard>
                  )}
                </div>
              </CollapsibleSection>

              {/* Apply button */}
              <button
                onClick={handleApplyClick}
                disabled={!hasSelection}
                className={`mt-4 w-full rounded-[14px] py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-all duration-150 press-scale ${
                  hasSelection
                    ? 'bg-[var(--gold)] text-[var(--bg-primary)] hover:bg-[var(--gold-light)]'
                    : 'cursor-not-allowed bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                }`}
              >
                {t('db.apply')}
              </button>
            </div>
          )}
        </div>
      </div>

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
    </div>
  )
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] card-surface">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors press-scale hover:bg-[var(--bg-elevated)]"
      >
        <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">{title}</span>
        <span className="text-[var(--text-secondary)] transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown size={16} strokeWidth={2} />
        </span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
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
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{ colorScheme: 'dark' }}
        className={`w-full cursor-pointer appearance-none rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3 pr-10 text-[14px] transition-colors focus:border-[var(--ring-gold)] focus:outline-none ${
          disabled
            ? 'cursor-not-allowed text-[var(--text-muted)] opacity-50'
            : value
              ? 'text-[var(--text-primary)] hover:border-[var(--gold)]/40'
              : 'text-[var(--text-secondary)] hover:border-[var(--gold)]/40'
        }`}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
        <ChevronDown size={16} strokeWidth={2} />
      </span>
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
