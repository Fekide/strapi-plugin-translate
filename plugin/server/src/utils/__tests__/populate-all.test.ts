import { describe, expect, it, afterEach, beforeEach } from '@jest/globals'
import {
  simpleComponent,
  nestedComponent,
  twoFieldComponent,
  createComponentWithRelation,
} from '../../__mocks__/components'
import {
  simpleContentType,
  mediaContentType,
  createRelationContentType,
  createContentTypeWithComponent,
  createContentTypeWithDynamicZone,
  createSimpleContentType,
} from '../../__mocks__/contentTypes'
import setup from '../../__mocks__/initSetup'

import { populateAll } from '../populate-all'

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('populate all', () => {
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
          'api::media.media': mediaContentType,
          'api::simple.localized': createSimpleContentType(
            true,
            'api::simple.localized'
          ),
          'api::complex.relation': createRelationContentType(
            'oneToOne',
            {},
            false,
            'api::simple.simple'
          ),
          'api::complex.relation-multiple': createRelationContentType(
            'oneToMany',
            {},
            false,
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
            { translated: false }
          ),
          'api::complex.dynamiczone-relation': createContentTypeWithDynamicZone(
            ['simple', 'with-relation'],
            { translated: false }
          ),
        },
      })
  )

  it('simple content type returns just undefined', () => {
    // given
    const schema = strapi.contentTypes['api::simple.simple']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toBeUndefined()
  })

  it('simple content type localized returns undefined', () => {
    // given
    const schema = strapi.contentTypes['api::simple.localized']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toBeUndefined()
  })

  it('content type with relation populate only id', () => {
    // given
    const schema = strapi.contentTypes['api::complex.relation']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({ related: { fields: ['id'] } })
  })

  it('content type with multiple relations populate only id', () => {
    // given
    const schema = strapi.contentTypes['api::complex.relation-multiple']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({ related: { fields: ['id'] } })
  })

  it('content type with component populate all', () => {
    // given
    const schema = strapi.contentTypes['api::complex.component']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({ component: true })
  })

  it('content type with repeatable component populate all', () => {
    // given
    const schema = strapi.contentTypes['api::complex.component-repeatable']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({ component: true })
  })

  it('content type with dynamic zone populate all', () => {
    // given
    const schema = strapi.contentTypes['api::complex.dynamiczone']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({ dynamic_zone: true })
  })

  it('content type with dynamic zone with component relation populate id', () => {
    // given
    const schema = strapi.contentTypes['api::complex.dynamiczone-relation']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({
      dynamic_zone: {
        populate: { on: { 'with-relation': { related: { fields: ['id'] } } } },
      },
    })
  })

  it('nested component has max depth', () => {
    // given
    const schema = strapi.components['nested.component']

    // when
    const population = populateAll(schema, { maxDepth: 2 })

    // then
    expect(population).toEqual({
      nested: { populate: { nested: { populate: true } } },
    })
  })

  it('media is fully populated if requested', () => {
    // given
    const schema = strapi.contentTypes['api::media.media']

    // when
    const population = populateAll(schema, { populateMedia: true })

    // then
    expect(population).toEqual({
      media: true,
    })
  })

  it('media is not fully populated by default', () => {
    // given
    const schema = strapi.contentTypes['api::media.media']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({
      media: { fields: ['id'] },
    })
  })

  it('relations are fully populated if requested', () => {
    // given
    const schema = strapi.contentTypes['api::complex.relation']

    // when
    const population = populateAll(schema, { populateRelations: true })

    // then
    expect(population).toEqual({
      related: true,
    })
  })
})
