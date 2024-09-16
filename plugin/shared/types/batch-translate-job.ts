import { Data, UID } from '@strapi/strapi'

export interface BatchTranslateJob {
  documentId: Data.DocumentID
  id: Data.ID
  contentType: UID.ContentType
  status:
    | 'created'
    | 'setup'
    | 'running'
    | 'paused'
    | 'finished'
    | 'cancelled'
    | 'failed'
  progress: number
  failureReason?: any | null
  entityIds?: Data.DocumentID[]
  sourceLocale: string
  targetLocale: string
  autoPublish: boolean
}
