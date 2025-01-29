import { UID } from '@strapi/strapi'
import { z } from 'zod'

export function isContentTypeUID(uid: string): uid is UID.ContentType {
  return strapi.contentTypes[uid] !== undefined
}

export function isCollectionType(uid: string): boolean {
  return strapi.contentTypes[uid]?.kind === 'collectionType'
}

export function isSingleType(uid: string): boolean {
  return strapi.contentTypes[uid]?.kind === 'singleType'
}

const i18nPluginOptionsSchema = z.object({
  localized: z.boolean().default(false),
})

export function isLocalizedContentType(uid: UID.ContentType): boolean {
  const {success, data: i18nPluginOptions} = i18nPluginOptionsSchema.safeParse(
    strapi.contentTypes[uid]?.pluginOptions.i18n
  )
  if (!success) {
    return false
  }
  return i18nPluginOptions.localized === true
}
