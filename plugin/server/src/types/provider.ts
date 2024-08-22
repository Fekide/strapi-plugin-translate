export type TranslateProviderOptions = Record<string, any>

export interface TranslateProviderTranslationArguments {
  readonly text: string | string[],
  readonly priority?: number,
  readonly format?: 'plain' | 'markdown' | 'html',
  readonly sourceLocale: string,
  readonly targetLocale: string,
}

export type TranslateProviderTranslationResult = string | string[]

export interface TranslateProviderUsageResult {
  readonly count: number,
  readonly limit: number,
}

export interface InitializedProvider {
  translate: (args: TranslateProviderTranslationArguments) => Promise<TranslateProviderTranslationResult>
  usage: () => Promise<TranslateProviderUsageResult>
}

export interface TranslateProvider<O = TranslateProviderOptions> {
  provider: string,
  name: string,
  init(providerOptions: O): any
}
