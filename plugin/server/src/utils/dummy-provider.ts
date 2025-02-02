import { TranslateProvider } from '../../../shared/types/provider'

const dummyProvider: TranslateProvider = {
  provider: 'dummy',
  name: 'Dummy',

  init() {
    return {
      async translate({ text, sourceLocale, targetLocale }) {
        if (!text) {
          return []
        }
        if (!sourceLocale || !targetLocale) {
          throw new Error('source and target locale must be defined')
        }

        const textArray = Array.isArray(text) ? text : [text]
        return textArray
      },
      async usage() {
        return {
          count: 1000,
          limit: 10000,
        }
      },
    }
  },
}

export default dummyProvider
