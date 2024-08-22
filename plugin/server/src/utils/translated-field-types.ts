function getFieldTypeConfig(type) {
  const { translatedFieldTypes } = strapi.config.get('plugin.translate')

  return translatedFieldTypes.find((t) => t === type || t.type === type)
}

export function isTranslatedFieldType(type) {
  return !!getFieldTypeConfig(type)
}

export function getFieldTypeFormat(type) {
  const typeConfig = getFieldTypeConfig(type)

  if (typeof typeConfig === 'string') {
    return 'plain'
  } else {
    return typeConfig.format
  }
}

export function isPlainFieldType(type) {
  return getFieldTypeConfig(type) === 'plain'
}
