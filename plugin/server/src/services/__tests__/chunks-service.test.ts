import { describe, expect, afterEach, beforeEach, it } from '@jest/globals'
import { faker } from '@faker-js/faker'
import shuffle from 'lodash/shuffle'
import { stringByteLengthEncoded } from '../../utils/byte-length'
import setup from '../../__mocks__/initSetup'
import { getService } from '../../utils'

beforeEach(async () => {
  await setup({})
})

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('chunks', () => {
  it('no properties leaves text array unchanged', () => {
    // given
    const textArray = faker.helpers.uniqueArray(faker.lorem.word, 100)
    // when
    const { chunks } = getService('chunks').split(textArray, {})
    // then
    expect(chunks[0]).toEqual(textArray)
  })
  it('chunks are not longer than maxLength', () => {
    // given
    const textArray = faker.helpers.uniqueArray(faker.lorem.sentence, 10)
    const maxLength = 3
    // when
    const { chunks } = getService('chunks').split(textArray, { maxLength })
    // then
    chunks.forEach((chunk) => {
      expect(chunk.length).toBeLessThanOrEqual(maxLength)
    })
  })
  it('chunks are not bigger than byte size', () => {
    // given
    const textArray = faker.helpers.uniqueArray(faker.lorem.paragraph, 1000)
    const maxByteSize = 1000
    // when
    const { chunks } = getService('chunks').split(textArray, { maxByteSize })
    // then
    chunks.forEach((chunk) => {
      const byteSize = chunk.reduce(
        (prev, current) => prev + stringByteLengthEncoded(current),
        0
      )
      expect(byteSize).toBeLessThanOrEqual(maxByteSize)
    })
  })
  it('reduce function creates original array', () => {
    // given
    const textArray = faker.helpers.uniqueArray(faker.lorem.sentence, 10)
    const maxLength = 3
    // when
    const { chunks, reduceFunction } = getService('chunks').split(textArray, {
      maxLength,
    })
    const mergedBack = reduceFunction(chunks)
    // then
    expect(mergedBack).toEqual(textArray)
  })
  it('reduce function creates original array when fields are bigger than byteSize', () => {
    // given
    const textArray = faker.helpers.uniqueArray(
      () => faker.lorem.paragraphs(20),
      10
    )
    const maxByteSize = 1000
    // when
    const { chunks, reduceFunction } = getService('chunks').split(textArray, {
      maxByteSize,
    })
    const mergedBack = reduceFunction(chunks)
    // then
    expect(mergedBack).toEqual(textArray)
  })

  it('chunks are neither longer than maxLength nor bigger than maxByteSize', () => {
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
    const { chunks, reduceFunction } = getService('chunks').split(textArray, {
      maxLength,
      maxByteSize,
    })
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
