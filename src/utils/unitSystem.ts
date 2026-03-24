export type UnitSystem = 'imperial' | 'metric'

export type ConvertibleField =
  | 'none'
  | 'length'
  | 'drawWeight'
  | 'componentWeight'
  | 'speed'
  | 'linearDensity'

const INCH_TO_CM = 2.54
const POUND_TO_KG = 0.45359237
const GRAIN_TO_GRAM = 0.06479891
const FPS_TO_MPS = 0.3048
const GRAIN_PER_INCH_TO_GRAM_PER_CM = GRAIN_TO_GRAM / INCH_TO_CM
const FREEZING_POINT_F = 32

const CANONICAL_DECIMALS: Record<Exclude<ConvertibleField, 'none'>, number> = {
  length: 4,
  drawWeight: 4,
  componentWeight: 4,
  speed: 4,
  linearDensity: 6,
}

const INPUT_DISPLAY_DECIMALS: Record<Exclude<ConvertibleField, 'none'>, Record<UnitSystem, number>> = {
  length: { imperial: 2, metric: 1 },
  drawWeight: { imperial: 1, metric: 2 },
  componentWeight: { imperial: 1, metric: 2 },
  speed: { imperial: 0, metric: 1 },
  linearDensity: { imperial: 2, metric: 3 },
}

const RESULT_DISPLAY_DECIMALS: Record<Exclude<ConvertibleField, 'none'>, Record<UnitSystem, number>> = {
  length: { imperial: 2, metric: 1 },
  drawWeight: { imperial: 1, metric: 2 },
  componentWeight: { imperial: 0, metric: 1 },
  speed: { imperial: 0, metric: 0 },
  linearDensity: { imperial: 2, metric: 3 },
}

function parseNumeric(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null

  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function formatNumber(value: number, decimals: number): string {
  return value
    .toFixed(decimals)
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
}

export function getUnitLabel(field: ConvertibleField, unitSystem: UnitSystem): string {
  switch (field) {
    case 'length':
      return unitSystem === 'imperial' ? 'in' : 'cm'
    case 'drawWeight':
      return unitSystem === 'imperial' ? 'lbs' : 'kg'
    case 'componentWeight':
      return unitSystem === 'imperial' ? 'gr' : 'g'
    case 'speed':
      return unitSystem === 'imperial' ? 'fps' : 'm/s'
    case 'linearDensity':
      return unitSystem === 'imperial' ? 'gr/in' : 'g/cm'
    case 'none':
    default:
      return ''
  }
}

export function convertDisplayToCanonical(value: number, field: Exclude<ConvertibleField, 'none'>, unitSystem: UnitSystem): number {
  if (unitSystem === 'imperial') return value

  switch (field) {
    case 'length':
      return value / INCH_TO_CM
    case 'drawWeight':
      return value / POUND_TO_KG
    case 'componentWeight':
      return value / GRAIN_TO_GRAM
    case 'speed':
      return value / FPS_TO_MPS
    case 'linearDensity':
      return value / GRAIN_PER_INCH_TO_GRAM_PER_CM
  }
}

export function convertCanonicalToDisplay(value: number, field: Exclude<ConvertibleField, 'none'>, unitSystem: UnitSystem): number {
  if (unitSystem === 'imperial') return value

  switch (field) {
    case 'length':
      return value * INCH_TO_CM
    case 'drawWeight':
      return value * POUND_TO_KG
    case 'componentWeight':
      return value * GRAIN_TO_GRAM
    case 'speed':
      return value * FPS_TO_MPS
    case 'linearDensity':
      return value * GRAIN_PER_INCH_TO_GRAM_PER_CM
  }
}

export function toCanonicalInputValue(value: string, field: ConvertibleField, unitSystem: UnitSystem): string {
  if (field === 'none') return value

  const parsed = parseNumeric(value)
  if (parsed == null) return ''

  return formatNumber(convertDisplayToCanonical(parsed, field, unitSystem), CANONICAL_DECIMALS[field])
}

export function formatInputDisplayValue(value: string, field: ConvertibleField, unitSystem: UnitSystem): string {
  if (field === 'none' || value.trim() === '') return value

  const parsed = parseNumeric(value)
  if (parsed == null) return value

  return formatNumber(convertCanonicalToDisplay(parsed, field, unitSystem), INPUT_DISPLAY_DECIMALS[field][unitSystem])
}

export function formatResultDisplayValue(
  value: number | null | undefined,
  field: Exclude<ConvertibleField, 'none'>,
  unitSystem: UnitSystem,
): string {
  if (value == null || !Number.isFinite(value)) return '--'

  return formatNumber(convertCanonicalToDisplay(value, field, unitSystem), RESULT_DISPLAY_DECIMALS[field][unitSystem])
}

export function formatTemperatureDisplayValue(value: number | null | undefined, unitSystem: UnitSystem): string {
  if (value == null || !Number.isFinite(value)) return '--'
  if (unitSystem === 'imperial') return formatNumber(value, 0)

  return formatNumber(((value - FREEZING_POINT_F) * 5) / 9, 0)
}

export function getTemperatureUnitLabel(unitSystem: UnitSystem): string {
  return unitSystem === 'imperial' ? '°F' : '°C'
}
