

import { Data, Modules } from '@strapi/strapi'
import { batchContentTypeUid } from '../../utils/constants'
import { BatchTranslateJobExecutor } from './BatchTranslateJobExecutor'
import { BatchTranslateManager } from '@shared/services/translate'
import { BatchTranslateJob } from '@shared/types/batch-translate-job'

export class BatchTranslateManagerImpl implements BatchTranslateManager {
  runningJobs: Map<Data.DocumentID, BatchTranslateJobExecutor>
  constructor() {
    this.runningJobs = new Map()
  }

  async bootstrap() {
    // Resume paused jobs
    const entities = await strapi.entityService.findMany(batchContentTypeUid, {
      filters: { status: 'running' },
    })
    if (Array.isArray(entities)) {
      entities.forEach(this._resumeJob.bind(this))
    }
  }

  async submitJob(params: {
    contentType: string
    sourceLocale: string
    targetLocale: string
    entityIds?: string[]
    autoPublish?: boolean
  }) {
    const sameEntities = await strapi.service(batchContentTypeUid).find({
      filters: {
        status: { $in: ['running', 'created', 'setup'] },
        contentType: params.contentType,
        sourceLocale: params.sourceLocale,
        targetLocale: params.targetLocale,
      },
    })
    if (sameEntities.length > 0) {
      throw new Error('translate.batch-translate.job-already-exists')
    }
    const entity = await strapi
      .documents(batchContentTypeUid)
      .create({ data: params }) as BatchTranslateJob
    const job = new BatchTranslateJobExecutor(entity)

    job
      .start()
      .catch((err) => strapi.log.error(err))
      .finally(() => {
        this.runningJobs.delete(entity.documentId)
      })
    this.runningJobs.set(entity.documentId, job)

    return entity
  }

  async pauseJob(documentId: Data.DocumentID) {
    if (this.runningJobs.has(documentId)) {
      await this.runningJobs.get(documentId).pause()
      return strapi.documents(batchContentTypeUid).findOne({documentId}) as Promise<BatchTranslateJob>
    } else {
      throw new Error('translate.batch-translate.job-not-running')
    }
  }

  async resumeJob(documentId: Data.DocumentID) {
    if (!this.runningJobs.has(documentId)) {
      const entity = await strapi.documents(batchContentTypeUid).findOne({documentId}) as BatchTranslateJob
      if (!entity) {
        throw new Error('translate.batch-translate.job-does-not-exist')
      }
      this._resumeJob(entity)
      return {
        ...entity,
        status: 'running' as const,
      }
    } else {
      throw new Error('translate.batch-translate.job-already-running')
    }
  }

  _resumeJob(entity: BatchTranslateJob) {
    if (['running', 'paused'].includes(entity.status)) {
      const job = new BatchTranslateJobExecutor(entity)

      const promise = job.start(true)
      strapi.log.debug(JSON.stringify(entity))
      this.runningJobs.set(entity.documentId, job)
      strapi.log.debug(this.runningJobs.get(entity.documentId).id)

      promise.finally(() => {
        this.runningJobs.delete(entity.documentId)
      })
    } else {
      throw new Error('translate.batch-translate.job-cannot-be-resumed')
    }
  }

  async cancelJob(documentId: Data.DocumentID) {
    if (this.runningJobs.has(documentId)) {
      await this.runningJobs.get(documentId).cancel()
      return strapi.documents(batchContentTypeUid).findOne({documentId}) as Promise<BatchTranslateJob>
    } else {
      throw new Error('translate.batch-translate.job-not-running')
    }
  }

  /**
   * Method called on shutdown
   */
  async destroy() {
    const iterator = this.runningJobs.values()
    let i = iterator.next()
    while (!i.done) {
      const job = i.value
      strapi.log.warn(
        `Translation of '${job.contentType}' from '${job.sourceLocale}' to '${job.targetLocale}' paused due to server shutdown, will resume on restart`
      )
      await job.pause(false)
      i = iterator.next()
    }
  }
}
