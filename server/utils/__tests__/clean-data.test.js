'use strict'

const { cleanData } = require('../clean-data')

const {
  simpleComponent,
  nestedComponent,
  twoFieldComponent,
  createComponentWithRelation,
} = require('../../../__mocks__/components')
const {
  simpleContentType,
  createRelationContentType,
  createContentTypeWithComponent,
  createContentTypeWithDynamicZone,
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

describe('clean data', () => {
  beforeEach(() =>
    setup({
      components: {
        simple: simpleComponent,
        'two-field': twoFieldComponent,
        nestedComponent,
        'with-relation': createComponentWithRelation(
          'oneToOne',
          'api::simple.simple'
        ),
      },
      contentTypes: {
        'api::simple.simple': simpleContentType,
        'api::complex.relation': createRelationContentType(
          'oneToOne',
          {},
          true,
          'api::simple.simple'
        ),
        'api::complex.relation-multiple': createRelationContentType(
          'oneToMany',
          {},
          true,
          'api::simple.simple'
        ),
        'api::complex.component': createContentTypeWithComponent('simple', {}),
        'api::complex.component-repeatable': createContentTypeWithComponent(
          'simple',
          { repeatable: true }
        ),
        'api::complex.dynamiczone': createContentTypeWithDynamicZone(
          ['simple', 'two-field'],
          {}
        ),
      },
    })
  )
  it('simple content type other field removed', () => {
    // given
    const data = { title: 'some text', otherField: 'some other text' }
    const schema = strapi.contentTypes['api::simple.simple']

    // when
    const cleanedData = cleanData(data, schema)

    // then
    expect(cleanedData).toEqual({ title: 'some text' })
  })

  it('content type relation transformed to id', () => {
    // given
    const data = { related: { id: 1, title: 'some text' } }
    const schema = strapi.contentTypes['api::complex.relation']

    // when
    const cleanedData = cleanData(data, schema)

    // then
    expect(cleanedData).toEqual({ related: 1 })
  })

  it('content type relation null kept', () => {
    // given
    const data = { related: null }
    const schema = strapi.contentTypes['api::complex.relation']

    // when
    const cleanedData = cleanData(data, schema)

    // then
    expect(cleanedData).toEqual({ related: null })
  })

  it('content type multiple relation transformed to id', () => {
    // given
    const data = {
      related: [
        { id: 1, title: 'some text' },
        { id: 2, title: 'some text' },
      ],
    }
    const schema = strapi.contentTypes['api::complex.relation-multiple']

    // when
    const cleanedData = cleanData(data, schema)

    // then
    expect(cleanedData).toEqual({ related: [1, 2] })
  })

  it('component other field removed', () => {
    // given
    const data = {
      text: 'test',
      id: 1,
    }
    const schema = strapi.components['simple']

    // when
    const cleanedData = cleanData(data, schema)

    // then
    expect(cleanedData).toEqual({ text: 'test' })
  })

  it('component null returned', () => {
    // given
    const data = null
    const schema = strapi.components['simple']

    // when
    const cleanedData = cleanData(data, schema)

    // then
    expect(cleanedData).toEqual(data)
  })

  it('nested component other field removed', () => {
    // given
    const data = {
      text: 'test',
      id: 1,
      nested: {
        text: 'test',
        id: 2,
        nested: undefined,
      },
    }
    const schema = strapi.components['nestedComponent']

    // when
    const cleanedData = cleanData(data, schema)

    // then
    expect(cleanedData).toEqual({
      text: 'test',
      nested: {
        text: 'test',
        nested: undefined,
      },
    })
  })

  it('content type with component other field removed', () => {
    // given
    const data = {
      component: {
        text: 'test',
        id: 1,
      },
    }
    const schema = strapi.contentTypes['api::complex.component']

    // when
    const cleanedData = cleanData(data, schema)

    // then
    expect(cleanedData).toEqual({
      component: {
        text: 'test',
      },
    })
  })

  it('content type with repeatable component other fields removed', () => {
    // given
    const data = {
      component: [
        {
          text: 'test',
          id: 1,
        },
        {
          text: 'test',
          id: 2,
        },
      ],
    }
    const schema = strapi.contentTypes['api::complex.component-repeatable']

    // when
    const cleanedData = cleanData(data, schema)

    // then
    expect(cleanedData).toEqual({
      component: [
        {
          text: 'test',
        },
        {
          text: 'test',
        },
      ],
    })
  })

  it('content type with component null kept', () => {
    // given
    const data = {
      component: null,
    }
    const schema = strapi.contentTypes['api::complex.component']

    // when
    const cleanedData = cleanData(data, schema)

    // then
    expect(cleanedData).toEqual({
      component: null,
    })
  })

  it('content type with dynamic zone __component kept and other fields removed', () => {
    // given
    const data = {
      dynamic_zone: [
        {
          __component: 'simple',
          text: 'test',
          id: 1,
        },
        {
          __component: 'two-field',
          title: 'test',
          number: 123,
          id: 1,
        },
      ],
    }
    const schema = strapi.contentTypes['api::complex.dynamiczone']

    // when
    const cleanedData = cleanData(data, schema)

    // then
    expect(cleanedData).toEqual({
      dynamic_zone: [
        {
          __component: 'simple',
          text: 'test',
        },
        {
          __component: 'two-field',
          title: 'test',
          number: 123,
        },
      ],
    })
  })
})
