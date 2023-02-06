'use strict'

const {
  simpleComponent,
  nestedComponent,
  twoFieldComponent,
  createComponentWithRelation,
} = require('../../../__mocks__/components')
const {
  simpleContentType,
  mediaContentType,
  createRelationContentType,
  createContentTypeWithComponent,
  createContentTypeWithDynamicZone,
  createSimpleContentType,
} = require('../../../__mocks__/contentTypes')

const { populateAll } = require('../populate-all')

const setup = function (params) {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(params),
    writable: true,
  })
}

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('populate all', () => {
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
        'api::complex.component': createContentTypeWithComponent('simple', {}),
        'api::complex.component-repeatable': createContentTypeWithComponent(
          'simple',
          { repeatable: true, translated: false }
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

  it('simple content type returns just true', () => {
    // given
    const schema = strapi.contentTypes['api::simple.simple']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual(true)
  })

  it('simple content type localized returns localizations', () => {
    // given
    const schema = strapi.contentTypes['api::simple.localized']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({ localizations: { select: ['id'] } })
  })

  it('content type with relation populate only id', () => {
    // given
    const schema = strapi.contentTypes['api::complex.relation']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({ related: { select: ['id'] } })
  })

  it('content type with multiple relations populate only id', () => {
    // given
    const schema = strapi.contentTypes['api::complex.relation-multiple']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({ related: { select: ['id'] } })
  })

  it('content type with component populate all', () => {
    // given
    const schema = strapi.contentTypes['api::complex.component']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({ component: { populate: true } })
  })

  it('content type with repeatable component populate all', () => {
    // given
    const schema = strapi.contentTypes['api::complex.component-repeatable']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({ component: { populate: true } })
  })

  it('content type with dynamic zone populate all', () => {
    // given
    const schema = strapi.contentTypes['api::complex.dynamiczone']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({ dynamic_zone: { populate: true } })
  })

  it('content type with dynamic zone with component relation populate id', () => {
    // given
    const schema = strapi.contentTypes['api::complex.dynamiczone-relation']

    // when
    const population = populateAll(schema)

    // then
    expect(population).toEqual({
      dynamic_zone: { populate: { related: { select: ['id'] } } },
    })
  })

  it('nested component has max depth', () => {
    // given
    const schema = strapi.components['nestedComponent']

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
      media: { select: ['id'] },
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
