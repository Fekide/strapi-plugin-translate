const { getService } = require('../utils/get-service');
const { getAllTranslatableFields } = require('../utils/translatable-fields');
const { translateRelations } = require('../utils/translate-relations');
const { TRANSLATE_PRIORITY_DIRECT_TRANSLATION } = require('../utils/constants');
const { filterAllDeletedFields } = require('../utils/delete-fields');
const { populateAll } = require('../utils/populate-all');
const { cleanData } = require('../utils/clean-data');
const { updateUids } = require('../utils/update-uids');

const translateController = {
  async translate(ctx) {
    const { id, sourceLocale, targetLocale, contentTypeUid } = ctx.request.body;
    if (!targetLocale || !sourceLocale) {
      return ctx.badRequest('target and source locale are both required');
    }
    if (!['string', 'number'].includes(typeof id)) {
      return ctx.badRequest('id has to be a string or a number');
    }
    const contentSchema = strapi.contentTypes[contentTypeUid];
    if (!contentSchema) {
      return ctx.notFound('corresponding content type not found');
    }
    const populateRule = populateAll(contentSchema, {
      populateMedia: true,
      populateRelations: true,
    });
    const fullyPopulatedData = await strapi.db.query(contentTypeUid).findOne({
      where: { id, locale: sourceLocale },
      populate: populateRule,
    });
    const fieldsToTranslate = await getAllTranslatableFields(
      fullyPopulatedData,
      contentSchema
    );
    try {
      const translatedData = await getService('translate').translate({
        data: fullyPopulatedData,
        sourceLocale,
        targetLocale,
        fieldsToTranslate,
        priority: TRANSLATE_PRIORITY_DIRECT_TRANSLATION,
      });
      const translatedRelations = await translateRelations(
        strapi.config.get('plugin.translate').regenerateUids
          ? await updateUids(translatedData, contentTypeUid)
          : translatedData,
        contentSchema,
        targetLocale
      );
      const withFieldsDeleted = filterAllDeletedFields(
        translatedRelations,
        contentSchema
      );
      const cleanedData = cleanData(withFieldsDeleted, contentSchema, true);
      cleanedData.localizations.push({ id });
      ctx.body = cleanedData;
    } catch (error) {
      strapi.log.error('Translating entity failed: ' + error.message);
      if (error.response?.status !== undefined) {
        switch (error.response.status) {
          case 400:
            return ctx.badRequest('translate.error.badRequest', {
              message: error.message,
            });
          case 403:
            return ctx.forbidden('translate.error.forbidden', {
              message: error.message,
            });
          case 404:
            return ctx.notFound('translate.error.notFound', {
              message: error.message,
            });
          case 413:
            return ctx.payloadTooLarge('translate.error.payloadTooLarge', {
              message: error.message,
            });
          case 414:
            return ctx.uriTooLong('translate.error.uriTooLong', {
              message: error.message,
            });
          case 429:
            return ctx.tooManyRequests('translate.error.tooManyRequests', {
              message: error.message,
            });
          case 456:
            return ctx.paymentRequired('translate.error.paymentRequired', {
              message: error.message,
            });
          default:
            return ctx.internalServerError(error.message);
        }
      } else if (error.message) {
        return ctx.internalServerError(
          'CMEditViewTranslateLocale.translate-failure',
          { message: error.message }
        );
      } else {
        return ctx.internalServerError(
          'CMEditViewTranslateLocale.translate-failure'
        );
      }
    }
  },
  async batchTranslate(ctx) {
    const { ids, sourceLocale, targetLocale, contentTypeUid } = ctx.request.body;
    if (!targetLocale || !sourceLocale) {
      return ctx.badRequest('target and source locale are both required');
    }
    if (!Array.isArray(ids) || !ids.every((id) => ['string', 'number'].includes(typeof id))) {
      return ctx.badRequest('ids has to be an array of strings or numbers');
    }
    const contentSchema = strapi.contentTypes[contentTypeUid];
    if (!contentSchema) {
      return ctx.notFound('corresponding content type not found');
    }
    const populateRule = populateAll(contentSchema, {
      populateMedia: true,
      populateRelations: true,
    });
    const fullyPopulatedData = await strapi.db.query(contentTypeUid).findMany({
      where: { id: { $in: ids }, locale: sourceLocale },
      populate: populateRule,
    });
    const fieldsToTranslate = await getAllTranslatableFields(
      fullyPopulatedData,
      contentSchema
    );
    try {
      const translatedData = await getService('translate').translate({
        data: fullyPopulatedData,
        sourceLocale,
        targetLocale,
        fieldsToTranslate,
        priority: TRANSLATE_PRIORITY_DIRECT_TRANSLATION,
      });
      const translatedRelations = await translateRelations(
        strapi.config.get('plugin.translate').regenerateUids
          ? await updateUids(translatedData, contentTypeUid)
          : translatedData,
        contentSchema,
        targetLocale
      );
      const withFieldsDeleted = filterAllDeletedFields(
        translatedRelations,
        contentSchema
      );
      const cleanedData = cleanData(withFieldsDeleted, contentSchema, true);
      ctx.body = cleanedData;
    } catch (error) {
      strapi.log.error('Translating entities failed: ' + error.message);
      if (error.response?.status !== undefined) {
        switch (error.response.status) {
          case 400:
            return ctx.badRequest('translate.error.badRequest', {
              message: error.message,
            });
          case 403:
            return ctx.forbidden('translate.error.forbidden', {
              message: error.message,
            });
          case 404:
            return ctx.notFound('translate.error.notFound', {
              message: error.message,
            });
          case 413:
            return ctx.payloadTooLarge('translate.error.payloadTooLarge', {
              message: error.message,
            });
          case 414:
            return ctx.uriTooLong('translate.error.uriTooLong', {
              message: error.message,
            });
          case 429:
            return ctx.tooManyRequests('translate.error.tooManyRequests', {
              message: error.message,
            });
          case 456:
            return ctx.paymentRequired('translate.error.paymentRequired', {
              message: error.message,
            });
          default:
            return ctx.internalServerError(error.message);
        }
      } else if (error.message) {
        return ctx.internalServerError(
          'CMEditViewTranslateLocale.translate-failure',
          { message: error.message }
        );
      } else {
        return ctx.internalServerError(
          'CMEditViewTranslateLocale.translate-failure'
        );
      }
    }
  },
  async batchTranslatePauseJob(ctx) {
    const { jobId } = ctx.request.body;
    if (!jobId) {
      return ctx.badRequest('jobId is required');
    }
    try {
      const job = await strapi.plugin('i18n').service('translation').pauseJob(jobId);
      ctx.body = job;
    } catch (error) {
      ctx.internalServerError('Unable to pause the job');
    }
  },
  async batchTranslateResumeJob(ctx) {
    const { jobId } = ctx.request.body;
    if (!jobId) {
      return ctx.badRequest('jobId is required');
    }
    try {
      const job = await strapi.plugin('i18n').service('translation').resumeJob(jobId);
      ctx.body = job;
    } catch (error) {
      ctx.internalServerError('Unable to resume the job');
    }
  },
  async batchTranslateCancelJob(ctx) {
    const { jobId } = ctx.request.body;
    if (!jobId) {
      return ctx.badRequest('jobId is required');
    }
    try {
      const job = await strapi.plugin('i18n').service('translation').cancelJob(jobId);
      ctx.body = job;
    } catch (error) {
      ctx.internalServerError('Unable to cancel the job');
    }
  },
  async batchTranslateJobStatus(ctx) {
    const { jobId } = ctx.request.query;
    if (!jobId) {
      return ctx.badRequest('jobId is required');
    }
    try {
      const jobStatus = await strapi.plugin('i18n').service('translation').getJobStatus(jobId);
      ctx.body = jobStatus;
    } catch (error) {
      ctx.internalServerError('Unable to retrieve the job status');
    }
  },
  async batchUpdate(ctx) {
    const { ids, data, contentTypeUid } = ctx.request.body;
    if (!Array.isArray(ids) || !ids.every((id) => ['string', 'number'].includes(typeof id))) {
      return ctx.badRequest('ids has to be an array of strings or numbers');
    }
    const contentSchema = strapi.contentTypes[contentTypeUid];
    if (!contentSchema) {
      return ctx.notFound('corresponding content type not found');
    }
    try {
      const updatedEntities = await strapi.db.query(contentTypeUid).updateMany(
        { id: { $in: ids } },
        { $set: data }
      );
      ctx.body = updatedEntities;
    } catch (error) {
      ctx.internalServerError('Unable to update entities');
    }
  },
  async batchTranslateContentTypes(ctx) {
    const { sourceLocale, targetLocale, contentTypeUids } = ctx.request.body;
    if (!targetLocale || !sourceLocale) {
      return ctx.badRequest('target and source locale are both required');
    }
    if (!Array.isArray(contentTypeUids)) {
      return ctx.badRequest('contentTypeUids has to be an array');
    }
    try {
      for (const contentTypeUid of contentTypeUids) {
        const contentSchema = strapi.contentTypes[contentTypeUid];
        if (!contentSchema) {
          return ctx.notFound('corresponding content type not found');
        }
        const entities = await strapi.db.query(contentTypeUid).findMany({
          where: { locale: sourceLocale },
          populate: '*',
        });
        const fieldsToTranslate = await getAllTranslatableFields(
          entities,
          contentSchema
        );
        const translatedData = await getService('translate').translate({
          data: entities,
          sourceLocale,
          targetLocale,
          fieldsToTranslate,
          priority: TRANSLATE_PRIORITY_DIRECT_TRANSLATION,
        });
        const translatedRelations = await translateRelations(
          strapi.config.get('plugin.translate').regenerateUids
            ? await updateUids(translatedData, contentTypeUid)
            : translatedData,
          contentSchema,
          targetLocale
        );
        const withFieldsDeleted = filterAllDeletedFields(
          translatedRelations,
          contentSchema
        );
        const cleanedData = cleanData(withFieldsDeleted, contentSchema, true);
        await strapi.db.query(contentTypeUid).updateMany(
          { id: { $in: entities.map((entity) => entity.id) } },
          { $set: cleanedData }
        );
      }
      ctx.send({ message: 'Batch translation completed' });
    } catch (error) {
      ctx.internalServerError('Unable to translate content types');
    }
  },
  async usageEstimate(ctx) {
    const { sourceLocale, targetLocale, contentTypeUid, fields } = ctx.request.body;
    if (!targetLocale || !sourceLocale) {
      return ctx.badRequest('target and source locale are both required');
    }
    const contentSchema = strapi.contentTypes[contentTypeUid];
    if (!contentSchema) {
      return ctx.notFound('corresponding content type not found');
    }
    try {
      const estimate = await getService('translate').estimateUsage({
        data: {},
        sourceLocale,
        targetLocale,
        fields,
        priority: TRANSLATE_PRIORITY_DIRECT_TRANSLATION,
      });
      ctx.body = estimate;
    } catch (error) {
      ctx.internalServerError('Unable to estimate usage');
    }
  },
  async usageEstimateCollection(ctx) {
    const { sourceLocale, targetLocale, contentTypeUid, fields } = ctx.request.body;
    if (!targetLocale || !sourceLocale) {
      return ctx.badRequest('target and source locale are both required');
    }
    const contentSchema = strapi.contentTypes[contentTypeUid];
    if (!contentSchema) {
      return ctx.notFound('corresponding content type not found');
    }
    try {
      const entities = await strapi.db.query(contentTypeUid).findMany({
        where: { locale: sourceLocale },
        populate: '*',
      });
      const estimate = await getService('translate').estimateUsage({
        data: entities,
        sourceLocale,
        targetLocale,
        fields,
        priority: TRANSLATE_PRIORITY_DIRECT_TRANSLATION,
      });
      ctx.body = estimate;
    } catch (error) {
      ctx.internalServerError('Unable to estimate usage for collection');
    }
  },
};

module.exports = translateController;
