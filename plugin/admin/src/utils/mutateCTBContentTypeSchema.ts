import { has, get, omit } from 'lodash'
import TRANSLATABLE_FIELDS from './translatableFields'

const localizedPath = ['pluginOptions', 'i18n', 'localized']
const translatePath = ['pluginOptions', 'translate', 'translate']

const addTranslationToFields = (attributes) =>
  Object.keys(attributes).reduce((acc, current) => {
    const currentAttribute = attributes[current]

    const attributeIsLocalized = get(currentAttribute, localizedPath, true)

    const attributeDefaultTranslated =
      currentAttribute.type === 'relation' || attributeIsLocalized

    if (
      attributeDefaultTranslated &&
      TRANSLATABLE_FIELDS.includes(currentAttribute.type)
    ) {
      const translate = {
        translate: get(
          currentAttribute,
          translatePath,
          attributeDefaultTranslated ? 'translate' : 'copy'
        ),
      }

      const pluginOptions = {
        ...(currentAttribute.pluginOptions ?? {}),
        translate,
      }

      acc[current] = { ...currentAttribute, pluginOptions }

      return acc
    }

    acc[current] = currentAttribute

    return acc
  }, {})

const disableAttributesLocalisation = (attributes) =>
  Object.keys(attributes).reduce((acc, current) => {
    acc[current] = omit(attributes[current], 'pluginOptions.translate')

    return acc
  }, {})

const mutateCTBContentTypeSchema = (nextSchema) => {
  // Don't perform mutations components
  if (!has(nextSchema, localizedPath)) {
    return nextSchema
  }

  const isNextSchemaLocalized = get(nextSchema, localizedPath, false)

  if (isNextSchemaLocalized) {
    const attributes = addTranslationToFields(nextSchema.attributes)

    return { ...nextSchema, attributes }
  }

  // Remove the translate object from the pluginOptions
  if (!isNextSchemaLocalized) {
    const attributes = disableAttributesLocalisation(nextSchema.attributes)

    return { ...nextSchema, attributes }
  }

  return nextSchema
}
export default mutateCTBContentTypeSchema
export { addTranslationToFields, disableAttributesLocalisation }
