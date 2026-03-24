import { REAR_MASS_SENSITIVITY } from '../constants'
import { calculateSpineMatch } from './archeryCalculator'
import {
  COMPOUND_CALIBRATION_CASES,
  DEFAULT_CALIBRATION_STRING_WEIGHTS,
  type CompoundCalibrationCase,
} from './spineCalibrationDataset'

export type CompoundCalibrationResult = {
  id: string
  source: string
  expectedMatchIndex: number
  actualMatchIndex: number
  targetRange?: {
    min: number
    max: number
  }
  absoluteError: number
  weightedAbsoluteError: number
  status: string | null
}

export type CompoundCalibrationSummary = {
  meanAbsoluteError: number
  weightedMeanAbsoluteError: number
  maxAbsoluteError: number
  results: CompoundCalibrationResult[]
}

export type CompoundMonotonicityCheck = {
  id: string
  passed: boolean
  details: string
}

export function evaluateCompoundCalibration(
  cases: CompoundCalibrationCase[] = COMPOUND_CALIBRATION_CASES,
): CompoundCalibrationResult[] {
  return cases.map((calibrationCase) => {
    const result = calculateSpineMatch(
      calibrationCase.bow,
      calibrationCase.arrow,
      calibrationCase.stringWeights ?? DEFAULT_CALIBRATION_STRING_WEIGHTS,
    )

    const actualMatchIndex = result.matchIndex ?? 0
    const targetRange = calibrationCase.acceptableMatchRange
    const absoluteError =
      targetRange == null
        ? Math.abs(actualMatchIndex - calibrationCase.expectedMatchIndex)
        : actualMatchIndex < targetRange.min
          ? targetRange.min - actualMatchIndex
          : actualMatchIndex > targetRange.max
            ? actualMatchIndex - targetRange.max
            : 0

    return {
      id: calibrationCase.id,
      source: calibrationCase.source,
      expectedMatchIndex: calibrationCase.expectedMatchIndex,
      actualMatchIndex,
      targetRange,
      absoluteError,
      weightedAbsoluteError: absoluteError * calibrationCase.weight,
      status: result.status,
    }
  })
}

export function summarizeCompoundCalibration(
  cases: CompoundCalibrationCase[] = COMPOUND_CALIBRATION_CASES,
): CompoundCalibrationSummary {
  const results = evaluateCompoundCalibration(cases)
  const totalWeight = cases.reduce((sum, calibrationCase) => sum + calibrationCase.weight, 0)
  const totalAbsoluteError = results.reduce((sum, result) => sum + result.absoluteError, 0)
  const totalWeightedAbsoluteError = results.reduce((sum, result) => sum + result.weightedAbsoluteError, 0)

  return {
    meanAbsoluteError: totalAbsoluteError / results.length,
    weightedMeanAbsoluteError: totalWeightedAbsoluteError / totalWeight,
    maxAbsoluteError: Math.max(...results.map((result) => result.absoluteError)),
    results,
  }
}

