import { describe, expect, it } from 'vitest'
import {
  convertCanonicalToDisplay,
  convertDisplayToCanonical,
  formatInputDisplayValue,
  formatResultDisplayValue,
  formatTemperatureDisplayValue,
  getTemperatureUnitLabel,
  getUnitLabel,
  toCanonicalInputValue,
} from './unitSystem'

describe('unitSystem', () => {
  it('convierte longitud entre pulgadas y centimetros', () => {
    const canonical = convertDisplayToCanonical(71.12, 'length', 'metric')
    expect(canonical).toBeCloseTo(28, 4)
    expect(convertCanonicalToDisplay(canonical, 'length', 'metric')).toBeCloseTo(71.12, 2)
  })

  it('convierte peso de tiro entre libras y kilos', () => {
    const canonical = convertDisplayToCanonical(27.22, 'drawWeight', 'metric')
    expect(canonical).toBeCloseTo(60, 3)
    expect(convertCanonicalToDisplay(canonical, 'drawWeight', 'metric')).toBeCloseTo(27.22, 2)
  })

  it('convierte pesos de componentes entre grains y gramos', () => {
    const canonical = convertDisplayToCanonical(6.48, 'componentWeight', 'metric')
    expect(canonical).toBeCloseTo(100, 2)
    expect(convertCanonicalToDisplay(canonical, 'componentWeight', 'metric')).toBeCloseTo(6.48, 2)
  })

  it('convierte velocidades entre fps y m/s', () => {
    const canonical = convertDisplayToCanonical(91.44, 'speed', 'metric')
    expect(canonical).toBeCloseTo(300, 2)
    expect(convertCanonicalToDisplay(canonical, 'speed', 'metric')).toBeCloseTo(91.44, 2)
  })

  it('convierte densidad lineal entre gr/in y g/cm', () => {
    const canonical = convertDisplayToCanonical(0.219, 'linearDensity', 'metric')
    expect(canonical).toBeCloseTo(8.58, 2)
    expect(convertCanonicalToDisplay(canonical, 'linearDensity', 'metric')).toBeCloseTo(0.219, 3)
  })

  it('normaliza inputs metricos a unidades canonicas', () => {
    expect(Number(toCanonicalInputValue('71.12', 'length', 'metric'))).toBeCloseTo(28, 3)
    expect(Number(toCanonicalInputValue('27.22', 'drawWeight', 'metric'))).toBeCloseTo(60, 2)
    expect(Number(toCanonicalInputValue('6.48', 'componentWeight', 'metric'))).toBeCloseTo(100, 2)
  })

  it('formatea inputs y resultados segun el sistema activo', () => {
    expect(formatInputDisplayValue('28', 'length', 'metric')).toBe('71.1')
    expect(formatResultDisplayValue(444.8, 'componentWeight', 'metric')).toBe('28.8')
    expect(getUnitLabel('speed', 'metric')).toBe('m/s')
  })

  it('convierte temperatura del resumen segun el sistema activo', () => {
    expect(formatTemperatureDisplayValue(70, 'imperial')).toBe('70')
    expect(formatTemperatureDisplayValue(68, 'metric')).toBe('20')
    expect(getTemperatureUnitLabel('metric')).toBe('°C')
  })
})
