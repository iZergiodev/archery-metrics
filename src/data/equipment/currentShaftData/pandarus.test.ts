import { describe, expect, it } from 'vitest'
import { PANDARUS_CURRENT_SHAFTS } from './pandarus'

describe('PANDARUS_CURRENT_SHAFTS', () => {
  it('contains the exact current Pandarus catalog', () => {
    expect(PANDARUS_CURRENT_SHAFTS).toHaveLength(90)

    const sizesFor = (model: string) => PANDARUS_CURRENT_SHAFTS
      .filter((entry) => entry.model === model)
      .map((entry) => entry.size)

    expect(sizesFor('ELITE CA320')).toEqual([
      '325', '350', '380', '410', '450', '500', '550',
      '600', '650', '700', '750', '830', '900', '1000',
    ])
    expect(sizesFor('ELITE CA320 Pro')).toEqual([
      '340', '380', '420', '470', '520', '570', '620', '670', '720', '770',
    ])
    expect(sizesFor('Champion')).toHaveLength(11)
    expect(sizesFor('Alpha-X')).toEqual(['300', '350', '400', '500', '600', '700', '800'])
    expect(sizesFor('ELITE XT')).toHaveLength(14)
    expect(sizesFor('ICEPOINT')).toHaveLength(14)
    expect(sizesFor('Infinity')).toHaveLength(13)
    expect(sizesFor('Precision')).toHaveLength(7)
  })

  it('preserves representative ELITE CA320 specifications and provenance', () => {
    expect(PANDARUS_CURRENT_SHAFTS.find(({ size, model }) => (
      model === 'ELITE CA320' && size === '325'
    ))).toMatchObject({
      manufacturer: 'Pandarus',
      model: 'ELITE CA320',
      useCategory: 'target',
      sourceId: 'pandarus_2026_elite_ca320',
      od: 0.2291,
      stockLength: 32,
      spine: 0.325,
      gpi: 9.2,
      pointInsert: 0,
      bushingPin: 0,
      nockWeight: 0,
    })
  })

  it('adds CA320 Pro, Champion, and Alpha-X from first-party tables', () => {
    expect(PANDARUS_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'ELITE CA320 Pro' && size === '340'
    ))).toMatchObject({
      od: 0.2244,
      gpi: 11.2,
      stockLength: 32,
    })

    expect(PANDARUS_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Champion' && size === '300'
    ))).toMatchObject({
      useCategory: 'hunting',
      od: 0.2441,
      gpi: 10.2,
    })

    expect(PANDARUS_CURRENT_SHAFTS.find(({ model, size }) => (
      model === 'Alpha-X' && size === '800'
    ))).toMatchObject({
      od: 0.2717,
      stockLength: 30,
      gpi: 4.4,
    })
  })

  it('does not auto-fill component weights not specified by the manufacturer', () => {
    expect(PANDARUS_CURRENT_SHAFTS.every((shaft) => (
      shaft.pointInsert === 0
      && shaft.bushingPin === 0
      && shaft.nockWeight === 0
    ))).toBe(true)
  })
})
