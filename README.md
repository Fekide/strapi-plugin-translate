<p align="center">
  <img src="assets/logo.svg" alt="Meilisearch-Strapi" width="300" height="150" />
</p>

<div align="center">
  <h1>Strapi v4 - DeepL plugin</h1>
  <p>Integration with the <a href="https://www.deepl.com/pro-api">DeepL-API</a> to provide quick automated translation of content fields.</p>
  <a href="https://www.npmjs.org/package/strapi-plugin-deepl">
    <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/Fekide/strapi-plugin-deepl?label=npm&logo=npm">
  </a>
  <a href="https://www.npmjs.org/package/strapi-plugin-deepl">
    <img src="https://img.shields.io/npm/dm/strapi-plugin-deepl.svg" alt="Monthly download on NPM" />
  </a>
  <a href="https://github.com/Fekide/strapi-plugin-deepl/actions">
    <img src="https://img.shields.io/github/workflow/status/Fekide/strapi-plugin-deepl/Test" alt="Build" />
  </a>
</div>

> This plugin is still a work in progress

![plugin showcase](assets/showcase.gif)

## Requirements

This plugin requires the following, in order to work correctly:
- Strapi v4 (this plugin is not compatible with v3)
- The plugin **i18n** installed and enabled (`@strapi/plugin-i18n` [[npm](https://www.npmjs.com/package/@strapi/plugin-i18n)])
- The content type to have internationalization enabled (advanced settings in the content type builder)
- In the internationalization settings at least **two** locales
- In the config an apiKey defined (see [Configuration](#configuration))

Unless you have the previous set up, the field on the right where you can translate will not show up. Also it will not show up when editing the currently only available translation of an entry.

## Installation
```bash
# with npm
$ npm install strapi-plugin-deepl
# or with yarn
$ yarn add strapi-plugin-deepl
```

After successful installation you have to build a fresh package that includes plugin UI:

```bash
# with npm
$ npm run build && npm run develop
# or with yarn
$ yarn build && yarn develop
```

## Configuration

> Configuration is currently only possible using the plugin config file `config[/env]/plugins.js` or environment variables

```js
module.exports = {
  // ...
  deepl: {
    enabled: true,
    config: {
      // your DeepL API key
      apiKey: 'key',
      // whether to use the free or paid api, default true
      freeApi: true,
      // Which field types are translated (default string, text, richtext, components and dynamiczones)
      translatedFieldTypes: [
        'string',
        'text',
        'richtext',
        'component',
        'dynamiczone',
      ],
      // If relations should be translated (default true)
      translateRelations: true,
      // You can define a custom glossary to be used here (see https://www.deepl.com/docs-api/managing-glossaries/)
      glossaryId: 'customGlossary',
    },
  },
  // ...
}
```

or using the default environment variables:

- `DEEPL_API_KEY` - default `null`
- `DEEPL_API_FREE` - default `true`

To get an API key, register for free at [www.deepl.com/pro#developer](https://www.deepl.com/pro#developer).

## Features

- fill in and translate any locale from another already defined locale
- Configure which field types are translated
  - standard text fields and nested components by default
  - **uid fields are not translated** by default because they might not result in the same translation as the attached field\
    -> saving is prevented in the conent manager anyway until you change the slug again
- Fields that are marked as not translated in the content-type settings will not be translated
- Translation of relations by the followig schema:\
  (_The related objects are not translated directly, only the relation itself is translated_)
  - the related content type **is localized**:
    - if a localization of the relation with the targetLocale exists\
      -> it is used
    - else the relation is removed
  - the related content type **is not localized**:
    - the relation goes both ways and would be removed from another object or localization if it was used (the case with oneToOne or oneToMany)\
      -> it is removed
    - otherwise the relation is kept

## (Current) Limitations:

- Only the [deepl supported languages](https://www.deepl.com/docs-api/translating-text/request/) can be translated
- The translation of Markdown using DeepL works relatively well but is not perfect. Watch out especially if you have links in Markdown that could be changed by translation
- HTML in `richtext` created using a different WYSIWYG editor is not supported
- **Only super admins can translate**. This is currently the case, since permissions were added to the `translate` endpoint. Probably you can change the permissions with an enterprise subscription but I am not sure. If you know how to do that also in the community edition please tell me or open a merge request!
- Relations that do not have a translation of the desired locale will not be translated. To keep the relation you will need to translate both in succession (Behaviour for multi-relations has not yet been analyzed)

## Legal Disclaimer

Feki.de e.V. do not hold the copyright to the Logos of Strapi Inc. or DeepL SE. There is no cooperation or any other sort of affiliation between Feki.de e.V. and Strapi Inc. or DeepL SE. The Logos are used under fair use in order to not confuse Users as to what this plugin does.
