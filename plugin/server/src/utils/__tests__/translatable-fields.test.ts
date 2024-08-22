import { describe, expect, it, afterEach, beforeEach } from '@jest/globals'
import {
  getAllTranslatableFields,
  getTranslateFields,
} from '../translatable-fields'

import {
  simpleComponent,
  nestedComponent,
  twoFieldComponent,
  createSimpleComponent,
} from '../../__mocks__/components'
import {
  complexContentType,
  simpleContentType,
} from '../../__mocks__/contentTypes'
import setup from '../../__mocks__/initSetup'
import { Schema, Utils } from '@strapi/strapi'

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('translatable fields', () => {
  describe('get translate fields', () => {
    beforeEach(() =>
      setup({
        components: {
          'simple.component': simpleComponent,
          'twofield.component': twoFieldComponent,
          'nested.component': nestedComponent,
          'simple.componentcopy': createSimpleComponent('copy'),
          'simple.componentdelete': createSimpleComponent('delete'),
          'simple.componentunset': createSimpleComponent(null),
        },
      })
    )

    it('text field translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        field: 'some text',
      }
      const schema: Schema.Attribute.Text = {
        type: 'text',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'field'
      strapi.config.set('plugin::translate.translatedFieldTypes', ['text'])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toEqual({ field: attr, format: 'plain' })
    })

    it('text field without configuration translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        field: 'some text',
      }
      const schema: Schema.Attribute.Text = {
        type: 'text',
        pluginOptions: { i18n: { localized: true } },
      }
      const attr = 'field'
      strapi.config.set('plugin::translate.translatedFieldTypes', ['text'])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toEqual({ field: attr, format: 'plain' })
    })

    it('text field copy not translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        field: 'some text',
      }
      const schema: Schema.Attribute.Text = {
        type: 'text',
        pluginOptions: { translate: { translate: 'copy' } },
      }
      const attr = 'field'
      strapi.config.set('plugin::translate.translatedFieldTypes', ['text'])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toBeNull()
    })

    it('text field delete not translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        field: 'some text',
      }
      const schema: Schema.Attribute.Text = {
        type: 'text',
        pluginOptions: { translate: { translate: 'delete' } },
      }
      const attr = 'field'
      strapi.config.set('plugin::translate.translatedFieldTypes', ['text'])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toBeNull()
    })

    it('other field not translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        field: 'some text',
      }
      const schema: Schema.Attribute.AnyAttribute = { type: 'boolean' }
      const attr = 'field'
      strapi.config.set('plugin::translate.translatedFieldTypes', ['text'])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toBeNull()
    })

    it('component field translated nested', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        child_component: { text: 'some text' },
      }
      const schema: Schema.Attribute.Component = {
        type: 'component',
        component: 'simple.component',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'child_component'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        'text',
        'component',
      ])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toEqual([
        { field: 'child_component.text', format: 'markdown' },
      ])
    })

    it('component field without configuration translated nested', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        child_component: { text: 'some text' },
      }
      const schema: Schema.Attribute.Component = {
        type: 'component',
        component: 'simple.component',
        pluginOptions: { i18n: { localized: true } },
      }
      const attr = 'child_component'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        'text',
        'component',
      ])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toEqual([
        { field: 'child_component.text', format: 'markdown' },
      ])
    })

    it('component field with field without configuration translated nested', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        child_component: { text: 'some text' },
      }
      const schema: Schema.Attribute.Component = {
        type: 'component',
        component: 'simple.componentunset',
        pluginOptions: { i18n: { localized: true } },
      }
      const attr = 'child_component'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        'text',
        'component',
      ])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toEqual([
        { field: 'child_component.text', format: 'markdown' },
      ])
    })

    it('component with copy field not translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        child_component: { text: 'some text' },
      }
      const schema: Schema.Attribute.Component = {
        type: 'component',
        component: 'simple.componentcopy',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'child_component'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        'text',
        'component',
      ])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toEqual([])
    })

    it('component with delete field not translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        child_component: { text: 'some text' },
      }
      const schema: Schema.Attribute.Component = {
        type: 'component',
        component: 'simple.componentdelete',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'child_component'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        'text',
        'component',
      ])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toEqual([])
    })

    it('repeated component field translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        child_component: [{ text: 'some text' }, { text: 'some other text' }],
      }
      const schema: Schema.Attribute.Component<
        'simple.component',
        Utils.Constants.True
      > = {
        type: 'component',
        component: 'simple.component',
        repeatable: true,
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'child_component'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        'text',
        'component',
      ])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toEqual([
        { field: 'child_component.0.text', format: 'markdown' },
        { field: 'child_component.1.text', format: 'markdown' },
      ])
    })

    it('nested component field translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        comp: {
          text: 'some text',
          nested: {
            text: 'next level',
            nested: {
              text: 'last level',
              nested: null,
            },
          },
        },
      }
      const schema: Schema.Attribute.Component = {
        type: 'component',
        component: 'nested.component',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'comp'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        'text',
        'component',
      ])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toEqual([
        { field: 'comp.text', format: 'plain' },
        { field: 'comp.nested.text', format: 'plain' },
        { field: 'comp.nested.nested.text', format: 'plain' },
      ])
    })

    it('dynamic zone field translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        dynamic_zone: [
          { __component: 'simple.component', text: 'some text' },
          {
            __component: 'twofield.component',
            title: 'some other text',
            number: 5,
          },
          { __component: 'simple.component', text: 'some simple text' },
        ],
      }
      const schema: Schema.Attribute.DynamicZone = {
        type: 'dynamiczone',
        components: ['simple.component', 'twofield.component'],
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'dynamic_zone'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        'text',
        'dynamiczone',
        'component',
      ])

      // when
      const translatedField = await getTranslateFields(data, schema, attr)

      // then
      expect(translatedField).toEqual([
        { field: 'dynamic_zone.0.text', format: 'markdown' },
        { field: 'dynamic_zone.1.title', format: 'plain' },
        { field: 'dynamic_zone.2.text', format: 'markdown' },
      ])
    })
  })

  describe('get all translatable fields', () => {
    beforeEach(() =>
      setup({
        components: {
          simpleComponent,
          twoFieldComponent,
        },
      })
    )

    it('simple content type translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        title: 'some title',
      }
      const schema = simpleContentType

      // when
      const translatedField = await getAllTranslatableFields(data, schema)

      // then
      expect(translatedField).toEqual([{ field: 'title', format: 'plain' }])
    })

    it('complex content type translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        title: 'some title',
        content: 'some long content',
        slug: 'some-title',
        not_translated_field: 'not translated',
        enumeration: 'option_a',
        dynamic_zone: [
          { __component: 'simple.component', text: 'some text' },
          {
            __component: 'twofield.component',
            title: 'some other text',
            number: 5,
          },
        ],
        child_component: {
          text: 'some more text',
        },
        repeated_child_component: [
          {
            title: 'some other text',
            number: 5,
          },
          {
            title: 'the last text',
            number: 3,
          },
        ],
      }
      const schema = complexContentType

      // when
      const translatedField = await getAllTranslatableFields(data, schema)

      // then
      expect(translatedField).toEqual([
        { field: 'title', format: 'plain' },
        { field: 'content', format: 'markdown' },
        { field: 'dynamic_zone.0.text', format: 'markdown' },
        { field: 'dynamic_zone.1.title', format: 'plain' },
        { field: 'child_component.text', format: 'markdown' },
        { field: 'repeated_child_component.0.title', format: 'plain' },
        { field: 'repeated_child_component.1.title', format: 'plain' },
      ])
    })
  })
})
