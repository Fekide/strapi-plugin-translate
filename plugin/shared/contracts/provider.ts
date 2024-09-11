import { errors } from '@strapi/utils'
import { TranslateProviderUsageResult } from '../types/provider'

/**
 * GET /translate/usage - Get provider usage
 */
export declare namespace TranslateProviderUsage {
  export interface Request {
    query: {}
    body: {}
  }

  export type Response =
    | { data: TranslateProviderUsageResult }
    | {
        data: null
        error: errors.ApplicationError
      }
}
