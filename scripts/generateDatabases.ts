import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_DIR = resolve(__dirname, 'sfax-databases')
const OUT_DIR = resolve(__dirname, '..', 'src', 'data', 'equipment')

function mapUseCategory(code: string): 'base' | 'hunting' | 'target' {
  const first = code.charAt(0).toUpperCase()
  if (first === 'H') return 'hunting'
  if (first === 'T') return 'target'
  return 'base'
}

function parseShafts(): string {
  const raw = readFileSync(resolve(CSV_DIR, 'dec-ShaftData.csv'), 'utf-8')
  const lines = raw.split('\n')
  let manufacturer = ''
  const entries: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('*,') || trimmed.startsWith('=,') || trimmed.startsWith('--')) continue
    if (trimmed.startsWith('-,')) {
      const name = trimmed.slice(2).trim()
      if (name !== 'EOF') manufacturer = name
      continue
    }
    const parts = trimmed.split(',')
    if (parts.length < 10) continue
    const [model, size, use, od, stklen, spine, gpi, pi, bpc, stdn] = parts
    entries.push(
      `  { manufacturer: ${JSON.stringify(manufacturer)}, model: ${JSON.stringify(model.trim())}, size: ${JSON.stringify(size.trim())}, useCategory: ${JSON.stringify(mapUseCategory(use.trim()))}, od: ${parseFloat(od)}, stockLength: ${parseFloat(stklen)}, spine: ${parseFloat(spine)}, gpi: ${parseFloat(gpi)}, pointInsert: ${parseFloat(pi)}, bushingPin: ${parseFloat(bpc)}, nockWeight: ${parseFloat(stdn)} }`
    )
  }

  return `import type { ShaftEntry } from './types'\n\nexport const SHAFT_DATABASE: ShaftEntry[] = [\n${entries.join(',\n')},\n]\n`
}

function parseFletches(): string {
  const raw = readFileSync(resolve(CSV_DIR, 'dec-FletchData.csv'), 'utf-8')
  const lines = raw.split('\n')
  let manufacturer = ''
  const entries: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('*,') || trimmed.startsWith('=,') || trimmed.startsWith('--')) continue
    if (trimmed.startsWith('-,')) {
      const name = trimmed.slice(2).trim()
      if (name !== 'EOF') manufacturer = name
      continue
    }
    const parts = trimmed.split(',')
    if (parts.length < 5) continue
    const [model, weight, length, height, ftype] = parts
    entries.push(
      `  { manufacturer: ${JSON.stringify(manufacturer)}, model: ${JSON.stringify(model.trim())}, weight: ${parseFloat(weight)}, length: ${parseFloat(length)}, height: ${parseFloat(height)}, type: ${JSON.stringify((ftype ?? 'Vane').trim())} }`
    )
  }

  return `import type { FletchEntry } from './types'\n\nexport const FLETCH_DATABASE: FletchEntry[] = [\n${entries.join(',\n')},\n]\n`
}

function parseNocks(): string {
  const raw = readFileSync(resolve(CSV_DIR, 'dec-NockData.csv'), 'utf-8')
  const lines = raw.split('\n')
  let manufacturer = ''
  const entries: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('*,') || trimmed.startsWith('=,') || trimmed.startsWith('--')) continue
    if (trimmed.startsWith('-,')) {
      const name = trimmed.slice(2).trim()
      if (name !== 'EOF') manufacturer = name
      continue
    }
    const parts = trimmed.split(',')
    if (parts.length < 3) continue
    const [model, weight, bushingPin] = parts
    entries.push(
      `  { manufacturer: ${JSON.stringify(manufacturer)}, model: ${JSON.stringify(model.trim())}, weight: ${parseFloat(weight)}, bushingPin: ${parseFloat(bushingPin)} }`
    )
  }

  return `import type { NockEntry } from './types'\n\nexport const NOCK_DATABASE: NockEntry[] = [\n${entries.join(',\n')},\n]\n`
}

writeFileSync(resolve(OUT_DIR, 'shaftDatabase.ts'), parseShafts())
writeFileSync(resolve(OUT_DIR, 'fletchDatabase.ts'), parseFletches())
writeFileSync(resolve(OUT_DIR, 'nockDatabase.ts'), parseNocks())

console.log('Generated shaft, fletch, and nock databases.')
