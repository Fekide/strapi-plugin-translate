'use strict'

const axios = require('axios')

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

class Client {
  constructor(url, apiKey = undefined) {
    this.baseURL = url
    this.apiKey = apiKey

    this.localeInformation = defaultLocales.map((code) => ({
      code,
      targets: defaultLocales.filter((locale) => locale !== code),
    }))

    try {
      this.getLocaleInformation().then((data) => {
        if (Array.isArray(data) && data.length) this.localeInformation = data
      })
    } catch (error) {
      console.error('Failed to fetch locale Information: ', error)
    }
  }

  async getLocaleInformation() {
    const url = `${this.baseURL}/languages`
    try {
      const response = await axios.get(url)
      if (!response?.data) throw new Error(`Request to ${url} failed`)
      return response.data
    } catch (error) {
      if (error.response) {
        // Server responded with non 2XX Status
        throw new Error(
          `Request to ${url} failed with ${error.response.status}`
        )
      } else if (error.request) {
        throw new Error(`Did not receive response from ${url}`)
      } else {
        throw new Error(`Failed to make request to ${url}`)
      }
    }
  }

  parseLocales(source, target) {
    function lowerLanguageCode(locale) {
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

  async translateText(text, source, target, format = 'text') {
    const url = `${this.baseURL}/translate`
    try {
      const response = await axios.post(url, {
        q: text,
        source,
        target,
        format,
        api_key: this.apiKey,
      })
      if (!response?.data?.translatedText)
        throw new Error(`Request to ${url} failed`)
      return response.data.translatedText
    } catch (error) {
      if (error.response) {
        // Server responded with non 2XX Status
        throw new Error(
          `Request to ${url} failed with ${error.response.status}`
        )
      } else if (error.request) {
        throw new Error(`Did not receive response from ${url}`)
      } else {
        throw new Error(`Failed to make request to ${url}`)
      }
    }
  }
}

module.exports = { Client }
