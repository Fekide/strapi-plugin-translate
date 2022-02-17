'use strict';

const {URLSearchParams} = require('url');
const axios = require('axios');

async function deeplTranslate({text, free_api, ...parameters}) {
  const sub_domain = free_api ? 'api-free' : 'api';
  const params = new URLSearchParams(parameters)
  if (Array.isArray(text)) {
    text.forEach(t => params.append("text", t));
  } else {
    params.append("text", text)
  }
  return (await axios.post(
    `https://${sub_domain}.deepl.com/v2/translate`,
    params.toString()
  )).data;
  // return {
  //   translations: text.map(t => ({
  //     text: `Translated (${parameters.target_lang}): ${t}`,
  //     detected_source_language: "EN"
  //   }))
  // }
}

module.exports = ({ strapi }) => ({
  async translate({data, sourceLocale, targetLocale}) {
    const {apiKey, freeApi} = strapi.config.get('plugin.deepl')

    if (!targetLocale || !sourceLocale) {
      throw new Error("source and target locale are required")
    }

    const objectEntriesArray = Object.entries(data)
    const indexesOfTextAttributes = new Map()
    const filteredText = objectEntriesArray.filter(([_key, value]) => typeof(value) == "string")

    filteredText.forEach(([key, _value], index) => {
      indexesOfTextAttributes.set(key, index)
    })

    const translateResult = await deeplTranslate({
      text: filteredText.map(([_key, value]) => value),
      auth_key: apiKey,
      free_api: freeApi,
      target_lang: targetLocale.toUpperCase(),
      source_lang: sourceLocale.toUpperCase()
    })

    const translatedData = {...data}
    objectEntriesArray.forEach(([key, _value]) => {
      if (indexesOfTextAttributes.has(key)) {
        translatedData[key] = translateResult.translations[indexesOfTextAttributes.get(key)]?.text
      }
    })

    return translatedData;
  },
});
