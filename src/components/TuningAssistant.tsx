import type { TuningAction } from '../utils/tuningAssistant'

interface TuningAssistantProps {
  actions: TuningAction[]
  status: 'weak' | 'good' | 'stiff' | 'unknown' | null
  t: (key: string) => string
}

export function TuningAssistant({ actions, status, t }: TuningAssistantProps) {
  if (status == null) return null

  return (
    <section className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-4">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[10px] uppercase tracking-[0.28em] text-[#facc15]">{t('tuning.title')}</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[#9f9f9f]">{t('tuning.subtitle')}</p>
        </div>
      </div>

      {actions.length > 0 ? (
        <div className="mt-4 space-y-3">
          {actions.map((action, index) => (
            <article
              key={action.id}
              className="rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#131313] px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#facc15] font-mono text-[12px] text-[#161616]">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[#f3f3f3]">{action.title}</div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#a8a8a8]">{action.detail}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#131313] px-4 py-4">
          <div className="text-[14px] font-medium text-[#f3f3f3]">{t('tuning.goodTitle')}</div>
          <p className="mt-1 text-[13px] leading-relaxed text-[#a8a8a8]">{t('tuning.goodBody')}</p>
        </div>
      )}
    </section>
  )
}
