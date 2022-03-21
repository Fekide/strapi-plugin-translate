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
    this.runningJobs.set(entity.id, { job, promise })
    promise.finally(() => {
      this.runningJobs.delete(entity.id)
    })
    return entity
  }

  async pauseJob(id) {
    if (this.runningJobs.has(id)) {
      await this.runningJobs.get(id).job.pause()
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
    } else {
      throw new Error('deepl.batch-translate.job-already-running')
    }
  }

  _resumeJob(entity) {
    if (entity.status == 'running') {
      const job = new BatchTranslateJob(entity)

      const promise = job.start()
      this.runningJobs.set(entity.id, { job, promise })
      promise.finally(() => {
        this.runningJobs.delete(entity.id)
      })
    }
  }

  async cancelJob(id) {
    if (this.runningJobs.has(id)) {
      await this.runningJobs.get(id).job.cancel()
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
      const job = i.value.job
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
