import { makeCurrentShaftEntries } from './types'
import type { CurrentShaftEntry } from './types'

export const CARBON_EXPRESS_CURRENT_SHAFTS: CurrentShaftEntry[] = [
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Carbon Express',
      model: 'Nano Pro RZ',
      useCategory: 'target',
      sourceId: 'carbon_express_2026_nano_pro_rz',
    },
    [
      ['650', 0.191, 32.5, 0.65, 6.5, 0, 0, 0],
      ['600', 0.195, 32.5, 0.6, 6.8, 0, 0, 0],
      ['550', 0.197, 33, 0.55, 7.2, 0, 0, 0],
      ['500', 0.202, 33, 0.5, 7.7, 0, 0, 0],
      ['450', 0.206, 33, 0.45, 8.3, 0, 0, 0],
      ['400', 0.21, 33, 0.4, 8.8, 0, 0, 0],
      ['350', 0.216, 33, 0.35, 9.6, 0, 0, 0],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Carbon Express',
      model: 'Maxima XL 23',
      useCategory: 'target',
      sourceId: 'carbon_express_2026_maxima_xl_23',
    },
    [
      ['500', 0.355, 32.5, 0.5, 7.3, 0, 0, 0],
      ['400', 0.359, 32.5, 0.4, 8.1, 0, 0, 0],
      ['320', 0.362, 32.5, 0.32, 9, 0, 0, 0],
    ],
  ),
  ...makeCurrentShaftEntries(
    {
      manufacturer: 'Carbon Express',
      model: 'TANK 25',
      useCategory: 'target',
      sourceId: 'carbon_express_2026_tank_25',
    },
    [['400', 0.382, 32.8, 0.4, 7.1, 0, 0, 0]],
  ),
]
