'use strict'
const Bottleneck = require('bottleneck/es5')

const { LT_PRIORITY_DEFAULT } = require('./constants')
const { Client } = require('./client')
const { getService } = require('./get-service')

/**
 * Module dependencies
 */
module.exports = {
  provider: 'libretranslate',
  name: 'LibreTranslate',

  init(providerOptions = {}) {
    const apiKey = process.env.LT_API_KEY || providerOptions.apiKey
    const apiUrl = process.env.LT_API_URL || providerOptions.apiUrl
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

    const rateLimitedTranslate = limiter.wrap(client.translateText.bind(client))

    const maxTexts =
      Number(process.env.LT_API_MAX_TEXTS) || providerOptions.apiMaxTexts || -1

    return {
      /**
       * @param {{
       *  text:string|string[],
       *  sourceLocale: string,
       *  targetLocale: string,
       *  priority: number,
       *  format?: 'plain'|'markdown'|'html'
       * }} options all translate options
       * @returns {string[]} the input text(s) translated
       */
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

        let textArray = Array.isArray(text) ? text : [text]

        if (format === 'markdown') {
          textArray = formatService.markdownToHtml(textArray)
        }

        const { chunks, reduceFunction } = chunksService.split(textArray, {
          maxLength: maxTexts === -1 ? Number.MAX_VALUE : maxTexts,
          maxByteSize: maxCharacters === -1 ? Number.MAX_VALUE : maxCharacters,
        })

        if (format === 'markdown') {
          textArray = formatService.markdownToHtml(textArray)
        }

        client.translateText(
          text,
          source,
          target,
          format === 'html' ? format : 'text'
        )

        const result = reduceFunction(
          await Promise.all(
            chunks.map(async (texts) => {
              console.log(texts, source, target)
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
                ['html', 'markdown'].includes(format) ? 'html' : 'text'
              )
              return result
            })
          )
        )

        if (format === 'markdown') {
          return formatService.htmlToMarkdown(result)
        }

        return result
      },
      async usage() {
        // afaik LibreTranslate has no concept of usage, apart from rate limiting
        return undefined
      },
    }
  },
}
