import {
  TranslateBatchCancelJob,
  TranslateBatchJobStatus,
  TranslateBatchPauseJob,
  TranslateBatchResumeJob,
} from '@shared/contracts/translate'
import { translateApi } from './api'

const batchJobsApi = translateApi.injectEndpoints({
  endpoints: (build) => ({
    translateBatchJobStatus: build.query<
      TranslateBatchJobStatus.Response,
      TranslateBatchJobStatus.Request['query']
    >({
      query: ({ documentId }) => ({
        url: `/translate/batch/status/${documentId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, arg) => [
        { type: 'TranslateBatchJobStatus', id: arg.documentId },
      ],
    }),
    translateBatchJobPause: build.mutation<
      TranslateBatchPauseJob.Response,
      TranslateBatchPauseJob.Request['query']
    >({
      query: ({ documentId }) => ({
        url: `/translate/batch/pause/${documentId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'TranslateBatchJobStatus', id: arg.documentId },
        'TranslateReport',
      ],
    }),
    translateBatchJobResume: build.mutation<
      TranslateBatchResumeJob.Response,
      TranslateBatchResumeJob.Request['query']
    >({
      query: ({ documentId }) => ({
        url: `/translate/batch/resume/${documentId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'TranslateBatchJobStatus', id: arg.documentId },
        'TranslateReport',
      ],
    }),
    translateBatchJobCancel: build.mutation<
      TranslateBatchCancelJob.Response,
      TranslateBatchCancelJob.Request['query']
    >({
      query: ({ documentId }) => ({
        url: `/translate/batch/cancel/${documentId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'TranslateBatchJobStatus', id: arg.documentId },
        'TranslateReport',
      ],
    }),
  }),
})

const {
  useTranslateBatchJobStatusQuery,
  useTranslateBatchJobPauseMutation,
  useTranslateBatchJobResumeMutation,
  useTranslateBatchJobCancelMutation,
} = batchJobsApi

export {
  useTranslateBatchJobStatusQuery,
  useTranslateBatchJobPauseMutation,
  useTranslateBatchJobResumeMutation,
  useTranslateBatchJobCancelMutation,
}
