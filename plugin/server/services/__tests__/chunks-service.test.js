'use strict'

const { faker } = require('@faker-js/faker')
const shuffle = require('lodash/shuffle')
const { stringByteLengthEncoded } = require('../../utils/byte-length')

const setup = function (params) {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(params),
    writable: true,
  })
}

beforeEach(() => {
  setup({})
})

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('chunks', () => {
  test('no properties leaves text array unchanged', () => {
    // given
    const textArray = faker.helpers.uniqueArray(faker.lorem.word, 100)
    // when
    const { chunks } = strapi
      .service('plugin::translate.chunks')
      .split(textArray, {})
    // then
    expect(chunks[0]).toEqual(textArray)
  })
  test('chunks are not longer than maxLength', () => {
    // given
    const textArray = faker.helpers.uniqueArray(faker.lorem.sentence, 10)
    const maxLength = 3
    // when
    const { chunks } = strapi
      .service('plugin::translate.chunks')
      .split(textArray, { maxLength })
    // then
    chunks.forEach((chunk) => {
      expect(chunk.length).toBeLessThanOrEqual(maxLength)
    })
  })
  test('chunks are not bigger than byte size', () => {
    // given
    const textArray = faker.helpers.uniqueArray(faker.lorem.paragraph, 1000)
    const maxByteSize = 1000
    // when
    const { chunks } = strapi
      .service('plugin::translate.chunks')
      .split(textArray, { maxByteSize })
    // then
    chunks.forEach((chunk) => {
      const byteSize = chunk.reduce(
        (prev, current) => prev + stringByteLengthEncoded(current),
        0
      )
      expect(byteSize).toBeLessThanOrEqual(maxByteSize)
    })
  })
  test('reduce function creates original array', () => {
    // given
    const textArray = faker.helpers.uniqueArray(faker.lorem.sentence, 10)
    const maxLength = 3
    // when
    const { chunks, reduceFunction } = strapi
      .service('plugin::translate.chunks')
      .split(textArray, { maxLength })
    const mergedBack = reduceFunction(chunks)
    // then
    expect(mergedBack).toEqual(textArray)
  })
  test('reduce function creates original array when fields are bigger than byteSize', () => {
    // given
    const textArray = faker.helpers.uniqueArray(
      () => faker.lorem.paragraphs(20),
      10
    )
    const maxByteSize = 1000
    // when
    const { chunks, reduceFunction } = strapi
      .service('plugin::translate.chunks')
      .split(textArray, { maxByteSize })
    const mergedBack = reduceFunction(chunks)
    // then
    expect(mergedBack).toEqual(textArray)
  })

  test('chunks are neither longer than maxLength nor bigger than maxByteSize', () => {
    // given
    const longTexts = faker.helpers.uniqueArray(
      () => faker.lorem.paragraphs(20),
      10
    )
    const shortTexts = faker.helpers.uniqueArray(faker.lorem.word, 100)
    const textArray = shuffle(longTexts.concat(shortTexts))
    const maxLength = 10
    const maxByteSize = 1000
    // when
    const { chunks, reduceFunction } = strapi
      .service('plugin::translate.chunks')
      .split(textArray, { maxLength, maxByteSize })
    const mergedBack = reduceFunction(chunks)
    // then
    chunks.forEach((chunk) => {
      const byteSize = chunk.reduce(
        (prev, current) => prev + stringByteLengthEncoded(current),
        0
      )
      expect(byteSize).toBeLessThanOrEqual(maxByteSize)
      expect(chunk.length).toBeLessThanOrEqual(maxLength)
    })
    expect(mergedBack).toEqual(textArray)
  })
})
