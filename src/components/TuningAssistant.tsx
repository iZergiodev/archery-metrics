import type { TuningAction } from '../utils/tuningAssistant'

interface TuningAssistantProps {
  actions: TuningAction[]
  status: 'weak' | 'good' | 'stiff' | 'unknown' | null
  t: (key: string) => string
}

export function TuningAssistant({ actions, status, t }: TuningAssistantProps) {
  if (status == null) return null

  return (
    <section className="mt-6 border-t border-[var(--border)] pt-4">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[10px] uppercase tracking-[0.28em] text-[var(--gold)]">{t('tuning.title')}</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">{t('tuning.subtitle')}</p>
        </div>
      </div>

      {actions.length > 0 ? (
        <div className="mt-4 space-y-3">
          {actions.map((action, index) => (
            <article
              key={action.id}
              className="rounded-[14px] border border-[var(--border)] card-surface px-4 py-4 animate-fade-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] font-mono text-[12px] text-[var(--bg-primary)]">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[var(--text-primary)]">{action.title}</div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">{action.detail}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[14px] border border-[var(--border)] card-surface px-4 py-4 animate-fade-slide-up">
          <div className="text-[14px] font-medium text-[var(--text-primary)]">{t('tuning.goodTitle')}</div>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">{t('tuning.goodBody')}</p>
        </div>
      )}
    </section>
  )
}
