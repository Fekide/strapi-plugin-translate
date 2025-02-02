import { describe, expect, it, afterEach, beforeEach } from '@jest/globals'
import { cleanData } from '../clean-data'

import {
  simpleComponent,
  nestedComponent,
  twoFieldComponent,
  createComponentWithRelation,
} from '../../__mocks__/components'
import {
  simpleContentType,
  createRelationContentType,
  createContentTypeWithComponent,
  createContentTypeWithDynamicZone,
} from '../../__mocks__/contentTypes'
import setup from '../../__mocks__/initSetup'

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('clean data', () => {
  beforeEach(
    async () =>
      await setup({
        components: {
          simple: simpleComponent,
          'two-field': twoFieldComponent,
          'nested.component': nestedComponent,
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
          'api::complex.component': createContentTypeWithComponent(
            'simple',
            {}
          ),
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
    const data = {
      documentId: 'a',
      id: 1,
      title: 'some text',
      otherField: 'some other text',
    }
    const schema = strapi.contentTypes['api::simple.simple']

    // when
    const cleanedData = cleanData(data, schema, false)

    // then
    expect(cleanedData).toEqual({
      documentId: 'a',
      title: 'some text',
    })
  })

  it('content type relation transformed to id', () => {
    // given
    const data = {
      documentId: 'a',
      id: 1,
      related: { id: 1, title: 'some text' },
    }
    const schema = strapi.contentTypes['api::complex.relation']

    // when
    const cleanedData = cleanData(data, schema, false)

    // then
    expect(cleanedData).toEqual({
      documentId: 'a',
      related: 1,
    })
  })

  it('content type relation null kept', () => {
    // given
    const data = {
      documentId: 'a',
      id: 1,
      related: null,
    }
    const schema = strapi.contentTypes['api::complex.relation']

    // when
    const cleanedData = cleanData(data, schema, false)

    // then
    expect(cleanedData).toEqual({
      documentId: 'a',
      related: null,
    })
  })

  it('content type multiple relation transformed to id', () => {
    // given
    const data = {
      documentId: 'a',
      id: 1,
      related: [
        { id: 1, title: 'some text' },
        { id: 2, title: 'some text' },
      ],
    }
    const schema = strapi.contentTypes['api::complex.relation-multiple']

    // when
    const cleanedData = cleanData(data, schema, false)

    // then
    expect(cleanedData).toEqual({
      documentId: 'a',
      related: [1, 2],
    })
  })

  it('component other field removed', () => {
    // given
    const data = {
      documentId: 'a',
      text: 'test',
      id: 1,
    }
    const schema = strapi.components['simple']

    // when
    const cleanedData = cleanData(data, schema, false)

    // then
    expect(cleanedData).toEqual({
      documentId: 'a',
      text: 'test',
    })
  })

  it('component null returned', () => {
    // given
    const data = null
    const schema = strapi.components['simple']

    // when
    const cleanedData = cleanData(data, schema, false)

    // then
    expect(cleanedData).toEqual(data)
  })

  it('nested component other field removed', () => {
    // given
    const data = {
      documentId: 'a',
      id: 1,
      text: 'test',
      nested: {
        text: 'test',
        id: 2,
        nested: undefined,
      },
    }
    const schema = strapi.components['nested.component']

    // when
    const cleanedData = cleanData(data, schema, false)

    // then
    expect(cleanedData).toEqual({
      documentId: 'a',
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
      documentId: 'a',
      id: 1,
      component: {
        text: 'test',
        id: 1,
      },
    }
    const schema = strapi.contentTypes['api::complex.component']

    // when
    const cleanedData = cleanData(data, schema, false)

    // then
    expect(cleanedData).toEqual({
      documentId: 'a',
      component: {
        text: 'test',
      },
    })
  })

  it('content type with repeatable component other fields removed', () => {
    // given
    const data = {
      documentId: 'a',
      id: 1,
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
    const cleanedData = cleanData(data, schema, false)

    // then
    expect(cleanedData).toEqual({
      documentId: 'a',
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
      documentId: 'a',
      id: 1,
      component: null,
    }
    const schema = strapi.contentTypes['api::complex.component']

    // when
    const cleanedData = cleanData(data, schema, false)

    // then
    expect(cleanedData).toEqual({
      documentId: 'a',
      component: null,
    })
  })

  it('content type with dynamic zone __component kept and other fields removed', () => {
    // given
    const data = {
      documentId: 'a',
      id: 1,
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
    const cleanedData = cleanData(data, schema, false)

    // then
    expect(cleanedData).toEqual({
      documentId: 'a',
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
