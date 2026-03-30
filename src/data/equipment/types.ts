export type ShaftEntry = {
  manufacturer: string
  model: string
  size: string
  useCategory: 'base' | 'hunting' | 'target'
  od: number
  stockLength: number
  spine: number
  gpi: number
  pointInsert: number
  bushingPin: number
  nockWeight: number
}

export type FletchEntry = {
  manufacturer: string
  model: string
  weight: number
  length: number
  height: number
  type: string
}

export type NockEntry = {
  manufacturer: string
  model: string
  weight: number
  bushingPin: number
}
