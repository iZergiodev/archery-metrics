import { makeCurrentShaftEntries } from './types'
import type { CurrentShaftEntry } from './types'

export const GOLD_TIP_CURRENT_SHAFTS: CurrentShaftEntry[] = [
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Gold Tip',
      model: 'Kinetic Pierce Tour',
      useCategory: 'target',
      sourceId: 'gold_tip_2026_pierce_tour',
    },
    [
      ['700', 0.213, 30, 0.7, 5.5, 0, 0, 0],
      ['600', 0.219, 30, 0.6, 6.2, 0, 0, 0],
      ['500', 0.222, 30, 0.5, 6.6, 0, 0, 0],
      ['400', 0.229, 32, 0.4, 7.6, 0, 0, 0],
      ['340', 0.234, 32, 0.34, 8.3, 0, 0, 0],
      ['300', 0.24, 32, 0.3, 9.1, 0, 0, 0],
      ['250', 0.245, 32, 0.25, 9.8, 0, 0, 0],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Gold Tip',
      model: 'Airstrike',
      useCategory: 'hunting',
      sourceId: 'gold_tip_2026_airstrike',
    },
    [
      ['400', 0.254, 32, 0.4, 7.2, 24.3, 3.4, 11.6],
      ['340', 0.258, 32, 0.34, 7.8, 24.9, 3.9, 11.6],
      ['300', 0.262, 32, 0.3, 8.5, 25.4, 4, 11.6],
      ['250', 0.269, 32, 0.25, 9.6, 26.4, 5, 11.6],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Gold Tip',
      model: 'Hunter XT',
      useCategory: 'hunting',
      sourceId: 'gold_tip_2026_hunter_xt',
    },
    [
      ['500', 0.291, 30, 0.5, 7.3, 12.1, 0, 12.2],
      ['400', 0.295, 32, 0.4, 8.2, 12.1, 0, 12.2],
      ['340', 0.3, 32, 0.34, 8.9, 12.1, 0, 12.2],
      ['300', 0.302, 32, 0.3, 9.3, 12.1, 0, 12.2],
      ['250', 0.309, 32, 0.25, 10.6, 12.1, 0, 12.2],
    ],
  ),
]
