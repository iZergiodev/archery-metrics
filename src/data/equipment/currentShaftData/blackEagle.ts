import { makeCurrentShaftEntries } from './types'
import type { CurrentShaftEntry } from './types'

export const BLACK_EAGLE_CURRENT_SHAFTS: CurrentShaftEntry[] = [
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Black Eagle',
      model: 'X Impact',
      useCategory: 'hunting',
      sourceId: 'black_eagle_2026_x_impact',
    },
    [
      ['200', 0.256, 32, 0.2, 11, 58, 3, 6],
      ['250', 0.24, 32, 0.25, 9.5, 58, 3, 6],
      ['300', 0.231, 32, 0.3, 8.1, 58, 3, 6],
      ['350', 0.228, 32, 0.35, 7.4, 58, 3, 6],
      ['400', 0.221, 32, 0.4, 6.7, 58, 3, 6],
      ['500', 0.214, 32, 0.5, 5.8, 58, 3, 6],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Black Eagle',
      model: 'Rampage',
      useCategory: 'hunting',
      sourceId: 'black_eagle_2026_rampage',
    },
    [
      ['150', 0.307, 32, 0.15, 16, 50, 3, 7],
      ['200', 0.285, 32, 0.2, 12.8, 50, 3, 7],
      ['250', 0.276, 32, 0.25, 10.7, 50, 3, 7],
      ['300', 0.264, 32, 0.3, 8.7, 50, 3, 7],
      ['350', 0.261, 32, 0.35, 8.2, 50, 3, 7],
      ['400', 0.253, 32, 0.4, 7, 50, 3, 7],
    ],
  ),
]
