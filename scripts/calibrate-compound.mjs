import { execFileSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

const repoRoot = process.cwd()
const outDir = path.join(os.tmpdir(), 'archery-metrics-calibration-cjs')

execFileSync(
  'pnpm',
  [
    'exec',
    'tsc',
    'src/utils/archeryCalculator.ts',
    'src/constants.ts',
    'src/utils/spineCalibrationDataset.ts',
    'src/utils/spineCalibration.ts',
    '--module',
    'commonjs',
    '--target',
    'es2020',
    '--outDir',
    outDir,
    '--skipLibCheck',
  ],
  { cwd: repoRoot, stdio: 'inherit' },
)

const require = createRequire(import.meta.url)
const constants = require(path.join(outDir, 'constants.js'))
const { calculateSpineMatch } = require(path.join(outDir, 'utils', 'archeryCalculator.js'))
const {
  COMPOUND_CALIBRATION_CASES,
  DEFAULT_CALIBRATION_STRING_WEIGHTS,
} = require(path.join(outDir, 'utils', 'spineCalibrationDataset.js'))
const {
  summarizeCompoundCalibration,
  evaluateCompoundMonotonicity,
} = require(path.join(outDir, 'utils', 'spineCalibration.js'))

const youthCase = {
  bow: {
    iboVelocity: '280',
    drawLength: '26',
    drawWeight: '35',
    braceHeight: '6.5',
    axleToAxle: '28',
    percentLetoff: '70',
    archeryType: 'compound',
  },
  arrow: {
    shaftLength: '31',
    pointWeight: '125',
    insertWeight: '25',
    shaftGpi: '6.6',
    fletchQuantity: '4',
    weightEach: '6',
    wrapWeight: '10',
    nockWeight: '7',
    bushingPin: '5',
    staticSpine: '0.500',
    shaftMaterial: 'carbon',
  },
}

const tunedKeys = [
  'K_SPINE_CALIBRATION',
  'COMPOUND_REQUIRED_SPINE_DRAW_WEIGHT_EXPONENT',
  'COMPOUND_REQUIRED_SPINE_ENERGY_EXPONENT',
  'COMPOUND_REQUIRED_CHART_ADJUSTMENT_BLEND',
  'COMPOUND_REQUIRED_FRONT_WEIGHT_ADJUSTMENT_PER_STEP',
  'COMPOUND_REQUIRED_LENGTH_EXPONENT',
  'COMPOUND_REQUIRED_IBO_SENSITIVITY',
  'COMPOUND_REQUIRED_BRACE_SENSITIVITY',
  'DYNAMIC_SPINE_LENGTH_EXPONENT',
  'REAR_MASS_SENSITIVITY',
]

const defaults = Object.fromEntries(tunedKeys.map((key) => [key, constants[key]]))

function applyState(state) {
  for (const [key, value] of Object.entries(state)) {
    constants[key] = value
  }
}

function captureState() {
  return Object.fromEntries(tunedKeys.map((key) => [key, constants[key]]))
}

function regularization(state, lambda = 0.05) {
  let penalty = 0

  for (const key of tunedKeys) {
    const defaultValue = defaults[key]
    const currentValue = state[key]
    const denominator = Math.max(Math.abs(defaultValue), 0.001)
    penalty += ((currentValue - defaultValue) / denominator) ** 2
  }

  return lambda * penalty
}

function objective(lambda = 0.05) {
  const summary = summarizeCompoundCalibration()
  let totalError = summary.results.reduce((sum, result) => sum + result.weightedAbsoluteError, 0)

  const youthResult = calculateSpineMatch(
    youthCase.bow,
    youthCase.arrow,
    DEFAULT_CALIBRATION_STRING_WEIGHTS,
  )

  if (!(youthResult.matchIndex < 0.9 && youthResult.status === 'stiff')) {
    totalError += 5
  }

  const monotonicChecks = evaluateCompoundMonotonicity()
  totalError += monotonicChecks.filter((check) => !check.passed).length * 2

  const state = captureState()
  totalError += regularization(state, lambda)

  return {
    score: totalError,
    summary,
    monotonicChecks,
    youthResult,
    state,
  }
}

function gridSearch(searchSpace, baseState, lambda = 0.05) {
  const keys = Object.keys(searchSpace)
  let best = null

  function visit(index, partialState) {
    if (index === keys.length) {
      const candidateState = { ...baseState, ...partialState }
      applyState(candidateState)
      const evaluation = objective(lambda)

      if (best == null || evaluation.score < best.score) {
        best = {
          score: evaluation.score,
          state: { ...candidateState },
          summary: evaluation.summary,
          monotonicChecks: evaluation.monotonicChecks,
          youthResult: evaluation.youthResult,
        }
      }

      return
    }

    const key = keys[index]
    for (const value of searchSpace[key]) {
      visit(index + 1, { ...partialState, [key]: value })
    }
  }

  visit(0, {})
  return best
}

function evaluateCase(calibrationCase) {
  const result = calculateSpineMatch(
    calibrationCase.bow,
    calibrationCase.arrow,
    calibrationCase.stringWeights ?? DEFAULT_CALIBRATION_STRING_WEIGHTS,
  )

  return {
    id: calibrationCase.id,
    matchIndex: Number(result.matchIndex?.toFixed(4)),
    status: result.status,
  }
}

const stage1SearchSpace = {
  K_SPINE_CALIBRATION: [0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.4],
  COMPOUND_REQUIRED_SPINE_DRAW_WEIGHT_EXPONENT: [-0.9, -0.88, -0.86, -0.84, -0.82, -0.8],
  COMPOUND_REQUIRED_SPINE_ENERGY_EXPONENT: [-0.18, -0.16, -0.14, -0.12, -0.1, -0.08],
  COMPOUND_REQUIRED_FRONT_WEIGHT_ADJUSTMENT_PER_STEP: [1.5, 2, 2.5, 3, 3.5],
  COMPOUND_REQUIRED_LENGTH_EXPONENT: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3],
}

