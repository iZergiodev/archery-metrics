import { makeCurrentShaftEntries } from './types'
import type { CurrentShaftEntry } from './types'

export const NIJORA_CURRENT_SHAFTS: CurrentShaftEntry[] = [
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Nijora',
      model: 'Elsu Pro',
      useCategory: 'target',
      sourceId: 'nijora_2026_elsu_pro',
    },
    [
      ['250', 0.2638, 33, 0.25, 8.8, 0, 0, 0],
      ['300', 0.2618, 33, 0.3, 7.8, 0, 0, 0],
      ['350', 0.2598, 33, 0.35, 7.9, 0, 0, 0],
      ['400', 0.2559, 33, 0.4, 7.8, 0, 0, 0],
      ['500', 0.248, 33, 0.5, 6.5, 0, 0, 0],
      ['600', 0.2441, 33, 0.6, 5.7, 0, 0, 0],
      ['700', 0.2441, 33, 0.7, 5.6, 0, 0, 0],
      ['800', 0.2421, 32, 0.8, 5, 0, 0, 0],
      ['900', 0.2362, 32, 0.9, 4.4, 0, 0, 0],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Nijora',
      model: 'Payat Premium',
      useCategory: 'target',
      sourceId: 'nijora_2026_payat',
    },
    [
      ['400', 0.2913, 32, 0.4, 7.4, 0, 0, 0],
      ['500', 0.2835, 32, 0.5, 6.5, 0, 0, 0],
      ['600', 0.2795, 32, 0.6, 5.8, 0, 0, 0],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Nijora',
      model: 'Ilyan Pro',
      useCategory: 'target',
      sourceId: 'nijora_2026_ilyan_pro',
    },
    [
      ['350', 0.2984, 33, 0.35, 8.85, 0, 0, 0],
      ['400', 0.2925, 33, 0.4, 7.95, 0, 0, 0],
      ['450', 0.2894, 33, 0.45, 7.5, 0, 0, 0],
      ['500', 0.2874, 33, 0.5, 7, 0, 0, 0],
      ['550', 0.2854, 33, 0.55, 6.55, 0, 0, 0],
      ['600', 0.2827, 33, 0.6, 6.1, 0, 0, 0],
      ['650', 0.2819, 33, 0.65, 6, 0, 0, 0],
      ['700', 0.2811, 33, 0.7, 5.8, 0, 0, 0],
      ['800', 0.2776, 33, 0.8, 5.2, 0, 0, 0],
      ['1000', 0.2752, 33, 1, 4.8, 0, 0, 0],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Nijora',
      model: 'Linawa',
      useCategory: 'target',
      sourceId: 'nijora_2026_linawa',
    },
    [
      ['400', 0.3425, 32, 0.4, 7.7, 0, 0, 0],
      ['500', 0.3366, 32, 0.5, 7.1, 0, 0, 0],
      ['600', 0.3346, 32, 0.6, 6.7, 0, 0, 0],
      ['700', 0.3339, 32, 0.7, 6.5, 0, 0, 0],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Nijora',
      model: 'Zitkala',
      useCategory: 'target',
      sourceId: 'nijora_2026_zitkala',
    },
    [
      ['400', 0.252, 33, 0.4, 6.9, 0, 0, 0],
      ['500', 0.248, 33, 0.5, 6, 0, 0, 0],
      ['600', 0.2441, 33, 0.6, 5.3, 0, 0, 0],
      ['700', 0.2429, 33, 0.7, 5.2, 0, 0, 0],
      ['800', 0.2402, 33, 0.8, 5, 0, 0, 0],
      ['1000', 0.2343, 33, 1, 4.3, 0, 0, 0],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Nijora',
      model: 'Big 9',
      useCategory: 'target',
      sourceId: 'nijora_2026_big_9',
    },
    [
      ['250', 0.3622, 32, 0.25, 9.4, 0, 0, 0],
      ['350', 0.3622, 32, 0.35, 8.5, 0, 0, 0],
      ['400', 0.3543, 32, 0.4, 7.9, 0, 0, 0],
      ['500', 0.3583, 32, 0.5, 6.9, 0, 0, 0],
      ['600', 0.3543, 32, 0.6, 6.7, 0, 0, 0],
    ],
  ),
]
