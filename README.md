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

### Overall plugin configuration

> The overall plugin configurtion is done through `config[/env]/plugins.js` or environment variables

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

### Configure translation of individual fields/attributes

There are two options to configure translation of individual fields. Both are configured either in the Content-Type Builder in the admin interface in development mode, or in the `pluginOptions` property in the schema file.

#### Disable localization completely

This is part of the `i18n`-plugin and available in all field types except `relation`, `uid` under the name `Enable localization for this field`.

Set this value to false, and the field will not be translated. However it will be copied and have the same value for all localizations.

#### Configure behavior of automated translation

For the field types `component`, `dynamiczone`, `media`, `relation`, `richtext`, `string`, `text`, you can additionally configure the behavior when translating automatically under the name `Configure automated translation for this field?`. There are three options:

- `translate`: The field in automatically translated using DeepL
- `copy`: The original value of the source localization is copied
- `delete`: The field is let empty after translation

> Relations are again little bit different. The `translate` option works as described [below](#schema-for-translating-relations), the `copy` option only works when the related content type is not localized and is one way or if bothWays is either `manyToOne` or `manyToMany`

> If you have other fields (e.g. custom fields) for which you want to configure the translation, this cannot be done through the Content-Type Builder, but only in the schema file:

```json
{
  //...
  "attributes": {
    //...
    "customField": {
      "type": "customField",
      "pluginOptions": {
        "deepl": {
          "translate": "copy"
        },
        "i18n": {
          "localized": true
        }
      }
    }
    //...
  }
  //...
}
```

## Features

This plugin allows you to automatically translate content types. This can be done either on a single entity, or for all entities of a content type.

The following features are included:

- Fill in and translate any locale from another already defined locale
- Translation is restricted by permissions to avoid misuse of api quota
- Configure which field types are translated in the [plugin configuration](#configuration)
- Fields that are marked as not localized in the content-type settings will not be translated
- Components and Dynamic zones are translated recursively
- Relations are translated (if enabled in the [configuration](#configuration)) [if possible](#schema-for-translating-relations)

### Translate a single entity

- Open the entity that you want to translate
- Select a different (possibly unconfigured) locale in the `Internationalization` section on the right sidebar
- Click the link for `Translate from another locale` in the `DeepL` section on the right sidebar
- Select the desired source to translate from
- Press the confirmation button

### Translate all entities of a content type

![Batch translation showcase](assets/batch-translation.gif)

- Open the DeepL plugin section in the left menu
- You now see an overview of all localized content types
- For each language and each content type you have 4 actions: `translate`, `cancel`, `pause` and `resume`. Most actions are disabled, since no job is running.
- Press the `translate` button, select the source locale and if already published entries should be published as well (Auto-Publish option)
- Start the translation.

Additional remarks:

- If a batch translation is running and the server is stopped, the translation will be resumed on a restart
- If entities are added after the starting the translation, they will not be translated
- UIDs are automatically translated in batch translation mode, since otherwise the entities could not be created/published
- If an error occurs, this will be shown in the logs or the message can be accessed by hovering over the `Job failed` badge

### Schema for translating relations

_The related objects are not translated directly, only the relation itself is translated_

#### the related content type **is localized**

- if a localization of the relation with the targetLocale exists -> it is used
- else the relation is removed

#### the related content type **is not localized**

- the relation goes both ways and would be removed from another object or localization if it was used (the case with oneToOne or oneToMany) -> it is removed
- otherwise the relation is kept

## (Current) Limitations:

- Only the [deepl supported languages](https://www.deepl.com/docs-api/translating-text/request/) can be translated
- The translation of Markdown using DeepL works relatively well but is not perfect. Watch out especially if you have links in Markdown that could be changed by translation
- HTML in `richtext` created using a different WYSIWYG editor is not supported
- **Only super admins can translate**. This is currently the case, since permissions were added to the `translate` endpoint. Probably you can change the permissions with an enterprise subscription but I am not sure. If you know how to do that also in the community edition please tell me or open a merge request!
- Relations that do not have a translation of the desired locale will not be translated. To keep the relation you will need to translate both in succession (Behaviour for multi-relations has not yet been analyzed)
- The API-Limits of DeepL ([size](https://www.deepl.com/de/docs-api/accessing-the-api/limits/) and [number of fields](https://www.deepl.com/de/docs-api/translating-text/request/)) should not be an issue, however if you have a very large entity you might be sending too many requests. Also if one field is larger than the reqest size limit, the content needs to be split and merged at some character, which may break the content layout!

## Legal Disclaimer

Feki.de e.V. do not hold the copyright to the Logos of Strapi Inc. or DeepL SE. There is no cooperation or any other sort of affiliation between Feki.de e.V. and Strapi Inc. or DeepL SE. The Logos are used under fair use in order to not confuse Users as to what this plugin does.
