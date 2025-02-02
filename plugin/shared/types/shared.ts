import { Data } from '@strapi/types'
export interface Entity {
  id: Data.ID
  documentId: Data.DocumentID
  createdAt: string
  updatedAt: string
}
