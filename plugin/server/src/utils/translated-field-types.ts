import { getConfig } from './get-config'

function getFieldTypeConfig(type: string) {
  const { translatedFieldTypes } = getConfig()

  return translatedFieldTypes
    .map((t) =>
      typeof t === 'string' ? { type: t, format: 'plain' as const } : t
    )
    .find((t) => t.type === type)
}

export function isTranslatedFieldType(type: string) {
  return !!getFieldTypeConfig(type)
}

export function getFieldTypeFormat(type: string) {
  const typeConfig = getFieldTypeConfig(type)

  if (typeof typeConfig === 'string') {
    return 'plain'
  } else {
    return typeConfig.format
  }
}

export function isPlainFieldType(type: string) {
  // Either the format is not 'plain' or the format is not defined
  return !(getFieldTypeConfig(type).format !== 'plain')
}
