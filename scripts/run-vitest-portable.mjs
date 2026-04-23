import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const repoRoot = process.cwd()
const tempDir = mkdtempSync(path.join(os.tmpdir(), 'archery-metrics-vitest-'))
const tempConfigPath = path.join(tempDir, 'vitest.config.mts')
const vitestConfigModule = pathToFileURL(path.resolve(repoRoot, 'node_modules', 'vitest', 'dist', 'config.js')).href
const vitestCli = path.resolve(repoRoot, 'node_modules', 'vitest', 'vitest.mjs')
const cacheDir = path.join(os.tmpdir(), 'archery-metrics-vitest-cache')

writeFileSync(
  tempConfigPath,
  [
    `import { defineConfig } from ${JSON.stringify(vitestConfigModule)}`,
    '',
    'export default defineConfig({',
    `  root: ${JSON.stringify(repoRoot)},`,
    `  cacheDir: ${JSON.stringify(cacheDir)},`,
    '  test: {',
    '    include: [\'src/**/*.test.ts\'],',
    '    environment: \'node\',',
    '    cache: false,',
    '  },',
    '})',
    '',
  ].join('\n'),
  'utf8',
)

execFileSync(process.execPath, [vitestCli, 'run', '--config', tempConfigPath, ...process.argv.slice(2)], {
  cwd: repoRoot,
  stdio: 'inherit',
})
