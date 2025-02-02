import { Data } from '@strapi/types'
import { errors } from '@strapi/utils'

export type UpdatedEntry = Data.Entity & {
  contentType: string
  groupID: string
  localesWithUpdates: string[]
}

/**
 * GET /translate/batch/updates - Get all updated-entries
 */
export declare namespace GetUpdatedEntries {
  export interface Request {
    query: {}
    body: {}
  }

  export type Response =
    | { data: UpdatedEntry[] }
    | {
        data: null
        error: errors.ApplicationError
      }
}

/**
 * DEL /translate/batch/updates/:id - Delete a single updated-entry
 */
export declare namespace DeleteUpdatedEntry {
  export interface Request {
    query: {}
    body: {}
  }

  export interface Params {
    id: UpdatedEntry['id']
  }

  export type Response =
    | { data: UpdatedEntry }
    | {
        data: null
        error: errors.ApplicationError
      }
}
