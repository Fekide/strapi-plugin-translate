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
        url: `/translate/batch/updates`,
        method: 'GET',
      }),
      providesTags: ['TranslateBatchUpdates'],
    }),
    translateBatchUpdateDismiss: build.mutation<
      DeleteUpdatedEntry.Response,
      DeleteUpdatedEntry.Request['query']
    >({
      query: (documentId) => ({
        url: `/translate/batch/updates/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TranslateBatchUpdates'],
    }),
  }),
})

const {
  useTranslateBatchUpdatesQuery,
  useTranslateBatchUpdateDismissMutation,
} = batchJobsApi

export { useTranslateBatchUpdatesQuery, useTranslateBatchUpdateDismissMutation }
