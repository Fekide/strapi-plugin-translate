# LibreTranslate provider for Strapi Translate Plugin

Configure the provider through the providerOptions:

```js
module.exports = {
  // ...
  translate: {
    enabled: true,
    config: {
      // Choose one of the available providers
      provider: 'libretranslate',
      // Pass credentials and other options to the provider
      providerOptions: {
        // your API key - required and wil cause errors if not provided
        apiKey: 'key',
        // api url - required 
        apiUrl: 'https://your.libretranslate.instance',
        // maximum number of requests per minute - optional, default is `undefined` => no limit
        apiMaxRPM: 60,
        // maximum number of chars per request - optional, default is `undefined` => no limit
        apiMaxChars: 1234,
        // maximum number of texts per request
        apiMaxTexts: 55,
        // manually overwrite the Strapi Locale to LibreTranslate Locale mapping.
        // default is the string before the `-` character for every locale
        localeMap:{
          'en-US' : 'de',
        }
      },
      // other options ...
    },
  },
  // ...
}
```

or use the default environment variables:

- `LT_API_KEY` - default `undefined`
- `LT_API_URL` - default `undefined`
- `LT_API_MAX_RPM` - default `undefined`
- `LT_API_MAX_CHARS` - default `undefined`
- `LT_API_MAX_TEXTS` - default `undefined`

Note that environment variables take precedence over values `providerOptions`. To force no limit on requests per second or maximum characters, set them to -1

## Limitations:

- Only the [languages supported by argos](https://github.com/argosopentech/argos-translate#supported-languages), the actual translation library behind LibreTranslate, can be translated.
- LibreTranslate servers can impose additional restrictions, such as limits to request frequency or size. You can configure those via the pluginOptions, by default there are no limitations, because [LibreTranslate has no limitations by default](https://github.com/LibreTranslate/LibreTranslate#arguments)
