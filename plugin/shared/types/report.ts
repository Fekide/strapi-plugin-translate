import { UID } from '@strapi/strapi'
import { Locale } from './locale'
import { BatchTranslateJob } from './batch-translate-job'

export interface SingleLocaleTranslationReport {
  /**
   * Count of entries for this locale
   */
  count: number
  /**
   * True if all entries are translated
   */
  complete: boolean
  job: BatchTranslateJob
}

export interface ContentTypeTranslationReport {
  /**
   * The content type UID
   */
  contentType: UID.ContentType
  /**
   * The display name of the content type
   */
  collection: string
  localeReports: Record<string, SingleLocaleTranslationReport>
}
export interface ReportData {
  contentTypes: ContentTypeTranslationReport[]
  locales: Locale[]
}

export interface TotalRows {
  rows: {
    locale: string
    count: string
  }[]
}

export interface TranslatedCountsRows {
  rows: {
    source: string
    target: string
    count: string
  }[]
}
