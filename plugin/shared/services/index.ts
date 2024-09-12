import { Core } from '@strapi/strapi'
import { ChunksService } from './chunks'
import { FormatService } from './format'
import { ProviderService } from './provider'
import { TranslateService } from './translate'
import { UntranslatedService } from './untranslated'

export interface ServiceMap {
  'batch-translate-job': Core.CoreAPI.Service.CollectionType
  chunks: ChunksService
  format: FormatService
  provider: ProviderService
  translate: TranslateService
  untranslated: UntranslatedService
  'updated-entry': Core.CoreAPI.Service.CollectionType
}

export type TranslatePluginService<ServiceName extends keyof ServiceMap> =
  ServiceMap[ServiceName]
