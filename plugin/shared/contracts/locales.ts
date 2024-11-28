import { errors } from '@strapi/utils'
import { Locale } from '@shared/types/locale'

/**
 * GET /i18n/locales - Get all the locales
 */
export declare namespace GetLocales {
  export interface Request {
    query: {}
    body: {}
  }

  /**
   * TODO: this should follow the usual `data/error` pattern.
   */
  export type Response =
    | Locale[]
    | {
        data: null
        error: errors.ApplicationError
      }
}
