import { Schema } from '@strapi/strapi'

export type TranslateProviderOptions = Record<string, any>

export interface TranslateProviderTranslationArguments {
  readonly text:
    | string
    | string[]
    | Schema.Attribute.BlocksValue
    | Schema.Attribute.BlocksValue[]
  readonly priority?: number
  readonly format?: 'plain' | 'markdown' | 'html' | 'jsonb'
  readonly sourceLocale: string
  readonly targetLocale: string
}

export type TranslateProviderTranslationResult =
  | string
  | string[]
  | Schema.Attribute.BlocksValue
  | Schema.Attribute.BlocksValue[]

export interface TranslateProviderUsageResult {
  readonly count: number
  readonly limit: number
}

export interface InitializedProvider {
  translate: (
    args: TranslateProviderTranslationArguments
  ) => Promise<TranslateProviderTranslationResult>
  usage?: () => Promise<TranslateProviderUsageResult>
}

export interface TranslateProvider<O = TranslateProviderOptions> {
  provider: string
  name: string
  init(providerOptions: O): InitializedProvider
}
