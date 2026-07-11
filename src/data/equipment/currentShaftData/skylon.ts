import { makeCurrentShaftEntries } from './types'
import type { CurrentShaftEntry } from './types'

export const SKYLON_CURRENT_SHAFTS: CurrentShaftEntry[] = makeCurrentShaftEntries(
  {
    manufacturer: 'Skylon',
    model: 'Paragon',
    useCategory: 'target',
    sourceId: 'skylon_2026_paragon',
  },
  [
    ['1000', 0.1752, 30, 1, 4.7, 0, 0, 0],
    ['900', 0.1772, 30, 0.9, 4.81, 0, 0, 0],
    ['850', 0.1791, 30, 0.85, 4.94, 0, 0, 0],
    ['800', 0.1807, 31, 0.8, 5.06, 0, 0, 0],
    ['750', 0.1823, 31, 0.75, 5.31, 0, 0, 0],
    ['700', 0.1839, 31, 0.7, 5.55, 0, 0, 0],
    ['650', 0.1862, 31, 0.65, 5.83, 0, 0, 0],
    ['600', 0.1882, 32, 0.6, 6.1, 0, 0, 0],
    ['550', 0.1906, 32, 0.55, 6.5, 0, 0, 0],
    ['500', 0.1929, 32, 0.5, 6.9, 0, 0, 0],
    ['450', 0.1984, 32, 0.45, 7.42, 0, 0, 0],
    ['400', 0.2035, 32, 0.4, 7.93, 0, 0, 0],
    ['350', 0.2067, 32, 0.35, 8.47, 0, 0, 0],
  ],
)
