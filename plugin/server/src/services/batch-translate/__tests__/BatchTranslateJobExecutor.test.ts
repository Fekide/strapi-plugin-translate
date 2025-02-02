import setup from '../../../__mocks__/initSetup'
import { BatchTranslateJobExecutor } from '../BatchTranslateJobExecutor'

const nonTranslatedContentType =
  'api::nonTranslatedContentType.nonTranslatedContentType'
const translatedContentType = 'api::translatedContentType.translatedContentType'

describe('BatchTranslateJob', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await setup({
      contentTypes: {
        [nonTranslatedContentType]: {
          pluginOptions: { i18n: { localized: false } },
          options: { draftAndPublish: true },
        },
        [translatedContentType]: {
          pluginOptions: { i18n: { localized: true } },
          options: { draftAndPublish: true },
        },
        'plugin::translate.batch-translate-job': {
          pluginOptions: { i18n: { localized: false } },
          options: { draftAndPublish: false },
        },
      },
    })
  })

  it("constructor throws if content type isn't localized", () => {
    expect(() => {
      new BatchTranslateJobExecutor({
        id: 'id',
        documentId: 'documentId',
        progress: 0,
        contentType: nonTranslatedContentType,
        sourceLocale: 'sourceLocale',
        targetLocale: 'targetLocale',
        entityIds: ['entityIds'],
        status: 'setup',
        autoPublish: false,
      })
    }).toThrow('translate.batch-translate.content-type-not-localized')
  })

  it('constructor does not throw if content type is localized', () => {
    expect(() => {
      new BatchTranslateJobExecutor({
        id: 'id',
        documentId: 'documentId',
        progress: 0,
        contentType: translatedContentType,
        sourceLocale: 'sourceLocale',
        targetLocale: 'targetLocale',
        entityIds: ['entityIds'],
        status: 'setup',
        autoPublish: false,
      })
    }).not.toThrow()
  })

  describe('start', () => {
    it('throws for status !== "created"', async () => {
      const job = new BatchTranslateJobExecutor({
        id: 'id',
        documentId: 'documentId',
        progress: 0,
        contentType: translatedContentType,
        sourceLocale: 'sourceLocale',
        targetLocale: 'targetLocale',
        entityIds: ['entityIds'],
        status: 'setup',
        autoPublish: false,
      })

      return expect(job.start()).rejects.toThrow()
    })

    it('does not throw for status === "created"', async () => {
      const job = new BatchTranslateJobExecutor({
        id: 'id',
        documentId: 'documentId',
        progress: 0,
        contentType: translatedContentType,
        sourceLocale: 'sourceLocale',
        targetLocale: 'targetLocale',
        entityIds: ['entityIds'],
        status: 'created',
        autoPublish: false,
      })

      // job.start()

      return expect(job.start()).resolves.not.toThrow()
    })
  })

  describe('status updates', () => {
    let job

    beforeEach(() => {
      job = new BatchTranslateJobExecutor({
        id: 'id',
        documentId: 'documentId',
        progress: 0,
        contentType: translatedContentType,
        sourceLocale: 'sourceLocale',
        targetLocale: 'targetLocale',
        entityIds: ['entityIds'],
        status: 'created',
        autoPublish: false,
      })
    })

    it("cancel updates the status to 'cancelled' if it is running", async () => {
      const f = jest.fn()
      BatchTranslateJobExecutor.prototype.updateStatus = f

      await job.cancel()

      expect(f).toHaveBeenCalledWith('cancelled')
    })

    it('cancel does nothing if job is not running', async () => {
      const f = jest.fn()
      BatchTranslateJobExecutor.prototype.updateStatus = f

      job.status = 'finished'
      await job.cancel()

      expect(f).not.toHaveBeenCalled()
    })

    it("pause updates the status to 'paused' if it is running", async () => {
      const f = jest.fn()
      BatchTranslateJobExecutor.prototype.updateStatus = f

      await job.pause()

      expect(f).toHaveBeenCalledWith('paused')
    })

    it('pause does nothing if job is not running', async () => {
      const f = jest.fn()
      BatchTranslateJobExecutor.prototype.updateStatus = f

      job.status = 'finished'

      await job.pause()

      expect(f).not.toHaveBeenCalled()
    })

    it('setup changes the status to setup and then running', async () => {
      const f = jest.fn((status) => (job.status = status))
      BatchTranslateJobExecutor.prototype.updateStatus = f

      await job.setup()

      expect(f).toHaveBeenCalledWith('setup')
      expect(f).toHaveBeenCalledWith('running')
    })

    it('start changes the status to finished after successful termination', async () => {
      const f = jest.fn((status) => (job.status = status))
      BatchTranslateJobExecutor.prototype.updateStatus = f

      await job.start()

      expect(f).toHaveBeenCalledWith('finished')
    })
  })
})