export function evaluateCompoundMonotonicity(): CompoundMonotonicityCheck[] {
  const baseBow = {
    iboVelocity: '335',
    drawLength: '29',
    drawWeight: '70',
    braceHeight: '6.5',
    axleToAxle: '34',
    percentLetoff: '85',
    archeryType: 'compound' as const,
  }
  const baseArrow = {
    pointWeight: '125',
    insertWeight: '25',
    shaftLength: '28',
    shaftGpi: '8.6',
    fletchQuantity: '3',
    weightEach: '8',
    wrapWeight: '10',
    nockWeight: '10',
    bushingPin: '10',
    staticSpine: '0.340',
  }

  const slow = calculateSpineMatch({ ...baseBow, iboVelocity: '295' }, baseArrow, DEFAULT_CALIBRATION_STRING_WEIGHTS)
  const medium = calculateSpineMatch(baseBow, baseArrow, DEFAULT_CALIBRATION_STRING_WEIGHTS)
  const fast = calculateSpineMatch({ ...baseBow, iboVelocity: '350' }, baseArrow, DEFAULT_CALIBRATION_STRING_WEIGHTS)
  const forgivingBrace = calculateSpineMatch(
    { ...baseBow, braceHeight: '7' },
    baseArrow,
    DEFAULT_CALIBRATION_STRING_WEIGHTS,
  )
  const lowBrace = calculateSpineMatch(
    { ...baseBow, braceHeight: '6' },
    baseArrow,
    DEFAULT_CALIBRATION_STRING_WEIGHTS,
  )
  const lightFront = calculateSpineMatch(
    baseBow,
    { ...baseArrow, pointWeight: '100', insertWeight: '0' },
    DEFAULT_CALIBRATION_STRING_WEIGHTS,
  )
  const heavyFront = calculateSpineMatch(
    baseBow,
    { ...baseArrow, pointWeight: '125', insertWeight: '25' },
    DEFAULT_CALIBRATION_STRING_WEIGHTS,
  )
  const releaseAid = calculateSpineMatch(baseBow, baseArrow, DEFAULT_CALIBRATION_STRING_WEIGHTS)
  const finger = calculateSpineMatch(
    baseBow,
    baseArrow,
    { ...DEFAULT_CALIBRATION_STRING_WEIGHTS, releaseType: 'manual fingers' },
  )
  const lightRear = calculateSpineMatch(
    baseBow,
    { ...baseArrow, nockWeight: '6', bushingPin: '4' },
    DEFAULT_CALIBRATION_STRING_WEIGHTS,
  )
  const heavyRear = calculateSpineMatch(
    baseBow,
    { ...baseArrow, nockWeight: '12', bushingPin: '10' },
    DEFAULT_CALIBRATION_STRING_WEIGHTS,
  )

  return [
    {
      id: 'compound_speed_bucket_required_spine',
      passed:
        slow.spineRequired != null &&
        medium.spineRequired != null &&
        fast.spineRequired != null &&
        slow.spineRequired > medium.spineRequired &&
        medium.spineRequired > fast.spineRequired,
      details: `slow=${slow.spineRequired?.toFixed(4)} medium=${medium.spineRequired?.toFixed(4)} fast=${fast.spineRequired?.toFixed(4)}`,
    },
    {
      id: 'compound_low_brace_requires_stiffer_spine',
      passed:
        lowBrace.spineRequired != null &&
        forgivingBrace.spineRequired != null &&
        lowBrace.spineRequired < forgivingBrace.spineRequired,
      details: `lowBrace=${lowBrace.spineRequired?.toFixed(4)} forgiving=${forgivingBrace.spineRequired?.toFixed(4)}`,
    },
    {
      id: 'compound_heavier_front_requires_stiffer_spine',
      passed:
        lightFront.spineRequired != null &&
        heavyFront.spineRequired != null &&
        heavyFront.spineRequired < lightFront.spineRequired,
      details: `lightFront=${lightFront.spineRequired?.toFixed(4)} heavyFront=${heavyFront.spineRequired?.toFixed(4)}`,
    },
    {
      id: 'compound_heavier_front_weakens_dynamic_spine',
      passed:
        lightFront.spineDynamic != null &&
        heavyFront.spineDynamic != null &&
        heavyFront.spineDynamic > lightFront.spineDynamic,
      details: `lightFront=${lightFront.spineDynamic?.toFixed(4)} heavyFront=${heavyFront.spineDynamic?.toFixed(4)}`,
    },
    {
      id: 'compound_finger_release_weakens_dynamic_spine',
      passed:
        releaseAid.spineDynamic != null &&
        finger.spineDynamic != null &&
        releaseAid.matchIndex != null &&
        finger.matchIndex != null &&
        finger.spineDynamic > releaseAid.spineDynamic &&
        finger.matchIndex > releaseAid.matchIndex,
      details: `releaseAid=${releaseAid.matchIndex?.toFixed(4)} finger=${finger.matchIndex?.toFixed(4)}`,
    },
    {
      id: 'compound_heavier_rear_stiffens_dynamic_spine',
      passed:
        REAR_MASS_SENSITIVITY < 0.0005 ||
        (lightRear.spineDynamic != null &&
          heavyRear.spineDynamic != null &&
          lightRear.matchIndex != null &&
          heavyRear.matchIndex != null &&
          heavyRear.spineDynamic < lightRear.spineDynamic &&
          heavyRear.matchIndex < lightRear.matchIndex),
      details: `lightRear=${lightRear.matchIndex?.toFixed(4)} heavyRear=${heavyRear.matchIndex?.toFixed(4)} sensitivity=${REAR_MASS_SENSITIVITY}`,
    },
  ]
}
