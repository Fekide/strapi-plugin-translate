'use strict'

const _ = require('lodash')

const {
  simpleComponent,
  createNestedComponent,
  twoFieldComponent,
  createSimpleComponent,
} = require('../../../__mocks__/components')
const {
  complexContentType,
  simpleContentType,
  complexContentTypeDelete,
} = require('../../../__mocks__/contentTypes')
const {
  filterDeletedFields,
  filterAllDeletedFields,
} = require('../delete-fields')

const setup = function (params) {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(params),
    writable: true,
  })
}

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('delete fields', () => {
  describe('single delete fields', () => {
    beforeEach(() =>
      setup({
        components: {
          simpleComponent,
          twoFieldComponent,
          nestedComponentDelete: createNestedComponent('delete'),
          simpleComponentCopy: createSimpleComponent('copy'),
          simpleComponentDelete: createSimpleComponent('delete'),
        },
      })
    )

    it('translated field ignored', async () => {
      // given
      const data = { field: 'some text' }
      const schema = {
        type: 'text',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'field'
      const translatedFieldTypes = ['text']

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr, translatedFieldTypes)

      // then
      expect(newData).toEqual(data)
    })

    it('copied field ignored', async () => {
      // given
      const data = { field: 'some text' }
      const schema = {
        type: 'text',
        pluginOptions: { translate: { translate: 'copy' } },
      }
      const attr = 'field'
      const translatedFieldTypes = ['text']

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr, translatedFieldTypes)

      // then
      expect(newData).toEqual(data)
    })

    it('deleted field is deleted', async () => {
      // given
      const data = { field: 'some text' }
      const schema = {
        type: 'text',
        pluginOptions: { translate: { translate: 'delete' } },
      }
      const attr = 'field'
      const translatedFieldTypes = ['text']

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr, translatedFieldTypes)

      // then
      expect(newData).toEqual({})
    })

    it('other field ignored', async () => {
      // given
      const data = { field: 'some text' }
      const schema = { type: 'other' }
      const attr = 'field'
      const translatedFieldTypes = ['text']

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr, translatedFieldTypes)

      // then
      expect(newData).toEqual(data)
    })

    it('deleted component field is deleted', async () => {
      // given
      const data = { child_component: { text: 'some text' } }
      const schema = {
        type: 'component',
        component: 'simpleComponent',
        pluginOptions: { translate: { translate: 'delete' } },
      }
      const attr = 'child_component'
      const translatedFieldTypes = ['text', 'component']

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr, translatedFieldTypes)

      // then
      expect(newData).toEqual({})
    })

    it('component with translated field ignored', async () => {
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
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr, translatedFieldTypes)

      // then
      expect(newData).toEqual(data)
    })

    it('component with copied field ignored', async () => {
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
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr, translatedFieldTypes)

      // then
      expect(newData).toEqual(data)
    })

    it('component with deleted field has field deleted', async () => {
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
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr, translatedFieldTypes)

      // then
      expect(newData).toEqual({ child_component: {} })
    })

    it('repeated component field with deleted field has fields deleted', async () => {
      // given
      const data = {
        child_component: [{ text: 'some text' }, { text: 'some other text' }],
      }
      const schema = {
        type: 'component',
        component: 'simpleComponentDelete',
        repeatable: true,
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'child_component'
      const translatedFieldTypes = ['text', 'component']

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr, translatedFieldTypes)

      // then
      expect(newData).toEqual({ child_component: [{}, {}] })
    })

    it('nested component with deleted fields has fields deleted', async () => {
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
        component: 'nestedComponentDelete',
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'comp'
      const translatedFieldTypes = ['text', 'component']

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr, translatedFieldTypes)

      // then
      expect(newData).toEqual({
        comp: { text: 'some text' },
      })
    })

    it('dynamic zone field with deleted fields has fields deleted', async () => {
      // given
      const data = {
        dynamic_zone: [
          { __component: 'simpleComponentDelete', text: 'some text' },
          {
            __component: 'twoFieldComponent',
            title: 'some other text',
            number: 5,
          },
          { __component: 'simpleComponentDelete', text: 'some simple text' },
        ],
      }
      const schema = {
        type: 'dynamiczone',
        components: ['simpleComponentDelete', 'twoFieldComponent'],
        pluginOptions: { translate: { translate: 'translate' } },
      }
      const attr = 'dynamic_zone'
      const translatedFieldTypes = ['text', 'dynamiczone', 'component']

      // when
      const newData = _.cloneDeep(data)
      filterDeletedFields(newData, schema, attr, translatedFieldTypes)

      // then
      expect(newData).toEqual({
        dynamic_zone: [
          { __component: 'simpleComponentDelete' },
          {
            __component: 'twoFieldComponent',
            title: 'some other text',
            number: 5,
          },
          { __component: 'simpleComponentDelete' },
        ],
      })
    })
  })

  describe('filter all deleted fields', () => {
    beforeEach(() =>
      setup({
        components: {
          simpleComponent,
          twoFieldComponent,
        },
      })
    )

    it('simple content type translated ignored', async () => {
      // given
      const data = { title: 'some title' }
      const schema = simpleContentType

      // when
      const newData = filterAllDeletedFields(data, schema)

      // then
      expect(newData).toEqual(data)
    })

    it('complex content type translated ignored', async () => {
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
      const newData = filterAllDeletedFields(data, schema)

      // then
      expect(newData).toEqual(data)
    })

    it('complex content type with deleted fields has fields deleted', async () => {
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
      const schema = complexContentTypeDelete

      // when
      const newData = filterAllDeletedFields(data, schema)

      // then
      expect(newData).toEqual({
        title: 'some title',
        slug: 'some-title',
        not_translated_field: 'not translated',
        enumeration: 'option_a',
      })
    })
  })
})
