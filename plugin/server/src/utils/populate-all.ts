import { Modules, Struct, UID } from '@strapi/strapi'
import { defaults, merge } from 'lodash'
import { keys } from './objects'

export interface PopulateOptions {
  readonly maxDepth?: number
  readonly populateMedia?: boolean
  readonly populateRelations?: boolean
}

export type PopulateRule<TSchemaUID extends UID.ContentType = UID.ContentType> =
  Modules.Documents.Params.Populate.Any<TSchemaUID>
/**
 * Create a populate object to populate all direct data:
 * - all components, dynamic zones and nested components
 * - from all relations only the Document ID (more is not necessary for translation)
 *
 * @param schema The schema of the content type
 * @param options - options for recursion and population
 * @param options.maxDepth - maximum depth for recursive population, defaults to 10
 * @param options.populateMedia - whether to include media, defaults to false
 * @param options.populateRelations - whether to populate relations, defaults to false
 * @returns a populate object with all components, nested components,
 *  dynamic zones and relations
 */
export function populateAll<
  TSchemaUID extends UID.ContentType = UID.ContentType,
>(
  schema: Struct.ContentTypeSchema | Struct.ComponentSchema,
  options?: PopulateOptions
): PopulateRule<TSchemaUID> {
  const { maxDepth, populateMedia, populateRelations } = defaults(options, {
    maxDepth: 10,
    populateMedia: false,
    populateRelations: false,
  })
  const attributesSchema = schema['attributes']
  const populateResult: PopulateRule<TSchemaUID> = {}

  keys(attributesSchema).forEach((attr) => {
    const fieldSchema = attributesSchema[attr]
    if (fieldSchema.type === 'component') {
      const rule = recursiveComponentPopulate(fieldSchema.component, {
        maxDepth: maxDepth - 1,
        populateMedia,
      })
      if (rule) {
        populateResult[attr] = {
          populate: rule,
        }
      }
    } else if (fieldSchema.type === 'dynamiczone') {
      const dynamicZonePopulate = fieldSchema.components.reduce(
        (combined: PopulateRule, component: UID.Component) => {
          const rule = recursiveComponentPopulate(component, {
            maxDepth: maxDepth - 1,
            populateMedia,
          })
          if (rule) {
            return merge(combined, {
              on: {
                [component]: rule,
              },
            })
          }
          return combined
        },
        {}
      )
      populateResult[attr] = {
        populate: dynamicZonePopulate,
      }
    } else if (['relation', 'media'].includes(fieldSchema.type)) {
      if (
        (fieldSchema.type === 'media' && populateMedia) ||
        (fieldSchema.type === 'relation' &&
          populateRelations &&
          !['plugin::users-permissions.user', 'admin::user'].includes(
            fieldSchema['target']
          ))
      ) {
        populateResult[attr] = true
      } else {
        populateResult[attr] = {
          fields: ['id'],
        }
      }
    }
  })
  if (keys(populateResult).length == 0) {
    return undefined
  }
  return populateResult
}

/**
 *
 * @param {object} componentReference The schema of the component in the content-type or component (to know if it is repeated or not)
 * @param {object} options - options for recursion and population
 * @param {number} options.maxDepth - maximum recursive depth
 * @param {boolean} options.populateMedia - see {@link populateAll}
 * @returns A list of attributes to translate for this component
 */
function recursiveComponentPopulate(
  component: UID.Component,
  options: PopulateOptions
): PopulateRule | false {
  const componentSchema = strapi.components[component]
  if (options.maxDepth == 0) {
    return false
  }
  return populateAll(componentSchema, options)
}
