import axios, { AxiosResponse } from 'axios'

const defaultLocales = [
  'en',
  'ar',
  'az',
  'ca',
  'zh',
  'cs',
  'da',
  'nl',
  'eo',
  'fi',
  'fr',
  'de',
  'el',
  'he',
  'hi',
  'hu',
  'id',
  'ga',
  'it',
  'ja',
  'ko',
  'fa',
  'pl',
  'pt',
  'ru',
  'sk',
  'es',
  'sv',
  'tr',
  'uk',
]

export type LanguagesResponse = {
  code: string
  name: string
  targets: string[]
}

export interface TranslateRequest {
  q: string | string[]
  source: string
  target: string
  format?: 'html' | 'text'
  alternatives?: number
  api_key?: string
}

export type TranslateResponse =
  | {
      translatedText: string | string[]
    }
  | { error: string }

export class Client {
  baseURL: string
  apiKey: undefined | string
  localeInformation: { code: string; targets: string[] }[]
  constructor(url: string, apiKey?: string) {
    this.baseURL = url
    this.apiKey = apiKey

    this.localeInformation = defaultLocales.map((code) => ({
      code,
      targets: defaultLocales.filter((locale) => locale !== code),
    }))

    this.getLocaleInformation().then(
      (data) => {
        if (Array.isArray(data) && data.length) this.localeInformation = data
      },
      (error) => console.warn('Failed to fetch locale Information: ', error)
    )
  }

  async getLocaleInformation() {
    const url = `${this.baseURL}/languages`
    try {
      const response = await axios.get<LanguagesResponse>(url)
      if (!response?.data) throw new Error(`Request to ${url} failed`)
      return response.data
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        if (error.response) {
          // Server responded with non 2XX Status
          throw new Error(
            `Request to ${url} failed with ${error.response.status}`
          )
        } else if (error.request) {
          throw new Error(`Did not receive response from ${url}`)
        }
      }
      throw new Error(`Failed to make request to ${url}`)
    }
  }

  parseLocales(source: string, target: string) {
    function lowerLanguageCode(locale: string) {
      const upperCase = locale.toLowerCase()
      const [stripped] = upperCase.split('-')

      return stripped
    }

    let strippedSource = lowerLanguageCode(source)
    let strippedTarget = lowerLanguageCode(target)

    if (!this.localeInformation || !this.localeInformation.length) {
      console.warn(
        'Failed to retrieve supported languages from LibreTranslate Server, proceeding anyway'
      )
      return { source: strippedSource, target: strippedTarget }
    }

    const sourceLocale = this.localeInformation.find(
      ({ code }) => code === strippedSource
    )

    if (!sourceLocale)
      throw new Error(
        `Source locale ${strippedSource} is not supported by ${this.baseURL}`
      )

    if (!sourceLocale.targets?.includes(strippedTarget))
      throw new Error(
        `Target locale ${strippedTarget} from Source Locale ${strippedSource} is not supported by ${this.baseURL}`
      )

    return { source: strippedSource, target: strippedTarget }
  }

  async translateText(
    text: string | string[],
    source: string,
    target: string,
    format: 'html' | 'text' = 'text'
  ): Promise<string | string[]> {
    const url = `${this.baseURL}/translate`
    try {
      const response = await axios.post<
        TranslateResponse,
        AxiosResponse<TranslateResponse>,
        TranslateRequest
      >(url, {
        q: text,
        source,
        target,
        format,
        api_key: this.apiKey,
      })
      const data = response?.data
      if ('error' in data || !data.translatedText) {
        throw new Error(`Request to ${url} failed`)
      }
      return data.translatedText
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        if (error.response) {
          // Server responded with non 2XX Status
          throw new Error(
            `Request to ${url} failed with ${error.response.status}`
          )
        } else if (error.request) {
          throw new Error(`Did not receive response from ${url}`)
        }
      }
      throw new Error(`Failed to make request to ${url}`)
    }
  }
}
