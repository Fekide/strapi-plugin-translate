'use strict'

const { BatchTranslateJob } = require('../BatchTranslateJob')

describe('BatchTranslateJob', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(global, 'strapi', {
      value: require('../../../../__mocks__/initSetup')({
        contentTypes: {
          nonTranslatedContentType: {
            pluginOptions: { i18n: { localized: false } },
          },
          translatedContentType: {
            pluginOptions: { i18n: { localized: true } },
          },
        },
      }),
      writable: true,
    })
  })

  it("constructor throws if content type isn't localized", () => {
    expect(() => {
      new BatchTranslateJob({
        id: 'id',
        contentType: 'nonTranslatedContentType',
        sourceLocale: 'sourceLocale',
        targetLocale: 'targetLocale',
        entityIds: ['entityIds'],
        status: 'status',
        autoPublish: false,
      })
    }).toThrow('translate.batch-translate.content-type-not-localized')
  })

  it('constructor does not throw if content type is localized', () => {
    expect(() => {
      new BatchTranslateJob({
        id: 'id',
        contentType: 'translatedContentType',
        sourceLocale: 'sourceLocale',
        targetLocale: 'targetLocale',
        entityIds: ['entityIds'],
        status: 'status',
        autoPublish: false,
      })
    }).not.toThrow()
  })

  describe('start', () => {
    it('throws for status !== "created"', async () => {
      const job = new BatchTranslateJob({
        id: 'id',
        contentType: 'translatedContentType',
        sourceLocale: 'sourceLocale',
        targetLocale: 'targetLocale',
        entityIds: ['entityIds'],
        status: 'status',
        autoPublish: false,
      })

      expect(async () => job.start()).rejects.toThrow()
    })

    it('does not throw for status === "created"', async () => {
      const job = new BatchTranslateJob({
        id: 'id',
        contentType: 'translatedContentType',
        sourceLocale: 'sourceLocale',
        targetLocale: 'targetLocale',
        entityIds: ['entityIds'],
        status: 'created',
        autoPublish: false,
      })

      expect(job.start()).resolves.not.toThrow()
    })
  })

  describe('status updates', () => {
    let job

    beforeEach(() => {
      job = new BatchTranslateJob({
        id: 'id',
        contentType: 'translatedContentType',
        sourceLocale: 'sourceLocale',
        targetLocale: 'targetLocale',
        entityIds: ['entityIds'],
        status: 'created',
        autoPublish: false,
      })
    })

    it("cancel updates the status to 'cancelled' if it is running", async () => {
      const f = jest.fn()
      BatchTranslateJob.prototype.updateStatus = f

      await job.cancel()

      expect(f).toHaveBeenCalledWith('cancelled')
    })

    it('cancel does nothing if job is not running', async () => {
      const f = jest.fn()
      BatchTranslateJob.prototype.updateStatus = f

      job.status = 'finished'
      await job.cancel()

      expect(f).not.toHaveBeenCalled()
    })

    it("pause updates the status to 'paused' if it is running", async () => {
      const f = jest.fn()
      BatchTranslateJob.prototype.updateStatus = f

      await job.pause()

      expect(f).toHaveBeenCalledWith('paused')
    })

    it('pause does nothing if job is not running', async () => {
      const f = jest.fn()
      BatchTranslateJob.prototype.updateStatus = f

      job.status = 'finished'

      await job.pause()

      expect(f).not.toHaveBeenCalled()
    })

    it('setup changes the status to setup and then running', async () => {
      const f = jest.fn((status) => (job.status = status))
      BatchTranslateJob.prototype.updateStatus = f

      await job.setup()

      expect(f).toHaveBeenCalledWith('setup')
      expect(f).toHaveBeenCalledWith('running')
    })

    it('start changes the status to finished after successful termination', async () => {
      const f = jest.fn((status) => (job.status = status))
      BatchTranslateJob.prototype.updateStatus = f

      await job.start()

      expect(f).toHaveBeenCalledWith('finished')
    })
  })
})
