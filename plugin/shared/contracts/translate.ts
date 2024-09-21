import { UID, Data } from '@strapi/strapi'
import { errors } from '@strapi/utils'
import { BatchTranslateJob } from '../types/batch-translate-job'
import { ReportData } from '@shared/types/report'


/**
 * POST /translate/entity - Translate a single entity
 */
export declare namespace TranslateEntity {
  export interface Request {
    query: {}
    body: {
      documentId?: Data.DocumentID
      sourceLocale: string
      targetLocale: string
      contentType: UID.ContentType
    }
  }

  export type Response =
    | { data: Data.ContentType }
    | {
        data: null
        error: errors.ApplicationError
      }
}

/**
 * POST /translate/batch - Translate a batch of entities
 */
export declare namespace TranslateBatch {
  export interface Request {
    query: {}
    body: {
      sourceLocale: string
      targetLocale: string
      contentType: UID.ContentType
      entityIds?: Data.DocumentID[]
      autoPublish: boolean
    }
  }

  export type Response =
    | { data: BatchTranslateJob }
    | {
        data: null
        error: errors.ApplicationError
      }
}

/**
 * POST /translate/batch/pause/:id - Pause a batch-translate job
 */
export declare namespace TranslateBatchPauseJob {
  export interface Request {
    query: {documentId: Data.DocumentID}
    body: {
      
    }
  }

  export type Response =
    | { data: BatchTranslateJob }
    | {
        data: null
        error: errors.ApplicationError
      }
}

/**
 * POST /translate/batch/resume/:id - Resume a batch-translate job
 */
export declare namespace TranslateBatchResumeJob {
  export interface Request {
    query: {documentId: Data.DocumentID}
    body: {
      
    }
  }

  export type Response =
    | { data: BatchTranslateJob }
    | {
        data: null
        error: errors.ApplicationError
      }
}

/**
 * POST /translate/batch/cancel/:id - Cancel a batch-translate job
 */
export declare namespace TranslateBatchCancelJob {
  export interface Request {
    query: {documentId: Data.DocumentID}
    body: {
      
    }
  }

  export type Response =
    | { data: BatchTranslateJob }
    | {
        data: null
        error: errors.ApplicationError
      }
}

/**
 * GET /translate/batch/status/:id - Get status of a batch-translate job
 */
export declare namespace TranslateBatchJobStatus {
  export interface Request {
    query: {documentId: Data.DocumentID}
    body: {
      
    }
  }

  export type Response =
    | { data: Pick<BatchTranslateJob, 'status' | 'progress' | 'failureReason'> }
    | {
        data: null
        error: errors.ApplicationError
      }
}

/**
 * POST /translate/batch-update - Update the translations of a batch of entities
 */
export declare namespace TranslateBatchUpdate {
  export interface Request {
    query: {}
    body: {
      sourceLocale: string
      updatedEntryIds: Data.DocumentID[]
    }
  }

  export type Response =
    | { data: { result: 'success' } }
    | {
        data: null
        error: errors.ApplicationError
      }
}

/**
 * POST /translate/report - Get a report of the translation status of all content types
 */
export declare namespace ContentTypesTranslationReport {
  export interface Request {
    query: {}
    body: {}
  }

  export type Response =
    | {
        data: ReportData
      }
    | {
        data: null
        error: errors.ApplicationError
      }
}

/**
 * POST /translate/usage/estimate - Get a report of the amount of characters that will be translated for a single entity
 */
export declare namespace UsageEstimate {
  export interface Request {
    query: {}
    body: {
      documentId: Data.DocumentID
      contentType: UID.ContentType
      sourceLocale: string
    }
  }

  export type Response =
    | { data: number }
    | {
        data: null
        error: errors.ApplicationError
      }
}

/**
 * POST /translate/usage/estimate-collection - Get a report of the amount of characters that will be translated for a whole collection
 */
export declare namespace UsageEstimateCollection {
  export interface Request {
    query: {}
    body: {
      contentType: UID.ContentType
      sourceLocale: string
      targetLocale: string
    }
  }

  export type Response =
    | { data: number }
    | {
        data: null
        error: errors.ApplicationError
      }
}
