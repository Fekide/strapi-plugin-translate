import Bottleneck from 'bottleneck'

import { LT_PRIORITY_DEFAULT } from './constants'
import { Client } from './client'
import { getService } from './get-service'
import { TranslateProvider } from 'strapi-plugin-translate/shared'

/**
 * Module dependencies
 */
export default {
  provider: 'libretranslate',
  name: 'LibreTranslate',

  init(providerOptions = {}) {
    const apiKey = process.env.LT_API_KEY || providerOptions.apiKey
    const apiUrl = process.env.LT_API_URL || providerOptions.apiUrl

    if (!apiUrl)
      throw new Error('You must provide a URL to the LibreTranslate API')

    const localeMap =
      typeof providerOptions.localeMap === 'object'
        ? providerOptions.localeMap
        : {}

    const client = new Client(apiUrl, apiKey)

    const maxCharacters =
      Number(process.env.LT_API_MAX_CHARS) || providerOptions.apiMaxChars || -1

    const maxRequestsPerMinute =
      Number(process.env.LT_API_MAX_RPM) || providerOptions.apiMaxRPM || -1
    let minTime = 0
    if (process.env.NODE_ENV === 'test') minTime = 10
    if (maxRequestsPerMinute !== -1)
      minTime = 1000 / (maxRequestsPerMinute / 60)

    const limiter = new Bottleneck({
      minTime,
      maxConcurrent: 1,
    })

    type translateText = typeof client.translateText

    const rateLimitedTranslate = limiter.wrap<
      string | string[],
      Parameters<translateText>[0],
      Parameters<translateText>[1],
      Parameters<translateText>[2],
      Parameters<translateText>[3]
    >(client.translateText.bind(client))

    const maxTexts =
      Number(process.env.LT_API_MAX_TEXTS) || providerOptions.apiMaxTexts || -1

    return {
      async translate({ text, priority, sourceLocale, targetLocale, format }) {
        if (!text) {
          return []
        }
        if (!sourceLocale || !targetLocale) {
          throw new Error('source and target locale must be defined')
        }

        const { source, target } = client.parseLocales(
          localeMap[sourceLocale] ?? sourceLocale,
          localeMap[targetLocale] ?? targetLocale
        )

        const chunksService = getService('chunks')
        const formatService = getService('format')

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
          maxLength: maxTexts === -1 ? Number.MAX_VALUE : maxTexts,
          maxByteSize: maxCharacters === -1 ? Number.MAX_VALUE : maxCharacters,
        })

        const result = reduceFunction(
          await Promise.all(
            chunks.map(async (texts) => {
              const result = await rateLimitedTranslate.withOptions(
                {
                  priority:
                    typeof priority === 'number'
                      ? priority
                      : LT_PRIORITY_DEFAULT,
                },
                texts,
                source,
                target,
                ['html', 'markdown', 'jsonb'].includes(format || '')
                  ? 'html'
                  : 'text'
              )
              return Array.isArray(result) ? result : [result]
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
    }
  },
} satisfies TranslateProvider
