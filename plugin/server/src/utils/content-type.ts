import { UID } from '@strapi/strapi'

export function isContentTypeUID(uid: string): uid is UID.ContentType {
  return strapi.contentTypes[uid] !== undefined
}

export function isCollectionType(uid: string): uid is UID.CollectionType {
  return strapi.contentTypes[uid].kind === 'collectionType'
}
