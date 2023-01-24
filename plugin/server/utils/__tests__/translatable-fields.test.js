'use strict'

const {
  getAllTranslatableFields,
  getTranslateFields,
} = require('../translatable-fields')

const {
  simpleComponent,
  nestedComponent,
  twoFieldComponent,
  createSimpleComponent,
} = require('../../../__mocks__/components')
const {
  complexContentType,
  simpleContentType,
} = require('../../../__mocks__/contentTypes')

const setup = function (params) {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(params),
    writable: true,
  })
}

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('translatable fields', () => {
  describe('get translate fields', () => {
    beforeEach(() =>
      setup({
        components: {
          simpleComponent,
          twoFieldComponent,
          nestedComponent,
          simpleComponentCopy: createSimpleComponent('copy'),
          simpleComponentDelete: createSimpleComponent('delete'),
          simpleComponentUnset: createSimpleComponent(null),
        },
      })
    )

    it('text field translated', async () => {
      // given
      const data = { field: 'some text' }
      const schema = {
        type: 'text',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'field'
      const translatedFieldTypes = ['text']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

      // then
      expect(translatedField).toEqual({ field: attr, format: 'plain' })
    })

    it('text field without configuration translated', async () => {
      // given
      const data = { field: 'some text' }
      const schema = {
        type: 'text',
        pluginOptions: { i18n: { localized: true } },
      }
      const attr = 'field'
      const translatedFieldTypes = ['text']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

      // then
      expect(translatedField).toEqual({ field: attr, format: 'plain' })
    })

    it('text field copy not translated', async () => {
      // given
      const data = { field: 'some text' }
      const schema = {
        type: 'text',
        pluginOptions: { translate: { translate: 'copy' } },
      }
      const attr = 'field'
      const translatedFieldTypes = ['text']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

      // then
      expect(translatedField).toBeNull()
    })

    it('text field delete not translated', async () => {
      // given
      const data = { field: 'some text' }
      const schema = {
        type: 'text',
        pluginOptions: { translate: { translate: 'delete' } },
      }
      const attr = 'field'
      const translatedFieldTypes = ['text']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

      // then
      expect(translatedField).toBeNull()
    })

    it('other field not translated', async () => {
      // given
      const data = { field: 'some text' }
      const schema = { type: 'other' }
      const attr = 'field'
      const translatedFieldTypes = ['text']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

      // then
      expect(translatedField).toBeNull()
    })

    it('component field translated nested', async () => {
      // given
      const data = { child_component: { text: 'some text' } }
      const schema = {
        type: 'component',
        component: 'simpleComponent',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'child_component'
      const translatedFieldTypes = ['text', 'component']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

      // then
      expect(translatedField).toEqual([
        { field: 'child_component.text', format: 'markdown' },
      ])
    })

    it('component field without configuration translated nested', async () => {
      // given
      const data = { child_component: { text: 'some text' } }
      const schema = {
        type: 'component',
        component: 'simpleComponent',
        pluginOptions: { i18n: { localized: true } },
      }
      const attr = 'child_component'
      const translatedFieldTypes = ['text', 'component']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

      // then
      expect(translatedField).toEqual([
        { field: 'child_component.text', format: 'markdown' },
      ])
    })

    it('component field with field without configuration translated nested', async () => {
      // given
      const data = { child_component: { text: 'some text' } }
      const schema = {
        type: 'component',
        component: 'simpleComponentUnset',
        pluginOptions: { i18n: { localized: true } },
      }
      const attr = 'child_component'
      const translatedFieldTypes = ['text', 'component']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

      // then
      expect(translatedField).toEqual([
        { field: 'child_component.text', format: 'markdown' },
      ])
    })

    it('component with copy field not translated', async () => {
      // given
      const data = { child_component: { text: 'some text' } }
      const schema = {
        type: 'component',
        component: 'simpleComponentCopy',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'child_component'
      const translatedFieldTypes = ['text', 'component']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

      // then
      expect(translatedField).toEqual([])
    })

    it('component with delete field not translated', async () => {
      // given
      const data = { child_component: { text: 'some text' } }
      const schema = {
        type: 'component',
        component: 'simpleComponentDelete',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'child_component'
      const translatedFieldTypes = ['text', 'component']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

      // then
      expect(translatedField).toEqual([])
    })

    it('repeated component field translated', async () => {
      // given
      const data = {
        child_component: [{ text: 'some text' }, { text: 'some other text' }],
      }
      const schema = {
        type: 'component',
        component: 'simpleComponent',
        repeatable: true,
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'child_component'
      const translatedFieldTypes = ['text', 'component']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

      // then
      expect(translatedField).toEqual([
        { field: 'child_component.0.text', format: 'markdown' },
        { field: 'child_component.1.text', format: 'markdown' },
      ])
    })

    it('nested component field translated', async () => {
      // given
      const data = {
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
      const schema = {
        type: 'component',
        component: 'nestedComponent',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'comp'
      const translatedFieldTypes = ['text', 'component']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

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
        dynamic_zone: [
          { __component: 'simpleComponent', text: 'some text' },
          {
            __component: 'twoFieldComponent',
            title: 'some other text',
            number: 5,
          },
          { __component: 'simpleComponent', text: 'some simple text' },
        ],
      }
      const schema = {
        type: 'dynamiczone',
        components: ['simpleComponent', 'twoFieldComponent'],
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'dynamic_zone'
      const translatedFieldTypes = ['text', 'dynamiczone', 'component']

      // when
      const translatedField = await getTranslateFields(
        data,
        schema,
        attr,
        translatedFieldTypes
      )

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
      const data = { title: 'some title' }
      const schema = simpleContentType

      // when
      const translatedField = await getAllTranslatableFields(data, schema)

      // then
      expect(translatedField).toEqual([{ field: 'title', format: 'plain' }])
    })

    it('complex content type translated', async () => {
      // given
      const data = {
        title: 'some title',
        content: 'some long content',
        slug: 'some-title',
        not_translated_field: 'not translated',
        enumeration: 'option_a',
        dynamic_zone: [
          { __component: 'simpleComponent', text: 'some text' },
          {
            __component: 'twoFieldComponent',
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
