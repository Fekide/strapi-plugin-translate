import { describe, expect, it, afterEach, beforeEach } from '@jest/globals'
import { translateRelations } from '../translate-relations'

import { createComponentWithRelation } from '../../__mocks__/components'
import {
  createRelationContentType,
  createContentTypeWithComponent,
  createSimpleContentType,
  createContentTypeWithDynamicZone,
} from '../../__mocks__/contentTypes'
import setup from '../../__mocks__/initSetup'

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('relation', () => {
  describe.each([
    { relationIsLocalized: true, bothWays: true },
    { relationIsLocalized: false, bothWays: true },
    { relationIsLocalized: true, bothWays: false },
    { relationIsLocalized: false, bothWays: false },
  ])(
    'one to one, relation localized: $relationIsLocalized, both ways: $bothWays',
    ({ relationIsLocalized, bothWays }) => {
      beforeEach(async () => {
        const firstEnglish = {
          documentId: 'a',
          id: 1,
          related: 1,
          locale: 'en',
        }
        const firstGerman = {
          documentId: 'a',
          id: 2,
          related: undefined,
          locale: 'de',
        }
        const secondEnglish = {
          documentId: 'b',
          id: 3,
          related: 3,
          locale: 'en',
        }
        await setup({
          contentTypes: {
            'api::first.first': createRelationContentType(
              'oneToOne',
              bothWays ? { inversedBy: 'related' } : {},
              true,
              'api::second.second'
            ),
            'api::second.second': createRelationContentType(
              'oneToOne',
              bothWays ? { mappedBy: 'related' } : {},
              relationIsLocalized,
              'api::first.first'
            ),
          },
          database: {
            'api::second.second': [firstEnglish, firstGerman, secondEnglish],
          },
        })
      })

      it('is translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: { documentId: 'a', id: 1, related: undefined },
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result = relationIsLocalized
          ? {
              documentId: 'a',
              id: 1,
              related: {
                documentId: 'a',
                id: 2,
                related: undefined,
                locale: targetLocale,
              },
            }
          : bothWays
            ? {
                documentId: 'a',
                id: 1,
                related: undefined,
              }
            : data
        // if the relation is translated, the corresponding locale should be used,
        // otherwise it should stay the same if the relation is not both ways but be removed otherwise
        expect(relationsTranslated).toEqual(result)
      })

      it('remove if relation translation is missing', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: { documentId: 'b', id: 3, related: undefined },
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result =
          relationIsLocalized || bothWays
            ? {
                documentId: 'a',
                id: 1,
                related: undefined,
              }
            : data
        expect(relationsTranslated).toEqual(result)
      })

      it('missing relation not translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: undefined,
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        expect(relationsTranslated).toEqual({
          documentId: 'a',
          id: 1,
          related: undefined,
        })
      })

      it.skip('wrong locale of relation is not translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: { documentId: 'a', id: 2, related: undefined },
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result =
          relationIsLocalized || bothWays
            ? {
                documentId: 'a',
                id: 1,
                related: undefined,
              }
            : data
        expect(relationsTranslated).toEqual(result)
      })
    }
  )

  describe.each([
    { relationIsLocalized: true, bothWays: true },
    { relationIsLocalized: false, bothWays: true },
    { relationIsLocalized: true, bothWays: false },
    { relationIsLocalized: false, bothWays: false },
  ])(
    'one to many, relation localized: $relationIsLocalized, both ways: $bothWays',
    ({ relationIsLocalized, bothWays }) => {
      beforeEach(async () => {
        const firstEnglish = {
          documentId: 'a',
          id: 1,
          related: undefined,
          locale: 'en',
        }
        const firstGerman = {
          documentId: 'a',
          id: 2,
          related: undefined,
          locale: 'de',
        }
        const secondEnglish = {
          documentId: 'b',
          id: 3,
          related: undefined,
          locale: 'en',
        }
        await setup({
          contentTypes: {
            'api::first.first': createRelationContentType(
              'oneToMany',
              bothWays ? { inversedBy: 'related' } : {},
              true,
              'api::second.second'
            ),
            'api::second.second': bothWays
              ? createRelationContentType(
                  'manyToOne',
                  { mappedBy: 'related' },
                  relationIsLocalized,
                  'api::first.first'
                )
              : createSimpleContentType(relationIsLocalized),
          },
          database: {
            'api::second.second': [firstEnglish, firstGerman, secondEnglish],
          },
        })
      })
      it('is translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: [
            { documentId: 'a', id: 1, related: undefined, locale: 'en' },
          ],
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result = relationIsLocalized
          ? {
              documentId: 'a',
              id: 1,
              related: [
                {
                  documentId: 'a',
                  id: 2,
                  related: undefined,
                  locale: targetLocale,
                },
              ],
            }
          : bothWays
            ? {
                documentId: 'a',
                id: 1,
                related: [],
              }
            : data
        // if the relation is translated, the corresponding locale should be used,
        // otherwise it should stay the same if the relation is not both ways but be removed otherwise
        expect(relationsTranslated).toEqual(result)
      })

      it('remove if a relation translation is missing', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: [
            { documentId: 'a', id: 1, related: undefined, locale: 'en' },
            { documentId: 'b', id: 3, related: undefined, locale: 'en' },
          ],
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result = relationIsLocalized
          ? {
              documentId: 'a',
              id: 1,
              related: [
                {
                  documentId: 'a',
                  id: 2,
                  related: undefined,
                  locale: targetLocale,
                },
              ],
            }
          : bothWays
            ? {
                documentId: 'a',
                id: 1,
                related: [],
              }
            : data
        expect(relationsTranslated).toEqual(result)
      })

      it('missing relation not translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: [],
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        expect(relationsTranslated).toEqual({
          documentId: 'a',
          id: 1,
          related: [],
        })
      })
      it.skip('wrong locale of relation is not translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: [{ documentId: 'a', id: 2, related: undefined }],
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result =
          relationIsLocalized || bothWays
            ? {
                documentId: 'a',
                id: 1,
                related: [],
              }
            : data
        expect(relationsTranslated).toEqual(result)
      })
    }
  )

  describe.each([
    { relationIsLocalized: true, bothWays: true },
    { relationIsLocalized: false, bothWays: true },
    { relationIsLocalized: true, bothWays: false },
    { relationIsLocalized: false, bothWays: false },
  ])(
    'many to one, relation localized: $relationIsLocalized, both ways: $bothWays',
    ({ relationIsLocalized, bothWays }) => {
      beforeEach(async () => {
        const firstEnglish = {
          documentId: 'a',
          id: 1,
          related: undefined,
          locale: 'en',
        }
        const firstGerman = {
          documentId: 'a',
          id: 2,
          related: undefined,
          locale: 'de',
        }
        const secondEnglish = {
          documentId: 'b',
          id: 3,
          related: undefined,
          locale: 'en',
        }
        await setup({
          contentTypes: {
            'api::first.first': createRelationContentType(
              'manyToOne',
              bothWays ? { inversedBy: 'related' } : {},
              true,
              'api::second.second'
            ),
            'api::second.second': bothWays
              ? createRelationContentType(
                  'oneToMany',
                  { mappedBy: 'related' },
                  relationIsLocalized,
                  'api::first.first'
                )
              : {
                  pluginOptions: {
                    i18n: {
                      localized: !!relationIsLocalized,
                    },
                  },
                  kind: 'collectionType',
                  attributes: {},
                },
          },
          database: {
            'api::second.second': [firstEnglish, firstGerman, secondEnglish],
          },
        })
      })

      it('is translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: { documentId: 'a', id: 1, related: undefined },
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result = relationIsLocalized
          ? {
              documentId: 'a',
              id: 1,
              related: {
                documentId: 'a',
                id: 2,
                related: undefined,
                locale: targetLocale,
              },
            }
          : data
        // if the relation is translated, the corresponding locale should be used,
        // otherwise it should stay the same if the relation is not both ways but be removed otherwise
        expect(relationsTranslated).toEqual(result)
      })

      it('remove if relation translation is missing', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: { documentId: 'b', id: 3, related: undefined },
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result = relationIsLocalized
          ? {
              documentId: 'a',
              id: 1,
              related: undefined,
            }
          : data
        expect(relationsTranslated).toEqual(result)
      })

      it('missing relation not translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: undefined,
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        expect(relationsTranslated).toEqual({
          documentId: 'a',
          id: 1,
          related: undefined,
        })
      })

      it.skip('wrong locale of relation is not translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: { documentId: 'a', id: 2, related: undefined },
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result = relationIsLocalized
          ? {
              documentId: 'a',
              id: 1,
              related: undefined,
            }
          : data
        expect(relationsTranslated).toEqual(result)
      })
    }
  )

  describe.each([
    { relationIsLocalized: true },
    { relationIsLocalized: false },
  ])(
    'many to many, relation localized: $relationIsLocalized',
    ({ relationIsLocalized }) => {
      beforeEach(async () => {
        const firstEnglish = {
          documentId: 'a',
          id: 1,
          related: undefined,
          locale: 'en',
        }
        const firstGerman = {
          documentId: 'a',
          id: 2,
          related: undefined,
          locale: 'de',
        }
        const secondEnglish = {
          documentId: 'b',
          id: 3,
          related: undefined,
          locale: 'en',
        }
        await setup({
          contentTypes: {
            'api::first.first': createRelationContentType(
              'manyToMany',
              { inversedBy: 'related' },
              true,
              'api::second.second'
            ),
            'api::second.second': createRelationContentType(
              'manyToOne',
              { mappedBy: 'related' },
              relationIsLocalized,
              'api::first.first'
            ),
          },
          database: {
            'api::second.second': [firstEnglish, firstGerman, secondEnglish],
          },
        })
      })
      it('is translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: [
            { documentId: 'a', id: 1, related: undefined, locale: 'en' },
          ],
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result = relationIsLocalized
          ? {
              documentId: 'a',
              id: 1,
              related: [
                {
                  documentId: 'a',
                  id: 2,
                  related: undefined,
                  locale: targetLocale,
                },
              ],
            }
          : data
        // if the relation is translated, the corresponding locale should be used,
        // otherwise it should stay the same if the relation is not both ways but be removed otherwise
        expect(relationsTranslated).toEqual(result)
      })

      it('remove if a relation translation is missing', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: [
            { documentId: 'a', id: 1, related: undefined, locale: 'en' },
            { documentId: 'b', id: 3, related: undefined, locale: 'en' },
          ],
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result = relationIsLocalized
          ? {
              documentId: 'a',
              id: 1,
              related: [
                {
                  documentId: 'a',
                  id: 2,
                  related: undefined,
                  locale: targetLocale,
                },
              ],
            }
          : data
        expect(relationsTranslated).toEqual(result)
      })

      it('missing relation not translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: [],
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        expect(relationsTranslated).toEqual({
          documentId: 'a',
          id: 1,
          related: [],
        })
      })
      it.skip('wrong locale of relation is not translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: [{ documentId: 'a', id: 2, related: undefined }],
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        // then
        const result = relationIsLocalized
          ? {
              documentId: 'a',
              id: 1,
              related: [],
            }
          : data
        expect(relationsTranslated).toEqual(result)
      })
    }
  )

  describe('components', () => {
    describe.each([
      { relationIsLocalized: true },
      { relationIsLocalized: false },
    ])(
      'one to one, relation localized: $relationIsLocalized',
      ({ relationIsLocalized }) => {
        beforeEach(async () => {
          const firstEnglish = { documentId: 'a', id: 1, locale: 'en' }
          const firstGerman = { documentId: 'a', id: 2, locale: 'de' }
          const secondEnglish = { documentId: 'b', id: 3, locale: 'en' }
          await setup({
            components: {
              'shared.first': createComponentWithRelation(
                'oneToOne',
                'api::second.second'
              ),
            },
            contentTypes: {
              'api::first.notRepeated': createContentTypeWithComponent(
                'shared.first',
                { localized: true }
              ),
              'api::first.repeated': createContentTypeWithComponent(
                'shared.first',
                { localized: true, repeatable: true }
              ),
              'api::second.second':
                createSimpleContentType(relationIsLocalized),
            },
            database: {
              'api::second.second': [firstEnglish, firstGerman, secondEnglish],
            },
          })
        })
        it('null component ignored', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            component: null,
          }
          const schema = strapi.contentTypes['api::first.notRepeated']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          expect(relationsTranslated).toEqual(data)
        })

        it('is translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            component: { related: { documentId: 'a', id: 1, locale: 'en' } },
          }
          const schema = strapi.contentTypes['api::first.notRepeated']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                component: {
                  related: { documentId: 'a', id: 2, locale: targetLocale },
                },
              }
            : data
          // if the relation is translated, the corresponding locale should be used,
          // otherwise it should stay the same if the relation is not both ways but be removed otherwise
          expect(relationsTranslated).toEqual(result)
        })

        it('remove if relation translation is missing', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            component: { related: { documentId: 'b', id: 3, locale: 'en' } },
          }
          const schema = strapi.contentTypes['api::first.notRepeated']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                component: { related: undefined },
              }
            : data
          expect(relationsTranslated).toEqual(result)
        })

        it('missing relation not translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            component: { related: undefined },
          }
          const schema = strapi.contentTypes['api::first.notRepeated']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          expect(relationsTranslated).toEqual(data)
        })

        it.skip('wrong locale of relation is not translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            component: { related: { documentId: 'a', id: 2, locale: 'de' } },
          }
          const schema = strapi.contentTypes['api::first.notRepeated']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                component: { related: undefined },
              }
            : data
          expect(relationsTranslated).toEqual(result)
        })

        describe('repeatable', () => {
          it('is translated', async () => {
            // given
            const data = {
              documentId: 'a',
              id: 1,
              component: [
                { related: { documentId: 'a', id: 1, locale: 'en' } },
              ],
            }
            const schema = strapi.contentTypes['api::first.repeated']
            const targetLocale = 'de'
            // when
            const relationsTranslated = await translateRelations(
              data,
              schema,
              targetLocale
            )
            // then
            const result = relationIsLocalized
              ? {
                  documentId: 'a',
                  id: 1,
                  component: [
                    {
                      related: { documentId: 'a', id: 2, locale: targetLocale },
                    },
                  ],
                }
              : data
            // if the relation is translated, the corresponding locale should be used,
            // otherwise it should stay the same if the relation is not both ways but be removed otherwise
            expect(relationsTranslated).toEqual(result)
          })

          it('remove if relation translation is missing', async () => {
            // given
            const data = {
              documentId: 'a',
              id: 1,
              component: [
                { related: { documentId: 'a', id: 1, locale: 'en' } },
                { related: { documentId: 'b', id: 3, locale: 'en' } },
              ],
            }
            const schema = strapi.contentTypes['api::first.repeated']
            const targetLocale = 'de'
            // when
            const relationsTranslated = await translateRelations(
              data,
              schema,
              targetLocale
            )
            // then
            const result = relationIsLocalized
              ? {
                  documentId: 'a',
                  id: 1,
                  component: [
                    {
                      related: { documentId: 'a', id: 2, locale: targetLocale },
                    },
                    { related: undefined },
                  ],
                }
              : data
            expect(relationsTranslated).toEqual(result)
          })

          it('missing relation not translated', async () => {
            // given
            const data = {
              documentId: 'a',
              id: 1,
              component: [{ related: undefined }],
            }
            const schema = strapi.contentTypes['api::first.repeated']
            const targetLocale = 'de'
            // when
            const relationsTranslated = await translateRelations(
              data,
              schema,
              targetLocale
            )
            // then
            expect(relationsTranslated).toEqual(data)
          })

          it.skip('wrong locale of relation is not translated', async () => {
            // given
            const data = {
              documentId: 'a',
              id: 1,
              component: [
                { related: { documentId: 'a', id: 2, locale: 'de' } },
              ],
            }
            const schema = strapi.contentTypes['api::first.repeated']
            const targetLocale = 'de'
            // when
            const relationsTranslated = await translateRelations(
              data,
              schema,
              targetLocale
            )
            // then
            const result = relationIsLocalized
              ? {
                  documentId: 'a',
                  id: 1,
                  component: [{ related: undefined }],
                }
              : data
            expect(relationsTranslated).toEqual(result)
          })
        })
      }
    )

    describe.each([
      { relationIsLocalized: true },
      { relationIsLocalized: false },
    ])(
      'one to many, relation localized: $relationIsLocalized',
      ({ relationIsLocalized }) => {
        beforeEach(async () => {
          const firstEnglish = { documentId: 'a', id: 1, locale: 'en' }
          const firstGerman = { documentId: 'a', id: 2, locale: 'de' }
          const secondEnglish = { documentId: 'b', id: 3, locale: 'en' }
          await setup({
            components: {
              'shared.first': createComponentWithRelation(
                'oneToMany',
                'api::second.second'
              ),
            },
            contentTypes: {
              'api::first.notRepeated': createContentTypeWithComponent(
                'shared.first',
                { localized: true }
              ),
              'api::first.repeated': createContentTypeWithComponent(
                'shared.first',
                { localized: true, repeatable: true }
              ),
              'api::second.second':
                createSimpleContentType(relationIsLocalized),
            },
            database: {
              'api::second.second': [firstEnglish, firstGerman, secondEnglish],
            },
          })
        })
        it('is translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            component: { related: [{ documentId: 'a', id: 1, locale: 'en' }] },
          }
          const schema = strapi.contentTypes['api::first.notRepeated']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                component: {
                  related: [{ documentId: 'a', id: 2, locale: targetLocale }],
                },
              }
            : data
          // if the relation is translated, the corresponding locale should be used,
          // otherwise it should stay the same if the relation is not both ways but be removed otherwise
          expect(relationsTranslated).toEqual(result)
        })

        it('remove if relation translation is missing', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            component: {
              related: [
                { documentId: 'a', id: 1, locale: 'en' },
                { documentId: 'b', id: 3, locale: 'en' },
              ],
            },
          }
          const schema = strapi.contentTypes['api::first.notRepeated']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                component: {
                  related: [{ documentId: 'a', id: 2, locale: 'de' }],
                },
              }
            : data
          expect(relationsTranslated).toEqual(result)
        })

        it('missing relation not translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            component: { related: [] },
          }
          const schema = strapi.contentTypes['api::first.notRepeated']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          expect(relationsTranslated).toEqual(data)
        })

        it.skip('wrong locale of relation is not translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            component: { related: [{ documentId: 'a', id: 2, locale: 'de' }] },
          }
          const schema = strapi.contentTypes['api::first.notRepeated']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                component: { related: [] },
              }
            : data
          expect(relationsTranslated).toEqual(result)
        })

        describe('repeatable', () => {
          it('is translated', async () => {
            // given
            const data = {
              documentId: 'a',
              id: 1,
              component: [
                { related: [{ documentId: 'a', id: 1, locale: 'en' }] },
              ],
            }
            const schema = strapi.contentTypes['api::first.repeated']
            const targetLocale = 'de'
            // when
            const relationsTranslated = await translateRelations(
              data,
              schema,
              targetLocale
            )
            // then
            const result = relationIsLocalized
              ? {
                  documentId: 'a',
                  id: 1,
                  component: [
                    {
                      related: [
                        { documentId: 'a', id: 2, locale: targetLocale },
                      ],
                    },
                  ],
                }
              : data
            // if the relation is translated, the corresponding locale should be used,
            // otherwise it should stay the same if the relation is not both ways but be removed otherwise
            expect(relationsTranslated).toEqual(result)
          })

          it('remove if relation translation is missing', async () => {
            // given
            const data = {
              documentId: 'a',
              id: 1,
              component: [
                {
                  related: [
                    { documentId: 'a', id: 1, locale: 'en' },
                    { documentId: 'b', id: 3, locale: 'en' },
                  ],
                },
                {
                  related: [
                    { documentId: 'a', id: 1, locale: 'en' },
                    { documentId: 'b', id: 3, locale: 'en' },
                  ],
                },
              ],
            }
            const schema = strapi.contentTypes['api::first.repeated']
            const targetLocale = 'de'
            // when
            const relationsTranslated = await translateRelations(
              data,
              schema,
              targetLocale
            )
            // then
            const result = relationIsLocalized
              ? {
                  documentId: 'a',
                  id: 1,
                  component: [
                    {
                      related: [
                        { documentId: 'a', id: 2, locale: targetLocale },
                      ],
                    },
                    {
                      related: [
                        { documentId: 'a', id: 2, locale: targetLocale },
                      ],
                    },
                  ],
                }
              : data
            expect(relationsTranslated).toEqual(result)
          })

          it('missing relation not translated', async () => {
            // given
            const data = {
              documentId: 'a',
              id: 1,
              component: [{ related: [] }],
            }
            const schema = strapi.contentTypes['api::first.repeated']
            const targetLocale = 'de'
            // when
            const relationsTranslated = await translateRelations(
              data,
              schema,
              targetLocale
            )
            // then
            expect(relationsTranslated).toEqual(data)
          })

          it.skip('wrong locale of relation is not translated', async () => {
            // given
            const data = {
              documentId: 'a',
              id: 1,
              component: [
                { related: [{ documentId: 'a', id: 2, locale: 'de' }] },
              ],
            }
            const schema = strapi.contentTypes['api::first.repeated']
            const targetLocale = 'de'
            // when
            const relationsTranslated = await translateRelations(
              data,
              schema,
              targetLocale
            )
            // then
            const result = relationIsLocalized
              ? {
                  documentId: 'a',
                  id: 1,
                  component: [{ related: [] }],
                }
              : data
            expect(relationsTranslated).toEqual(result)
          })
        })
      }
    )
  })

  describe('dynamiczone', () => {
    describe.each([
      { relationIsLocalized: true },
      { relationIsLocalized: false },
    ])(
      'one to one, relation localized: $relationIsLocalized',
      ({ relationIsLocalized }) => {
        beforeEach(async () => {
          const firstEnglish = { documentId: 'a', id: 1, locale: 'en' }
          const firstGerman = { documentId: 'a', id: 2, locale: 'de' }
          const secondEnglish = { documentId: 'b', id: 3, locale: 'en' }
          await setup({
            components: {
              'shared.first': createComponentWithRelation(
                'oneToOne',
                'api::second.second'
              ),
              'shared.second': createComponentWithRelation(
                'oneToOne',
                'api::second.second'
              ),
            },
            contentTypes: {
              'api::first.first': createContentTypeWithDynamicZone(
                ['shared.first', 'shared.second'],
                { translated: true }
              ),
              'api::second.second':
                createSimpleContentType(relationIsLocalized),
            },
            database: {
              'api::second.second': [firstEnglish, firstGerman, secondEnglish],
            },
          })
        })
        it('is translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            dynamic_zone: [
              {
                __component: 'shared.first',
                related: { documentId: 'a', id: 1, locale: 'en' },
              },
              {
                __component: 'shared.second',
                related: { documentId: 'a', id: 1, locale: 'en' },
              },
            ],
          }
          const schema = strapi.contentTypes['api::first.first']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                dynamic_zone: [
                  {
                    __component: 'shared.first',
                    related: { documentId: 'a', id: 2, locale: targetLocale },
                  },
                  {
                    __component: 'shared.second',
                    related: { documentId: 'a', id: 2, locale: targetLocale },
                  },
                ],
              }
            : data
          // if the relation is translated, the corresponding locale should be used,
          // otherwise it should stay the same if the relation is not both ways but be removed otherwise
          expect(relationsTranslated).toEqual(result)
        })

        it('remove if relation translation is missing', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            dynamic_zone: [
              {
                __component: 'shared.first',
                related: { documentId: 'a', id: 1, locale: 'en' },
              },
              {
                __component: 'shared.second',
                related: { documentId: 'b', id: 3, locale: 'en' },
              },
            ],
          }
          const schema = strapi.contentTypes['api::first.first']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                dynamic_zone: [
                  {
                    __component: 'shared.first',
                    related: { documentId: 'a', id: 2, locale: targetLocale },
                  },
                  {
                    __component: 'shared.second',
                    related: undefined,
                  },
                ],
              }
            : data
          expect(relationsTranslated).toEqual(result)
        })

        it('missing relation not translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            dynamic_zone: [
              { __component: 'shared.first', related: undefined },
              {
                __component: 'shared.second',
                related: undefined,
              },
            ],
          }
          const schema = strapi.contentTypes['api::first.first']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          expect(relationsTranslated).toEqual(data)
        })

        it.skip('wrong locale of relation is not translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            dynamic_zone: [
              {
                __component: 'shared.first',
                related: { documentId: 'a', id: 2, locale: 'de' },
              },
              {
                __component: 'shared.second',
                related: { documentId: 'a', id: 2, locale: 'de' },
              },
            ],
          }
          const schema = strapi.contentTypes['api::first.first']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                dynamic_zone: [
                  {
                    __component: 'shared.first',
                    related: undefined,
                  },
                  {
                    __component: 'shared.second',
                    related: undefined,
                  },
                ],
              }
            : data
          expect(relationsTranslated).toEqual(result)
        })
      }
    )

    describe.each([
      { relationIsLocalized: true },
      { relationIsLocalized: false },
    ])(
      'one to many, relation localized: $relationIsLocalized',
      ({ relationIsLocalized }) => {
        beforeEach(async () => {
          const firstEnglish = { documentId: 'a', id: 1, locale: 'en' }
          const firstGerman = { documentId: 'a', id: 2, locale: 'de' }
          const secondEnglish = { documentId: 'b', id: 3, locale: 'en' }
          await setup({
            components: {
              'shared.first': createComponentWithRelation(
                'oneToMany',
                'api::second.second'
              ),
              'shared.second': createComponentWithRelation(
                'oneToMany',
                'api::second.second'
              ),
            },
            contentTypes: {
              'api::first.first': createContentTypeWithDynamicZone(
                ['shared.first', 'shared.second'],
                { translated: true }
              ),
              'api::second.second':
                createSimpleContentType(relationIsLocalized),
            },
            database: {
              'api::second.second': [firstEnglish, firstGerman, secondEnglish],
            },
          })
        })
        it('is translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            dynamic_zone: [
              {
                __component: 'shared.first',
                related: [{ documentId: 'a', id: 1, locale: 'en' }],
              },
              {
                __component: 'shared.second',
                related: [{ documentId: 'a', id: 1, locale: 'en' }],
              },
            ],
          }
          const schema = strapi.contentTypes['api::first.first']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                dynamic_zone: [
                  {
                    __component: 'shared.first',
                    related: [{ documentId: 'a', id: 2, locale: targetLocale }],
                  },
                  {
                    __component: 'shared.second',
                    related: [{ documentId: 'a', id: 2, locale: targetLocale }],
                  },
                ],
              }
            : data
          // if the relation is translated, the corresponding locale should be used,
          // otherwise it should stay the same if the relation is not both ways but be removed otherwise
          expect(relationsTranslated).toEqual(result)
        })

        it('remove if relation translation is missing', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            dynamic_zone: [
              {
                __component: 'shared.first',
                related: [{ documentId: 'a', id: 1, locale: 'en' }],
              },
              {
                __component: 'shared.second',
                related: [
                  { documentId: 'a', id: 1, locale: 'en' },
                  { documentId: 'b', id: 3, locale: 'en' },
                ],
              },
            ],
          }
          const schema = strapi.contentTypes['api::first.first']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                dynamic_zone: [
                  {
                    __component: 'shared.first',
                    related: [{ documentId: 'a', id: 2, locale: 'de' }],
                  },
                  {
                    __component: 'shared.second',
                    related: [{ documentId: 'a', id: 2, locale: 'de' }],
                  },
                ],
              }
            : data
          expect(relationsTranslated).toEqual(result)
        })

        it('missing relation not translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            dynamic_zone: [
              {
                __component: 'shared.first',
                related: [],
              },
              {
                __component: 'shared.second',
                related: [],
              },
            ],
          }
          const schema = strapi.contentTypes['api::first.first']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          expect(relationsTranslated).toEqual(data)
        })

        it.skip('wrong locale of relation is not translated', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            dynamic_zone: [
              {
                __component: 'shared.first',
                related: [{ documentId: 'a', id: 2, locale: 'de' }],
              },
              {
                __component: 'shared.second',
                related: [{ documentId: 'a', id: 2, locale: 'de' }],
              },
            ],
          }
          const schema = strapi.contentTypes['api::first.first']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          // then
          const result = relationIsLocalized
            ? {
                documentId: 'a',
                id: 1,
                dynamic_zone: [
                  {
                    __component: 'shared.first',
                    related: [],
                  },
                  {
                    __component: 'shared.second',
                    related: [],
                  },
                ],
              }
            : data
          expect(relationsTranslated).toEqual(result)
        })
      }
    )
  })

  describe('config do not translate relations', () => {
    beforeEach(async () => {
      const firstEnglish = { documentId: 'a', id: 1, locale: 'en' }
      const firstGerman = { documentId: 'a', id: 2, locale: 'de' }
      await setup({
        config: {
          translateRelations: false,
        },
        contentTypes: {
          'api::first.first': createRelationContentType(
            'oneToOne',
            {},
            true,
            'api::second.second',
            'api::first.first'
          ),
          'api::second.second': createSimpleContentType(true),
        },
        database: {
          'api::second.second': [firstEnglish, firstGerman],
        },
      })
    })
    it('is not translated', async () => {
      // given
      const data = {
        documentId: 'a',
        id: 1,
        related: { documentId: 'a', id: 1, locale: 'en' },
      }
      const schema = strapi.contentTypes['api::first.first']
      const targetLocale = 'de'
      // when
      const relationsTranslated = await translateRelations(
        data,
        schema,
        targetLocale
      )
      // then
      expect(relationsTranslated).toEqual({
        documentId: 'a',
        id: 1,
        related: undefined,
      })
    })
  })

  describe('plugin options', () => {
    describe.each([
      { relationIsLocalized: true, bothWays: true },
      { relationIsLocalized: false, bothWays: true },
      { relationIsLocalized: true, bothWays: false },
      { relationIsLocalized: false, bothWays: false },
    ])(
      'copy oneToOne with relation both ways = $bothWays and localized = $relationIsLocalized',
      ({ relationIsLocalized, bothWays }) => {
        beforeEach(async () => {
          const firstEnglish = {
            documentId: 'a',
            id: 1,
            title: 'test',
            locale: 'en',
          }
          const firstGerman = {
            documentId: 'a',
            id: 2,
            title: 'test',
            locale: 'de',
          }
          await setup({
            contentTypes: {
              'api::first.first': createRelationContentType(
                'oneToOne',
                bothWays ? { inversedBy: 'related' } : {},
                true,
                'api::second.second',
                'api::first.first',
                'copy'
              ),
              'api::second.second': createRelationContentType(
                'oneToOne',
                bothWays ? { mappedBy: 'related' } : {},
                relationIsLocalized,
                'api::first.first',
                'api::second.second'
              ),
            },
            database: {
              'api::second.second': [firstEnglish, firstGerman],
            },
          })
        })
        it('copied only if relation is not localized and does not go both ways', async () => {
          // given
          const data = {
            documentId: 'a',
            id: 1,
            related: { documentId: 'a', id: 1, title: 'test', locale: 'en' },
          }
          const schema = strapi.contentTypes['api::first.first']
          const targetLocale = 'de'
          // when
          const relationsTranslated = await translateRelations(
            data,
            schema,
            targetLocale
          )
          const result =
            !bothWays && !relationIsLocalized
              ? data
              : {
                  documentId: 'a',
                  id: 1,
                  related: undefined,
                }
          // then
          expect(relationsTranslated).toEqual(result)
        })
      }
    )

    describe('default behavior is translate', () => {
      beforeEach(async () => {
        const firstEnglish = {
          documentId: 'a',
          id: 1,
          title: 'test',
          locale: 'en',
        }
        const firstGerman = {
          documentId: 'a',
          id: 2,
          title: 'test',
          locale: 'de',
        }
        await setup({
          contentTypes: {
            'api::first.first': createRelationContentType(
              'oneToOne',
              { inversedBy: 'related' },
              true,
              'api::second.second',
              'api::first.first',
              // forcing an empty value
              ''
            ),
            'api::second.second': createRelationContentType(
              'oneToOne',
              { mappedBy: 'related' },
              true,
              'api::first.first',
              'api::second.second'
            ),
          },
          database: {
            'api::second.second': [firstEnglish, firstGerman],
          },
        })
      })
      it('is translated', async () => {
        // given
        const data = {
          documentId: 'a',
          id: 1,
          related: { documentId: 'a', id: 1, title: 'test', locale: 'en' },
        }
        const schema = strapi.contentTypes['api::first.first']
        const targetLocale = 'de'
        // when
        const relationsTranslated = await translateRelations(
          data,
          schema,
          targetLocale
        )
        const result = {
          documentId: 'a',
          id: 1,
          related: { documentId: 'a', id: 2, title: 'test', locale: 'de' },
        }
        // then
        expect(relationsTranslated).toEqual(result)
      })
    })
  })
})
