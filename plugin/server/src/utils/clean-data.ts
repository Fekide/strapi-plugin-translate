import { get, difference, cloneDeep, has } from 'lodash'
import { ContentTypeSchema, ComponentSchema } from '@strapi/types/dist/struct'
import { Attribute } from '@strapi/types/dist/schema'
import { Modules, UID, Utils } from '@strapi/strapi'

export function deleteInvalidFields<TSchemaUID extends UID.ContentType>(
  data: Modules.Documents.Document<TSchemaUID>,
  schema: ContentTypeSchema | ComponentSchema
) {
  if (!data) {
    return data
  }
  const attributesSchema = get(schema, 'attributes', [])
  const invalidFields = difference(
    Object.keys(data),
    Object.keys(attributesSchema)
  )
  invalidFields.forEach((field) => {
    if (field !== '__component') {
      delete data[field]
    }
  })
}

/**
 * Clean the data based on the schema to only include fields for input and flatten relations
 * @param {object} data The data to clean
 * @param {object} schema The schema of the content-type
 * @returns The input data with invalid fields (like id or localizations) removed
 */
export function cleanData<
  TSchemaUID extends UID.ContentType,
  ForFrontend extends boolean = boolean,
>(
  data: Modules.Documents.Document<TSchemaUID>,
  schema: ContentTypeSchema | ComponentSchema,
  forFrontend: ForFrontend
): Utils.If<
  ForFrontend,
  Modules.Documents.Document<TSchemaUID>,
  Modules.Documents.Params.Data.PartialInput<TSchemaUID>
> {
  const resultData = cloneDeep(data)

  deleteInvalidFields(resultData, schema)

  const attributesSchema = get(schema, 'attributes', [])

  Object.keys(attributesSchema).forEach((attr) => {
    const attributeSchema = attributesSchema[attr]

    if (!has(data, attr)) {
      return
    }

    if (attributeSchema.type === 'component') {
      resultData[attr] = cleanComponent(
        get(data, attr, undefined),
        attributeSchema,
        forFrontend
      )
    } else if (attributeSchema.type === 'dynamiczone') {
      resultData[attr] = get(data, attr, []).map(
        (object: Modules.Documents.AnyDocument) =>
          cleanComponent(object, attributeSchema, forFrontend)
      )
    } else if (attributeSchema.type === 'relation' && !forFrontend) {
      const relatedEntity = get(data, attr, [])
      if (Array.isArray(relatedEntity)) {
        resultData[attr] = relatedEntity.map((e) => e.id)
      } else if (relatedEntity) {
        resultData[attr] = relatedEntity.id
      }
    }
  })
  return resultData as unknown as Utils.If<
    ForFrontend,
    Modules.Documents.Document<TSchemaUID>,
    Modules.Documents.Params.Data.PartialInput<TSchemaUID>
  >
}

function cleanComponent<TSchemaUID extends UID.Component>(
  data: Modules.Documents.Document<TSchemaUID>,
  componentReference: Attribute.Component | Attribute.DynamicZone,
  forFrontend: boolean
) {
  if (!data) {
    return data
  }
  const componentSchema =
    componentReference.type === 'dynamiczone'
      ? strapi.components[data['__component']]
      : strapi.components[componentReference.component]
  if (componentReference['repeatable'] && Array.isArray(data)) {
    return data.map((value) => cleanData(value, componentSchema, forFrontend))
  }
  return cleanData(data, componentSchema, forFrontend)
}