const stage2SearchSpace = {
  COMPOUND_REQUIRED_CHART_ADJUSTMENT_BLEND: [0.55, 0.65, 0.75, 0.85, 0.95, 1],
  COMPOUND_REQUIRED_IBO_SENSITIVITY: [0.08, 0.12, 0.15, 0.18, 0.2, 0.22, 0.25],
  COMPOUND_REQUIRED_BRACE_SENSITIVITY: [2, 2.5, 3, 3.5, 4, 4.5],
  DYNAMIC_SPINE_LENGTH_EXPONENT: [1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2],
  REAR_MASS_SENSITIVITY: [0, 0.0005, 0.001, 0.0015, 0.002, 0.0025],
}

applyState(defaults)
const baseline = objective(0.05)
const stage1 = gridSearch(stage1SearchSpace, defaults, 0.05)
const stage2 = gridSearch(stage2SearchSpace, stage1.state, 0.05)

applyState(stage2.state)

console.log(JSON.stringify({
  baseline: {
    score: Number(baseline.score.toFixed(6)),
    summary: {
      meanAbsoluteError: Number(baseline.summary.meanAbsoluteError.toFixed(6)),
      weightedMeanAbsoluteError: Number(baseline.summary.weightedMeanAbsoluteError.toFixed(6)),
      maxAbsoluteError: Number(baseline.summary.maxAbsoluteError.toFixed(6)),
    },
  },
  stage1: {
    score: Number(stage1.score.toFixed(6)),
    state: stage1.state,
  },
  best: {
    score: Number(stage2.score.toFixed(6)),
    ...stage2.state,
  },
  summary: {
    meanAbsoluteError: Number(stage2.summary.meanAbsoluteError.toFixed(6)),
    weightedMeanAbsoluteError: Number(stage2.summary.weightedMeanAbsoluteError.toFixed(6)),
    maxAbsoluteError: Number(stage2.summary.maxAbsoluteError.toFixed(6)),
  },
  monotonicChecks: stage2.monotonicChecks,
  cases: COMPOUND_CALIBRATION_CASES.map(evaluateCase),
  youth: {
    matchIndex: Number(stage2.youthResult.matchIndex?.toFixed(4)),
    status: stage2.youthResult.status,
  },
}, null, 2))
