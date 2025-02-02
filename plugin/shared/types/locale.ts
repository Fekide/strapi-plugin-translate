import { Entity } from './shared'

export interface Locale extends Entity {
  code: string
  isDefault: boolean
  name: string
}
