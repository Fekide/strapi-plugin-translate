'use strict'

const deepl = require('deepl-node')
const Bottleneck = require('bottleneck/es5')

const {
  DEEPL_PRIORITY_DEFAULT,
  DEEPL_API_MAX_TEXTS,
  DEEPL_API_ROUGH_MAX_REQUEST_SIZE,
} = require('./constants')
const { parseLocale } = require('./parse-locale')
const { getService } = require('./get-service')

/**
 * Module dependencies
 */

module.exports = {
  provider: 'deepl',
  name: 'DeepL',

  init(providerOptions = {}) {
    const client = new deepl.Translator(providerOptions.apiKey, {
      // By default this is inferred, serverUrl on providerOptions is probably undefined
      serverUrl: providerOptions.serverUrl,
    })

    const limiter = new Bottleneck({
      minTime: process.env.NODE_ENV == 'test' ? 10 : 200,
      maxConcurrent: 5,
    })

    const rateLimitedTranslate = limiter.wrap(client.translateText.bind(client))

    return {
      async translate({ text, priority, sourceLocale, targetLocale }) {
        if (!text) {
          return []
        }
        if (!sourceLocale | !targetLocale) {
          throw new Error('source and target locale must be defined')
        }

        const textArray = Array.isArray(text) ? text : [text]

        const chunksService = getService('chunks')

        const { chunks, reduceFunction } = chunksService.split(textArray, {
          maxLength: DEEPL_API_MAX_TEXTS,
          maxByteSize: DEEPL_API_ROUGH_MAX_REQUEST_SIZE,
        })

        return reduceFunction(
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
                parseLocale(sourceLocale),
                parseLocale(targetLocale)
                // TODO: other options
              )
              return result.map((value) => value.text)
            })
          )
        )
      },
      async usage() {
        return (await client.getUsage()).character
      },
    }
  },
}
