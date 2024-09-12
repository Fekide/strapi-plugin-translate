import {
  TranslateBatchUpdate,
  TranslateBatch,
  TranslateEntity,
} from '@shared/contracts/translate'
import { translateApi } from './api'

const translationApi = translateApi.injectEndpoints({
  endpoints: (build) => ({
    translateEntity: build.mutation<
      TranslateEntity.Response,
      TranslateEntity.Request['body']
    >({
      query: (data) => ({ url: `/translate/translate`, method: 'POST', data }),
    }),
    translateBatch: build.mutation<
      TranslateBatch.Response,
      TranslateBatch.Request['body']
    >({
      query: (data) => ({ url: `/translate/batch`, method: 'POST', data }),
    }),
    translateBatchUpdate: build.mutation<
      TranslateBatchUpdate.Response,
      TranslateBatchUpdate.Request['body']
    >({
      query: (data) => ({
        url: `/translate/batch/update`,
        method: 'POST',
        data,
      }),
    }),
  }),
})

const { useTranslateEntityMutation, useTranslateBatchMutation, useTranslateBatchUpdateMutation } = translationApi

export { useTranslateEntityMutation, useTranslateBatchMutation, useTranslateBatchUpdateMutation }
