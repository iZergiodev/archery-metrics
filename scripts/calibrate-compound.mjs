import { execFileSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

const repoRoot = process.cwd()
const outDir = path.join(os.tmpdir(), 'archery-metrics-calibration-cjs')

const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

execFileSync(
  pnpmCmd,
  [
    'exec',
    'tsc',
    'src/constants.ts',
    'src/data/official/compoundDatabase.ts',
    'src/data/sfax/compoundReference.ts',
    'src/utils/archeryCalculator.ts',
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
const {
  summarizeCompoundCalibration,
  analyzeOfficialCompoundBenchmarks,
  evaluateCompoundMonotonicity,
} = require(path.join(outDir, 'utils', 'spineCalibration.js'))

const sfaxSummary = summarizeCompoundCalibration()
const officialSummary = analyzeOfficialCompoundBenchmarks().overall
const monotonicChecks = evaluateCompoundMonotonicity()

console.log(
  JSON.stringify(
    {
      mode: 'sfax-first',
      note: 'Core SFAX constants are fixed from reverse engineering. This script now audits fidelity and compatibility instead of tuning those constants by grid search.',
      sfaxFidelity: {
        dynamicSpine: {
          meanAbsoluteError: Number(sfaxSummary.dynamicSpine.meanAbsoluteError.toFixed(6)),
          weightedMeanAbsoluteError: Number(sfaxSummary.dynamicSpine.weightedMeanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxSummary.dynamicSpine.maxAbsoluteError.toFixed(6)),
        },
        fps: {
          meanAbsoluteError: Number(sfaxSummary.fps.meanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxSummary.fps.maxAbsoluteError.toFixed(6)),
        },
        totalArrowWeight: {
          meanAbsoluteError: Number(sfaxSummary.totalArrowWeight.meanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxSummary.totalArrowWeight.maxAbsoluteError.toFixed(6)),
        },
        grlb: {
          meanAbsoluteError: Number(sfaxSummary.grlb.meanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxSummary.grlb.maxAbsoluteError.toFixed(6)),
        },
        ke: {
          meanAbsoluteError: Number(sfaxSummary.ke.meanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxSummary.ke.maxAbsoluteError.toFixed(6)),
        },
        foc: {
          meanAbsoluteError: Number(sfaxSummary.foc.meanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxSummary.foc.maxAbsoluteError.toFixed(6)),
        },
      },
      officialChartSanity: {
        meanAbsoluteError: Number(officialSummary.meanAbsoluteError.toFixed(6)),
        weightedMeanAbsoluteError: Number(officialSummary.weightedMeanAbsoluteError.toFixed(6)),
        maxAbsoluteError: Number(officialSummary.maxAbsoluteError.toFixed(6)),
        inRangeRate: Number(officialSummary.inRangeRate.toFixed(6)),
      },
      monotonicChecks,
    },
    null,
    2,
  ),
)
