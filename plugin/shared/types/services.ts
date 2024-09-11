import { Core } from '@strapi/strapi'
import { ChunksService } from 'src/services/chunks'
import { FormatService } from 'src/services/format'
import { ProviderService } from 'src/services/provider'
import { TranslateService } from 'src/services/translate'
import { UntranslatedService } from 'src/services/untranslated'

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
