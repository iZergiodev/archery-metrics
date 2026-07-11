import { makeCurrentShaftEntries } from './types'
import type { CurrentShaftEntry } from './types'

export const FIVICS_CURRENT_SHAFTS: CurrentShaftEntry[] = makeCurrentShaftEntries(
  {
    manufacturer: 'FIVICS',
    model: 'FIVE-X',
    useCategory: 'target',
    sourceId: 'fivics_2026_five_x',
  },
  [
    ['350', 0.2126, 33, 0.35, 8.75, 0, 0, 0],
    ['400', 0.2072, 33, 0.4, 8.27, 0, 0, 0],
    ['450', 0.2021, 33, 0.45, 7.66, 0, 0, 0],
    ['500', 0.1985, 33, 0.5, 7.27, 0, 0, 0],
    ['550', 0.1952, 31, 0.55, 6.8, 0, 0, 0],
    ['600', 0.1922, 31, 0.6, 6.44, 0, 0, 0],
    ['650', 0.1895, 31, 0.65, 6.16, 0, 0, 0],
    ['700', 0.186, 29, 0.7, 5.84, 0, 0, 0],
    ['750', 0.1841, 29, 0.75, 5.52, 0, 0, 0],
    ['800', 0.1824, 29, 0.8, 5.4, 0, 0, 0],
    ['850', 0.1812, 28, 0.85, 5.28, 0, 0, 0],
    ['900', 0.1788, 28, 0.9, 4.97, 0, 0, 0],
    ['1000', 0.1765, 28, 1, 4.76, 0, 0, 0],
  ],
)
