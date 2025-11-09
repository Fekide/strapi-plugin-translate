import { has, get, omit } from 'lodash'
import TRANSLATABLE_FIELDS from './translatableFields'
import type { Schema } from '@strapi/strapi'

const localizedPath = ['pluginOptions', 'i18n', 'localized']
const translatePath = ['pluginOptions', 'translate', 'translate']

const addTranslationToFields = (attributes: Schema.ContentType['attributes']) =>
  Object.values(attributes).map((currentAttribute) => {
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

      return { ...currentAttribute, pluginOptions }
    }

    return currentAttribute
  })

type OmitByPath<T extends object, K extends string[]> = Pick<
  T,
  Exclude<keyof T, K[number]>
>

const disableAttributesLocalisation = (
  attributes: Schema.ContentType['attributes']
) =>
  Object.keys(attributes).reduce<
    Record<
      string,
      OmitByPath<
        Schema.ContentType['attributes'][string],
        ['pluginOptions', 'translate']
      >
    >
  >((acc, current) => {
    acc[current] = omit(attributes[current], 'pluginOptions.translate')

    return acc
  }, {})

const mutateCTBContentTypeSchema = (nextSchema: Schema.ContentType) => {
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
