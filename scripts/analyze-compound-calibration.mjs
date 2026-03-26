import { execFileSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

const repoRoot = process.cwd()
const outDir = path.join(os.tmpdir(), 'archery-metrics-analysis-cjs')

execFileSync(
  'pnpm',
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
  analyzeCompoundCalibration,
  analyzeOfficialCompoundBenchmarks,
  evaluateCompoundMonotonicity,
} = require(path.join(outDir, 'utils', 'spineCalibration.js'))

const sfaxAnalysis = analyzeCompoundCalibration()
const officialAnalysis = analyzeOfficialCompoundBenchmarks()
const monotonicChecks = evaluateCompoundMonotonicity()

console.log(
  JSON.stringify(
    {
      sfaxReferenceCount: sfaxAnalysis.overall.results.length,
      officialBenchmarkCount: officialAnalysis.overall.results.length,
      sfaxOverall: {
        dynamicSpine: {
          meanAbsoluteError: Number(sfaxAnalysis.overall.dynamicSpine.meanAbsoluteError.toFixed(6)),
          weightedMeanAbsoluteError: Number(sfaxAnalysis.overall.dynamicSpine.weightedMeanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxAnalysis.overall.dynamicSpine.maxAbsoluteError.toFixed(6)),
        },
        fps: {
          meanAbsoluteError: Number(sfaxAnalysis.overall.fps.meanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxAnalysis.overall.fps.maxAbsoluteError.toFixed(6)),
        },
        totalArrowWeight: {
          meanAbsoluteError: Number(sfaxAnalysis.overall.totalArrowWeight.meanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxAnalysis.overall.totalArrowWeight.maxAbsoluteError.toFixed(6)),
        },
        grlb: {
          meanAbsoluteError: Number(sfaxAnalysis.overall.grlb.meanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxAnalysis.overall.grlb.maxAbsoluteError.toFixed(6)),
        },
        ke: {
          meanAbsoluteError: Number(sfaxAnalysis.overall.ke.meanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxAnalysis.overall.ke.maxAbsoluteError.toFixed(6)),
        },
        foc: {
          meanAbsoluteError: Number(sfaxAnalysis.overall.foc.meanAbsoluteError.toFixed(6)),
          maxAbsoluteError: Number(sfaxAnalysis.overall.foc.maxAbsoluteError.toFixed(6)),
        },
      },
      officialOverall: {
        meanAbsoluteError: Number(officialAnalysis.overall.meanAbsoluteError.toFixed(6)),
        weightedMeanAbsoluteError: Number(officialAnalysis.overall.weightedMeanAbsoluteError.toFixed(6)),
        maxAbsoluteError: Number(officialAnalysis.overall.maxAbsoluteError.toFixed(6)),
        inRangeRate: Number(officialAnalysis.overall.inRangeRate.toFixed(6)),
      },
      worstSfaxCases: sfaxAnalysis.worstCases.map((result) => ({
        id: result.id,
        source: result.source,
        dynamicSpineError: Number(result.dynamicSpine.absoluteError.toFixed(4)),
        fpsError: Number(result.fps.absoluteError.toFixed(2)),
        focError: Number(result.foc.absoluteError.toFixed(2)),
        aggregateAbsoluteError: Number(result.aggregateAbsoluteError.toFixed(4)),
        status: result.status,
      })),
      worstOfficialCases: officialAnalysis.worstCases.map((result) => ({
        id: result.id,
        source: result.source,
        actualMatchIndex: Number(result.actualMatchIndex.toFixed(4)),
        absoluteError: Number(result.absoluteError.toFixed(4)),
        status: result.status,
      })),
      highestSfaxErrorBuckets: sfaxAnalysis.categoryBreakdown.slice(0, 12).map((bucket) => ({
        category: bucket.category,
        bucket: bucket.bucket,
        count: bucket.count,
        meanAbsoluteError: Number(bucket.meanAbsoluteError.toFixed(4)),
        weightedMeanAbsoluteError: Number(bucket.weightedMeanAbsoluteError.toFixed(4)),
        maxAbsoluteError: Number(bucket.maxAbsoluteError.toFixed(4)),
      })),
      highestOfficialErrorBuckets: officialAnalysis.categoryBreakdown.slice(0, 12).map((bucket) => ({
        category: bucket.category,
        bucket: bucket.bucket,
        count: bucket.count,
        meanAbsoluteError: Number(bucket.meanAbsoluteError.toFixed(4)),
        weightedMeanAbsoluteError: Number(bucket.weightedMeanAbsoluteError.toFixed(4)),
        maxAbsoluteError: Number(bucket.maxAbsoluteError.toFixed(4)),
      })),
      monotonicChecks,
    },
    null,
    2,
  ),
)
