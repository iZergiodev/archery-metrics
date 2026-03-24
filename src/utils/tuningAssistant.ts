import type { ArrowSpecs, BowSpecs, SpineMatchResult } from './archeryCalculator'
import { formatResultDisplayValue, getUnitLabel, type UnitSystem } from './unitSystem'

export type TuningAction = {
  id: string
  title: string
  detail: string
  priority: 'high' | 'medium'
}

const COMMON_STATIC_SPINES = [0.25, 0.3, 0.34, 0.4, 0.5, 0.6, 0.7, 0.8]

function toNumber(value: string | undefined): number {
  if (!value || value.trim() === '') return 0
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function getClosestSpineIndex(staticSpine: number): number {
  if (staticSpine <= 0) return -1

  let bestIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  COMMON_STATIC_SPINES.forEach((candidate, index) => {
    const distance = Math.abs(candidate - staticSpine)
    if (distance < bestDistance) {
      bestDistance = distance
      bestIndex = index
    }
  })

  return bestIndex
}

function getSuggestedStaticSpine(staticSpine: number, direction: 'stiffer' | 'flexible'): number | null {
  const baseIndex = getClosestSpineIndex(staticSpine)
  if (baseIndex < 0) return null

  if (direction === 'stiffer') {
    return COMMON_STATIC_SPINES[Math.max(0, baseIndex - 1)] ?? null
  }

  return COMMON_STATIC_SPINES[Math.min(COMMON_STATIC_SPINES.length - 1, baseIndex + 1)] ?? null
}

function formatLength(valueInches: number, unitSystem: UnitSystem): string {
  return `${formatResultDisplayValue(valueInches, 'length', unitSystem)} ${getUnitLabel('length', unitSystem)}`
}

function formatComponentWeight(valueGrains: number, unitSystem: UnitSystem): string {
  return `${formatResultDisplayValue(valueGrains, 'componentWeight', unitSystem)} ${getUnitLabel('componentWeight', unitSystem)}`
}

export function buildTuningActions(
  result: SpineMatchResult,
  _bow: BowSpecs,
  arrow: ArrowSpecs,
  unitSystem: UnitSystem,
  t: (key: string) => string,
): TuningAction[] {
  if (result.matchIndex == null || result.status == null || result.status === 'good') {
    return []
  }

  const actions: TuningAction[] = []
  const staticSpine = toNumber(arrow.staticSpine)
  const shaftLength = toNumber(arrow.shaftLength)
  const totalFrontWeight = toNumber(arrow.pointWeight) + toNumber(arrow.insertWeight)

  if (result.status === 'weak') {
    const stifferSpine = getSuggestedStaticSpine(staticSpine, 'stiffer')
    if (stifferSpine != null && stifferSpine < staticSpine) {
      actions.push({
        id: 'stiffer-static-spine',
        title: t('tuning.action.stifferSpine'),
        detail: `${t('tuning.detail.tryStaticSpine')} ${stifferSpine.toFixed(3)}.`,
        priority: 'high',
      })
    }

    if (totalFrontWeight > 100) {
      actions.push({
        id: 'reduce-front-weight',
        title: t('tuning.action.reduceFront'),
        detail: `${t('tuning.detail.reduceFrontBy')} ${formatComponentWeight(25, unitSystem)}.`,
        priority: 'high',
      })
    }

    if (shaftLength > 28) {
      actions.push({
        id: 'shorten-shaft',
        title: t('tuning.action.shortenShaft'),
        detail: `${t('tuning.detail.trimBy')} ${formatLength(0.5, unitSystem)}.`,
        priority: 'medium',
      })
    }
  }

  if (result.status === 'stiff') {
    const moreFlexibleSpine = getSuggestedStaticSpine(staticSpine, 'flexible')
    if (moreFlexibleSpine != null && moreFlexibleSpine > staticSpine) {
      actions.push({
        id: 'more-flexible-static-spine',
        title: t('tuning.action.flexibleSpine'),
        detail: `${t('tuning.detail.tryStaticSpine')} ${moreFlexibleSpine.toFixed(3)}.`,
        priority: 'high',
      })
    }

    actions.push({
      id: 'increase-front-weight',
      title: t('tuning.action.addFront'),
      detail: `${t('tuning.detail.addFrontBy')} ${formatComponentWeight(25, unitSystem)}.`,
      priority: 'high',
    })

    if (shaftLength > 0) {
      actions.push({
        id: 'lengthen-shaft',
        title: t('tuning.action.lengthenShaft'),
        detail: `${t('tuning.detail.lengthenBy')} ${formatLength(0.5, unitSystem)}.`,
        priority: 'medium',
      })
    }
  }

  return actions.slice(0, 3)
}
