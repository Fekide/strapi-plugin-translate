import { describe, expect, it, afterEach, beforeEach } from '@jest/globals'
import _ from 'lodash'

import {
  simpleComponent,
  createNestedComponent,
  twoFieldComponent,
  createSimpleComponent,
} from '../../__mocks__/components'
import {
  complexContentType,
  simpleContentType,
  complexContentTypeDelete,
} from '../../__mocks__/contentTypes'
import { filterDeletedFields, filterAllDeletedFields } from '../delete-fields'
import setup from '../../__mocks__/initSetup'
import { Core, Schema, Utils } from '@strapi/strapi'

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('delete fields', () => {
  describe('single delete fields', () => {
    beforeEach(
      async () =>
        await setup({
          components: {
            'simple.component': simpleComponent,
            'twofield.component': twoFieldComponent,
            'nested.componentdelete': createNestedComponent('delete'),
            'simple.componentcopy': createSimpleComponent('copy'),
            'simple.componentdelete': createSimpleComponent('delete'),
          },
        })
    )

    it('translated field ignored', async () => {
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
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr)

      // then
      expect(newData).toEqual(data)
    })

    it('copied field ignored', async () => {
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
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr)

      // then
      expect(newData).toEqual(data)
    })

    it('deleted field is deleted', async () => {
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
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr)

      // then
      expect(newData).toEqual({
        documentId: 'a',
        id: 1,
      })
    })

    it('other field ignored', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        field: 'some text',
      }
      const schema: Schema.Attribute.AnyAttribute = { type: 'integer' }
      const attr = 'field'
      strapi.config.set('plugin::translate.translatedFieldTypes', ['text'])

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr)

      // then
      expect(newData).toEqual(data)
    })

    it('deleted component field is deleted', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        child_component: { text: 'some text' },
      }
      const schema: Schema.Attribute.Component = {
        type: 'component',
        component: 'simple.component',
        pluginOptions: { translate: { translate: 'delete' } },
      }
      const attr = 'child_component'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        'text',
        'component',
      ])

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr)

      // then
      expect(newData).toEqual({
        documentId: 'a',
        id: 1,
      })
    })

    it('component with translated field ignored', async () => {
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
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr)

      // then
      expect(newData).toEqual(data)
    })

    it('component with copied field ignored', async () => {
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
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr)

      // then
      expect(newData).toEqual(data)
    })

    it('component with deleted field has field deleted', async () => {
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
        { type: 'richtext', format: 'markdown' },
        'component',
      ])

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr)

      // then
      expect(newData).toEqual({
        documentId: 'a',
        id: 1,
        child_component: {},
      })
    })

    it('repeated component field with deleted field has fields deleted', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        child_component: [{ text: 'some text' }, { text: 'some other text' }],
      }
      const schema: Schema.Attribute.Component<
        'simple.componentdelete',
        Utils.Constants.True
      > = {
        type: 'component',
        component: 'simple.componentdelete',
        repeatable: true,
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'child_component'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        'text',
        { type: 'richtext', format: 'markdown' },
        'component',
      ])

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr)

      // then
      expect(newData).toEqual({
        documentId: 'a',
        id: 1,
        child_component: [{}, {}],
      })
    })

    it('nested component with deleted fields has fields deleted', async () => {
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
        component: 'nested.componentdelete',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'comp'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        'text',
        'component',
      ])

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr)

      // then
      expect(newData).toEqual({
        documentId: 'a',
        id: 1,
        comp: { text: 'some text' },
      })
    })

    it('dynamic zone field with deleted fields has fields deleted', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        dynamic_zone: [
          { __component: 'simple.componentdelete', text: 'some text' },
          {
            __component: 'twofield.component',
            title: 'some other text',
            number: 5,
          },
          { __component: 'simple.componentdelete', text: 'some simple text' },
        ],
      }
      const schema: Schema.Attribute.DynamicZone = {
        type: 'dynamiczone',
        components: ['simple.componentdelete', 'twofield.component'],
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'dynamic_zone'
      strapi.config.set('plugin::translate.translatedFieldTypes', [
        { type: 'richtext', format: 'markdown' },
        'dynamiczone',
        'component',
      ])

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr)

      // then
      expect(newData).toEqual({
        documentId: 'a',
        id: 1,
        dynamic_zone: [
          { __component: 'simple.componentdelete' },
          {
            __component: 'twofield.component',
            title: 'some other text',
            number: 5,
          },
          { __component: 'simple.componentdelete' },
        ],
      })
    })
  })

  describe('filter all deleted fields', () => {
    beforeEach(
      async () =>
        await setup({
          components: {
            'simple.component': simpleComponent,
            'twofield.component': twoFieldComponent,
          },
        })
    )

    it('simple content type translated ignored', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        title: 'some title',
      }
      const schema = simpleContentType

      // when
      const newData = filterAllDeletedFields(data, schema)

      // then
      expect(newData).toEqual(data)
    })

    it('complex content type translated ignored', async () => {
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
      const newData = filterAllDeletedFields(data, schema)

      // then
      expect(newData).toEqual(data)
    })

    it('complex content type with deleted fields has fields deleted', async () => {
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
      const schema = complexContentTypeDelete

      // when
      const newData = filterAllDeletedFields(data, schema)

      // then
      expect(newData).toEqual({
        documentId: 'a',
        id: 1,
        title: 'some title',
        slug: 'some-title',
        not_translated_field: 'not translated',
        enumeration: 'option_a',
      })
    })
  })
})
