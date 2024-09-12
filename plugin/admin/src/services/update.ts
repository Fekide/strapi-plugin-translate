import {
  DeleteUpdatedEntry,
  GetUpdatedEntries,
} from '@shared/contracts/updated-entry'
import { translateApi } from './api'

const batchJobsApi = translateApi.injectEndpoints({
  endpoints: (build) => ({
    translateBatchUpdates: build.query<
      GetUpdatedEntries.Response,
      GetUpdatedEntries.Request['query']
    >({
      query: () => ({
        url: `/batch/updates`,
        method: 'GET',
      }),
    }),
    translateBatchUpdateDismiss: build.mutation<
      DeleteUpdatedEntry.Response,
      DeleteUpdatedEntry.Request['query']
    >({
      query: (documentId) => ({
        url: `/batch/pause/${documentId}`,
        method: 'POST',
      }),
    }),
  }),
})

const {
  useTranslateBatchUpdatesQuery,
  useTranslateBatchUpdateDismissMutation,
} = batchJobsApi

export { useTranslateBatchUpdatesQuery, useTranslateBatchUpdateDismissMutation }
