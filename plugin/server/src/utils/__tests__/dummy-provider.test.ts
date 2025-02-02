import dummyProvider from '../dummy-provider'

describe('Dummy Provider', () => {
  it('meta data is correct', () => {
    expect(dummyProvider.provider).toBe('dummy')
    expect(dummyProvider.name).toBe('Dummy')
  })

  describe('translation function', () => {
    let translate

    beforeAll(() => {
      translate = dummyProvider.init({}).translate
    })

    it('throws if targetLocale is not defined', () => {
      return expect(async () =>
        translate({ sourceLocale: 'de', text: 'Lorem Ipsum' })
      ).rejects.toBeTruthy()
    })

    it('throws if sourceLocale is not defined', () => {
      return expect(async () =>
        translate({ targetLocale: 'de', text: 'Lorem Ipsum' })
      ).rejects.toBeTruthy()
    })

    it('returns empty Array if no text is give', async () => {
      expect(
        await translate({ sourceLocale: 'de', targetLocale: 'en' })
      ).toEqual([])
    })

    it('return array of input if string is given', async () => {
      expect(
        await translate({
          sourceLocale: 'de',
          targetLocale: 'anything',
          text: 'Give me this as an array',
        })
      ).toEqual(['Give me this as an array'])
    })

    it('return input if array of strings is given', async () => {
      expect(
        await translate({
          sourceLocale: 'de',
          targetLocale: 'anything',
          text: ['Give', 'me', 'this back'],
        })
      ).toEqual(['Give', 'me', 'this back'])
    })
  })

  it('usage function is static', async () => {
    let { usage, translate } = dummyProvider.init({})

    const usageResult1 = await usage()

    await translate({
      sourceLocale: 'de',
      targetLocale: 'en',
      text: 'Some random long text that should increase the usage, but does not, because this is the dummy provider.',
    })

    const usageResult2 = await usage()

    expect(usageResult1).toEqual(usageResult2)
  })
})
