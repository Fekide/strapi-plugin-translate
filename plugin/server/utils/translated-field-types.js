'use strict'

function getFieldTypeConfig(type) {
  const { translatedFieldTypes } = strapi.config.get('plugin.translate')

  return translatedFieldTypes.find((t) => t === type || t.type === type)
}

function isTranslatedFieldType(type) {
  return !!getFieldTypeConfig(type)
}

function getFieldTypeFormat(type) {
  const typeConfig = getFieldTypeConfig(type)

  if (typeof typeConfig === 'string') {
    return 'plain'
  } else {
    return typeConfig.format
  }
}

function isPlainFieldType(type) {
  return getFieldTypeConfig(type) === 'plain'
}

module.exports = {
  isTranslatedFieldType,
  getFieldTypeFormat,
  isPlainFieldType,
}
