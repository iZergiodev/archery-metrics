import { describe, expect, it } from 'vitest'
import { EASTON_CURRENT_SHAFTS } from './easton'

describe('EASTON_CURRENT_SHAFTS', () => {
  it('contains the exact current Easton model catalog', () => {
    expect(EASTON_CURRENT_SHAFTS).toHaveLength(155)
    expect(new Set(EASTON_CURRENT_SHAFTS.map(({ model }) => model))).toEqual(new Set([
      'X10',
      'A/C/E',
      '5.0',
      '5MM FMJ Classic',
      '5MM FMJ MAX',
      '3.2MM X10 Parallel Pro',
      '4MM X10 Parallel Pro',
      'Avance',
      'Superdrive Micro',
      'Sonic 6.0',
      '4MM Axis Long Range',
      '5MM Axis',
      '4MM FMJ',
      'Superdrive 23',
      'Superdrive 25',
      'Superdrive 27',
      'RX7',
      'X23',
      'X27',
      'X7 Eclipse',
      'XX75 Platinum Plus',
    ]))
  })

  it('preserves representative target and hunting specifications', () => {
    expect(EASTON_CURRENT_SHAFTS.find(({ model, size }) => model === 'X10' && size === '410'))
      .toMatchObject({
        od: 0.212,
        stockLength: 33.75,
        spine: 0.41,
        gpi: 8.5,
      })

    expect(EASTON_CURRENT_SHAFTS.find(({ model, size }) => model === '5.0' && size === '200'))
      .toMatchObject({
        useCategory: 'hunting',
        sourceId: 'easton_2026_5_0',
        stockLength: 33,
        pointInsert: 0,
        nockWeight: 8,
      })

    expect(EASTON_CURRENT_SHAFTS.find(({ model, size }) => (
      model === '5MM FMJ MAX' && size === '200'
    ))).toMatchObject({
      sourceId: 'easton_2026_5mm_fmj',
      od: 0.28,
      stockLength: 33,
      spine: 0.2,
      gpi: 13.3,
    })
  })

  it('adds the 2026 X10 Parallel Pro families from first-party tables', () => {
    expect(EASTON_CURRENT_SHAFTS.find(({ model, size }) => (
      model === '3.2MM X10 Parallel Pro' && size === '340'
    ))).toMatchObject({
      useCategory: 'target',
      od: 0.215,
      stockLength: 34,
      gpi: 10,
      pointInsert: 0,
      nockWeight: 0,
    })

    expect(EASTON_CURRENT_SHAFTS.find(({ model, size }) => (
      model === '4MM X10 Parallel Pro' && size === '250'
    ))).toMatchObject({
      od: 0.245,
      stockLength: 34,
      gpi: 10.8,
    })
  })

  it('records included Sonic and Axis Long Range hardware only when published', () => {
    expect(EASTON_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Sonic 6.0' && size === '250'
    ))).toMatchObject({
      useCategory: 'hunting',
      pointInsert: 23,
      nockWeight: 9,
    })

    expect(EASTON_CURRENT_SHAFTS.find(({ model, size }) => (
      model === '4MM Axis Long Range' && size === '400'
    ))).toMatchObject({
      od: 0.229,
      gpi: 7.6,
      pointInsert: 50,
      nockWeight: 6,
    })
  })
})
