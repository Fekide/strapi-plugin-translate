'use strict'

const { batchContentTypeUid } = require('../../utils/constants')
const { BatchTranslateJob } = require('./BatchTranslateJob')

class BatchTranslateManager {
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

  async submitJob(params) {
    const sameEntities = await strapi.service(batchContentTypeUid).find({
      filters: {
        status: { $in: ['running', 'created', 'setup'] },
        contentType: params.contentType,
        sourceLocale: params.sourceLocale,
        targetLocale: params.targetLocale,
      },
    })
    if (sameEntities.length > 0) {
      throw new Error('deepl.batch-translate.job-already-exists')
    }
    const entity = await strapi
      .service(batchContentTypeUid)
      .create({ data: params })
    const job = new BatchTranslateJob(entity)

    const promise = job.start()
    this.runningJobs.set(entity.id, job)
    promise.finally(() => {
      this.runningJobs.delete(entity.id)
    })
    return entity
  }

  async pauseJob(id) {
    if (this.runningJobs.has(id)) {
      await this.runningJobs.get(id).pause()
      return strapi.service(batchContentTypeUid).findOne(id)
    } else {
      throw new Error('deepl.batch-translate.job-not-running')
    }
  }

  async resumeJob(id) {
    if (!this.runningJobs.has(id)) {
      const entity = await strapi.service(batchContentTypeUid).findOne(id)
      if (!entity) {
        throw new Error('deepl.batch-translate.job-does-not-exist')
      }
      this._resumeJob(entity)
      return {
        ...entity,
        status: 'running',
      }
    } else {
      throw new Error('deepl.batch-translate.job-already-running')
    }
  }

  _resumeJob(entity) {
    if (['running', 'paused'].includes(entity.status)) {
      const job = new BatchTranslateJob(entity)

      const promise = job.start(true)
      strapi.log.debug(JSON.stringify(entity))
      this.runningJobs.set(entity.id, job)
      strapi.log.debug(this.runningJobs.get(entity.id).id)

      promise.finally(() => {
        this.runningJobs.delete(entity.id)
      })
    } else {
      throw new Error('deepl.batch-translate.job-cannot-be-resumed')
    }
  }

  async cancelJob(id) {
    if (this.runningJobs.has(id)) {
      await this.runningJobs.get(id).cancel()
      return strapi.service(batchContentTypeUid).findOne(id)
    } else {
      throw new Error('deepl.batch-translate.job-not-running')
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

module.exports = {
  BatchTranslateManager,
}
