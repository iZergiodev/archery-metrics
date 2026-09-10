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
      ['200', 0.276, 31, 0.2, 10.6, 50, 0, 9],
      ['250', 0.266, 31, 0.25, 8.9, 50, 0, 9],
      ['300', 0.266, 31, 0.3, 8.8, 50, 0, 9],
      ['350', 0.265, 31, 0.35, 8.7, 50, 0, 9],
      ['400', 0.266, 31, 0.4, 9, 50, 0, 9],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Victory Archery',
      model: 'VX-27',
      useCategory: 'target',
      sourceId: 'victory_2026_vx_27',
    },
    [['200', 0.419, 31, 0.2, 8.8, 0, 25, 8]],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Victory Archery',
      model: 'V-TAC 23',
      useCategory: 'target',
      sourceId: 'victory_2026_vtac_23',
    },
    [
      ['270', 0.35, 31, 0.27, 7.2, 0, 16, 8],
      ['380', 0.349, 31, 0.38, 6.8, 0, 16, 8],
      ['480', 0.35, 31, 0.48, 7.2, 0, 16, 8],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Victory Archery',
      model: 'V-TAC 25',
      useCategory: 'target',
      sourceId: 'victory_2026_vtac_25',
    },
    [
      ['200', 0.382, 31, 0.2, 8.1, 0, 19, 8],
      ['300', 0.379, 31, 0.3, 7.2, 0, 19, 8],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Victory Archery',
      model: 'V-TAC 27',
      useCategory: 'target',
      sourceId: 'victory_2026_vtac_27',
    },
    [['220', 0.416, 31, 0.22, 10.8, 0, 25, 8]],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Victory Archery',
      model: '3DHV',
      useCategory: 'target',
      sourceId: 'victory_2026_3dhv',
    },
    [
      ['300', 0.255, 31, 0.3, 7.1, 0, 7, 8],
      ['350', 0.251, 31, 0.35, 6.4, 0, 7, 8],
      ['400', 0.247, 31, 0.4, 5.9, 0, 7, 8],
      ['500', 0.242, 31, 0.5, 5.1, 0, 7, 8],
      ['600', 0.244, 31, 0.6, 5.5, 0, 7, 8],
      ['700', 0.243, 31, 0.7, 5.4, 0, 7, 8],
      ['800', 0.24, 31, 0.8, 5, 0, 7, 8],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Victory Archery',
      model: 'VFT',
      useCategory: 'target',
      sourceId: 'victory_2026_vft',
    },
    [
      ['350', 0.298, 31, 0.35, 8.7, 0, 11, 3],
      ['400', 0.295, 31, 0.4, 8.2, 0, 11, 3],
      ['500', 0.287, 31, 0.5, 6.9, 0, 11, 3],
      ['600', 0.287, 31, 0.6, 6.6, 0, 11, 3],
    ],
  ),
]
