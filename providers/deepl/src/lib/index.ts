import { SourceLanguageCode, TargetLanguageCode, Translator } from 'deepl-node'
import Bottleneck from 'bottleneck'
import { TranslateProvider } from 'strapi-plugin-translate/shared'

import {
  DEEPL_PRIORITY_DEFAULT,
  DEEPL_API_MAX_TEXTS,
  DEEPL_API_ROUGH_MAX_REQUEST_SIZE,
  DEEPL_APP_INFO,
} from './constants'
import { parseLocale } from './parse-locale'
import { getService } from './get-service'

export type DeepLProviderOptions = {
  apiKey?: string
  apiUrl?: string
  localeMap?: Record<string, string>
  apiOptions?: Record<string, string>
}

export default {
  provider: 'deepl',
  name: 'DeepL',

  init(providerOptions = {}) {
    const apiKey = process.env.DEEPL_API_KEY || providerOptions.apiKey
    const apiUrl = process.env.DEEPL_API_URL || providerOptions.apiUrl
    const localeMap =
      typeof providerOptions.localeMap === 'object'
        ? providerOptions.localeMap
        : {}
    const apiOptions =
      typeof providerOptions.apiOptions === 'object'
        ? providerOptions.apiOptions
        : {}

    const client = new Translator(apiKey, {
      serverUrl: apiUrl,
      appInfo: DEEPL_APP_INFO,
    })

    const limiter = new Bottleneck({
      minTime: process.env.NODE_ENV == 'test' ? 10 : 200,
      maxConcurrent: 5,
    })

    type translateText = typeof client.translateText

    const rateLimitedTranslate = limiter.wrap<
      ReturnType<translateText>,
      Parameters<translateText>[0],
      Parameters<translateText>[1],
      Parameters<translateText>[2],
      Parameters<translateText>[3]
    >(client.translateText.bind(client))

    return {
      async translate({ text, priority, sourceLocale, targetLocale, format }) {
        if (!text) {
          return []
        }
        if (!sourceLocale || !targetLocale) {
          throw new Error('source and target locale must be defined')
        }

        const chunksService = getService('chunks')
        const formatService = getService('format')

        const tagHandling = format === 'plain' ? undefined : 'html'

        let input: string | string[]
        if (typeof text === 'string' || typeof text[0] === 'string') {
          input = text as string | string[]
        } else {
          if (format === 'jsonb') {
            input = await formatService.blockToHtml(
              text as Parameters<typeof formatService.blockToHtml>[0]
            )
          } else {
            throw new Error(
              `Unsupported format ${format} with non text/text-array input ${typeof text} `
            )
          }
        }
        if (format === 'markdown') {
          input = formatService.markdownToHtml(input)
        }

        const textArray = Array.isArray(input) ? input : [input]

        const { chunks, reduceFunction } = chunksService.split(textArray, {
          maxLength: DEEPL_API_MAX_TEXTS,
          maxByteSize: DEEPL_API_ROUGH_MAX_REQUEST_SIZE,
        })

        const result = reduceFunction(
          await Promise.all(
            chunks.map(async (texts) => {
              const result = await rateLimitedTranslate.withOptions(
                {
                  priority:
                    typeof priority == 'number'
                      ? priority
                      : DEEPL_PRIORITY_DEFAULT,
                },
                texts,
                parseLocale(
                  sourceLocale,
                  localeMap,
                  'source'
                ) as SourceLanguageCode,
                parseLocale(
                  targetLocale,
                  localeMap,
                  'target'
                ) as TargetLanguageCode,
                { ...apiOptions, tagHandling }
              )
              return Array.isArray(result)
                ? result.map((value) => value.text)
                : [result.text]
            })
          )
        )

        if (format === 'jsonb') {
          return formatService.htmlToBlock(result)
        }
        if (format === 'markdown') {
          return formatService.htmlToMarkdown(result)
        }

        return result
      },
      async usage() {
        return (await client.getUsage()).character
      },
    }
  },
} satisfies TranslateProvider<DeepLProviderOptions>
