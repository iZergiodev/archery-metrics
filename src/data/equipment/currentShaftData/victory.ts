import { makeCurrentShaftEntries } from './types'
import type { CurrentShaftEntry } from './types'

export const VICTORY_CURRENT_SHAFTS: CurrentShaftEntry[] = [
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Victory Archery',
      model: 'VXT',
      useCategory: 'target',
      sourceId: 'victory_2026_vxt',
    },
    [
      ['300', 0.241, 31, 0.3, 8.3, 0, 12, 3],
      ['355', 0.237, 31, 0.355, 7.4, 0, 12, 3],
      ['450', 0.236, 31, 0.45, 7.4, 0, 12, 3],
      ['550', 0.234, 31, 0.55, 7.1, 0, 12, 3],
      ['630', 0.235, 31, 0.63, 7.4, 0, 12, 3],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Victory Archery',
      model: 'VAP',
      useCategory: 'target',
      sourceId: 'victory_2026_vap',
    },
    [
      ['350', 0.232, 31, 0.35, 7.8, 0, 0, 8],
      ['400', 0.227, 31, 0.4, 7.2, 0, 0, 8],
      ['450', 0.223, 31, 0.45, 6.6, 0, 0, 8],
      ['500', 0.218, 31, 0.5, 6.1, 0, 0, 8],
      ['600', 0.214, 31, 0.6, 5.5, 0, 0, 8],
      ['700', 0.216, 31, 0.7, 5.7, 0, 0, 8],
      ['800', 0.213, 31, 0.8, 5.4, 0, 0, 8],
      ['900', 0.21, 31, 0.9, 5, 0, 0, 8],
      ['1000', 0.208, 31, 1, 4.7, 0, 0, 8],
      ['1100', 0.208, 31, 1.1, 4.9, 0, 0, 8],
      ['1200', 0.206, 31, 1.2, 4.6, 0, 0, 8],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Victory Archery',
      model: 'RIP TKO',
      useCategory: 'hunting',
      sourceId: 'victory_2026_rip_tko',
    },
    [
      ['200', 0.276, 31, 0.2, 10.6, 50, 0, 8],
      ['250', 0.266, 31, 0.25, 8.9, 50, 0, 8],
      ['300', 0.266, 31, 0.3, 8.8, 50, 0, 8],
      ['350', 0.265, 31, 0.35, 8.7, 50, 0, 8],
      ['400', 0.266, 31, 0.4, 9, 50, 0, 8],
    ],
  ),
]
