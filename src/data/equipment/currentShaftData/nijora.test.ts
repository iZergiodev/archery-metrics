import { describe, expect, it } from 'vitest'
import { NIJORA_CURRENT_SHAFTS } from './nijora'

describe('NIJORA_CURRENT_SHAFTS', () => {
  it('contains the reviewed first-party Nijora competition families', () => {
    expect(NIJORA_CURRENT_SHAFTS).toHaveLength(37)
    expect(new Set(NIJORA_CURRENT_SHAFTS.map(({ model }) => model))).toEqual(new Set([
      'Elsu Pro',
      'Payat Premium',
      'Ilyan Pro',
      'Linawa',
      'Zitkala',
      'Big 9',
    ]))
  })

  it('preserves indoor Big 9 and outdoor Elsu Pro specifications', () => {
    expect(NIJORA_CURRENT_SHAFTS.find(({ model, size }) => model === 'Elsu Pro' && size === '400'))
      .toMatchObject({ od: 0.2559, gpi: 7.8, stockLength: 33 })
    expect(NIJORA_CURRENT_SHAFTS.find(({ model, size }) => model === 'Big 9' && size === '250'))
      .toMatchObject({ od: 0.3622, gpi: 9.4, useCategory: 'target' })
  })
})
