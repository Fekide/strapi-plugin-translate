'use strict'

const { cleanData } = require('../clean-data')

const _ = require('lodash')

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
  createContentTypeWithUid,
} = require('../../../__mocks__/contentTypes')
const { updateUids } = require('../update-uids')

const setup = function (params) {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(params),
    writable: true,
  })
}

const defaultUid = 'unique-uid'

const contentManagerPluginMock = {
  services: {
    uid: () => ({
      generateUIDField({ contentTypeUID, field, data }) {
        return defaultUid
      },
    }),
  },
}

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('update uids', () => {
  beforeEach(() =>
    setup({
      plugins: {
        'content-manager': contentManagerPluginMock,
      },
      contentTypes: {
        'api::simple.simple': simpleContentType,
        'api::simple.simple-with-uid': createContentTypeWithUid(true),
      },
    })
  )
  it('simple content type without uid not changed', async () => {
    // given
    const data = { title: 'some text' }

    // when
    const updatedUids = await updateUids(data, 'api::simple.simple')

    // then
    expect(updatedUids).toEqual(data)
  })

  it('simple content type with uid not changed', async () => {
    // given
    const data = { uid: 'some-uid' }

    // when
    const updatedUids = await updateUids(data, 'api::simple.simple-with-uid')

    // then
    expect(updatedUids).toEqual({ uid: defaultUid })
  })
})
