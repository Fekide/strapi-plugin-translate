import { describe, expect, it, afterEach, beforeEach } from '@jest/globals'
import {
  simpleContentType,
  createContentTypeWithUid,
} from '../../__mocks__/contentTypes'
import { updateUids } from '../update-uids'
import setup from '../../__mocks__/initSetup'

const defaultUid = 'unique-uid'

const contentManagerPluginMock = {
  services: {
    uid: {
      generateUIDField() {
        return defaultUid
      },
    },
  },
}

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('update uids', () => {
  beforeEach(
    async () =>
      await setup({
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
    const data = {
      documentId: 'a',
      id: 1,
      title: 'some text',
    }

    // when
    const updatedUids = await updateUids(data, 'api::simple.simple')

    // then
    expect(updatedUids).toEqual(data)
  })

  it('simple content type with uid not changed', async () => {
    // given
    const data = {
      documentId: 'a',
      id: 1,
      uid: 'some-uid',
    }

    // when
    const updatedUids = await updateUids(data, 'api::simple.simple-with-uid')

    // then
    expect(updatedUids).toEqual({
      documentId: 'a',
      id: 1,
      uid: defaultUid,
    })
  })
})
