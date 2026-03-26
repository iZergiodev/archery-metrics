import type { ArrowSpecs, BowSpecs, SpineMatchResult, StringWeights } from './archeryCalculator'
import type { ConvertibleField } from './unitSystem'

export type SetupSnapshot = {
  bowSpecs: BowSpecs
  arrowSpecs: ArrowSpecs
  stringWeights: StringWeights
  result: SpineMatchResult
}

export type ComparisonFactorId =
  | 'staticSpine'
  | 'shaftLength'
  | 'frontWeight'
  | 'drawWeight'
  | 'drawLength'
  | 'braceHeight'

export type ComparisonFactor = {
  id: ComparisonFactorId
  effect: 'weaker' | 'stiffer'
  currentValue: number
  compareValue: number
  normalizedImpact: number
  displayField: Exclude<ConvertibleField, 'none'> | 'staticSpine'
}

export type SetupComparisonAnalysis = {
  proximity: 'closer' | 'farther' | 'same' | 'unknown'
  proximityDelta: number | null
  driver: 'arrow' | 'bow' | 'balanced' | 'unknown'
  factors: ComparisonFactor[]
}

function toNumber(value: string | undefined): number {
  if (!value || value.trim() === '') return 0

  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function buildFactor(
  id: ComparisonFactorId,
  currentValue: number,
  compareValue: number,
  normalizedImpact: number,
  effect: 'weaker' | 'stiffer',
  displayField: ComparisonFactor['displayField'],
): ComparisonFactor {
  return {
    id,
    currentValue,
    compareValue,
    normalizedImpact,
    effect,
    displayField,
  }
}

export function analyzeSetupDifference(current: SetupSnapshot, compare: SetupSnapshot): SetupComparisonAnalysis {
  const currentMatch = current.result.matchIndex
  const compareMatch = compare.result.matchIndex

  let proximity: SetupComparisonAnalysis['proximity'] = 'unknown'
  let proximityDelta: number | null = null

  if (currentMatch != null && compareMatch != null) {
    const currentDistance = Math.abs(currentMatch - 1)
    const compareDistance = Math.abs(compareMatch - 1)
    proximityDelta = currentDistance - compareDistance

    if (Math.abs(proximityDelta) < 0.01) {
      proximity = 'same'
    } else {
      proximity = proximityDelta > 0 ? 'closer' : 'farther'
    }
  }

  let driver: SetupComparisonAnalysis['driver'] = 'unknown'

  const currentFrontWeight = toNumber(current.arrowSpecs.pointWeight) + toNumber(current.arrowSpecs.insertWeight)
  const compareFrontWeight = toNumber(compare.arrowSpecs.pointWeight) + toNumber(compare.arrowSpecs.insertWeight)

  const factorCandidates = [
    buildFactor(
      'staticSpine',
      toNumber(current.arrowSpecs.staticSpine),
      toNumber(compare.arrowSpecs.staticSpine),
      (Math.abs(toNumber(compare.arrowSpecs.staticSpine) - toNumber(current.arrowSpecs.staticSpine)) / 0.03) * 1.2,
      toNumber(compare.arrowSpecs.staticSpine) > toNumber(current.arrowSpecs.staticSpine) ? 'weaker' : 'stiffer',
      'staticSpine',
    ),
    buildFactor(
      'shaftLength',
      toNumber(current.arrowSpecs.shaftLength),
      toNumber(compare.arrowSpecs.shaftLength),
      (Math.abs(toNumber(compare.arrowSpecs.shaftLength) - toNumber(current.arrowSpecs.shaftLength)) / 0.5) * 1.1,
      toNumber(compare.arrowSpecs.shaftLength) > toNumber(current.arrowSpecs.shaftLength) ? 'weaker' : 'stiffer',
      'length',
    ),
    buildFactor(
      'frontWeight',
      currentFrontWeight,
      compareFrontWeight,
      Math.abs(compareFrontWeight - currentFrontWeight) / 25,
      compareFrontWeight > currentFrontWeight ? 'weaker' : 'stiffer',
      'componentWeight',
    ),
    buildFactor(
      'drawWeight',
      toNumber(current.bowSpecs.drawWeight),
      toNumber(compare.bowSpecs.drawWeight),
      (Math.abs(toNumber(compare.bowSpecs.drawWeight) - toNumber(current.bowSpecs.drawWeight)) / 5) * 0.95,
      toNumber(compare.bowSpecs.drawWeight) > toNumber(current.bowSpecs.drawWeight) ? 'weaker' : 'stiffer',
      'drawWeight',
    ),
    buildFactor(
      'drawLength',
      toNumber(current.bowSpecs.drawLength),
      toNumber(compare.bowSpecs.drawLength),
      (Math.abs(toNumber(compare.bowSpecs.drawLength) - toNumber(current.bowSpecs.drawLength)) / 0.75) * 0.85,
      toNumber(compare.bowSpecs.drawLength) > toNumber(current.bowSpecs.drawLength) ? 'weaker' : 'stiffer',
      'length',
    ),
    buildFactor(
      'braceHeight',
      toNumber(current.bowSpecs.braceHeight),
      toNumber(compare.bowSpecs.braceHeight),
      (Math.abs(toNumber(compare.bowSpecs.braceHeight) - toNumber(current.bowSpecs.braceHeight)) / 0.4) * 0.75,
      toNumber(compare.bowSpecs.braceHeight) < toNumber(current.bowSpecs.braceHeight) ? 'weaker' : 'stiffer',
      'length',
    ),
  ]

  const arrowImpact = factorCandidates
    .filter((factor) => factor.id === 'staticSpine' || factor.id === 'shaftLength' || factor.id === 'frontWeight')
    .reduce((sum, factor) => sum + factor.normalizedImpact, 0)

  const bowImpact = factorCandidates
    .filter((factor) => factor.id === 'drawWeight' || factor.id === 'drawLength' || factor.id === 'braceHeight')
    .reduce((sum, factor) => sum + factor.normalizedImpact, 0)

  if (arrowImpact > 0 || bowImpact > 0) {
    if (arrowImpact > bowImpact * 1.2) {
      driver = 'arrow'
    } else if (bowImpact > arrowImpact * 1.2) {
      driver = 'bow'
    } else {
      driver = 'balanced'
    }
  }

  const factors = factorCandidates
    .filter((factor) => factor.currentValue > 0 || factor.compareValue > 0)
    .filter((factor) => Math.abs(factor.compareValue - factor.currentValue) > 0.001)
    .sort((left, right) => right.normalizedImpact - left.normalizedImpact)
    .filter((factor, index) => factor.normalizedImpact >= 0.3 || index === 0)
    .slice(0, 3)

  return {
    proximity,
    proximityDelta,
    driver,
    factors,
  }
}
