## DeepL provider for Strapi Translate Plugin

Configure the provider through the pluginOptions:

```js
module.exports = {
  // ...
  deepl: {
    enabled: true,
    config: {
      // Choose one of the available providers
      provider: 'deepl',
      // Pass credentials and other options to the provider
      providerOptions: {
        // your API key - required and wil cause errors if not provided
        apiKey: 'key',
        // use custom api url - optional
        apiUrl: 'https://api-free.deepl.com',
      },
      // ...
    },
  },
  // ...
}
```

or use the default environment variables:

- `DEEPL_API_KEY` - default `undefined`
- `DEEPL_API_URL` - default `undefined`

To get an API key, register for free at [www.deepl.com/pro#developer](https://www.deepl.com/pro#developer).
