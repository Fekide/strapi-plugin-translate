import { TranslateProviderUsage } from '@shared/contracts/provider'
import {
  UsageEstimate,
  UsageEstimateCollection,
} from '@shared/contracts/translate'
import { translateApi } from './api'

const usageApi = translateApi.injectEndpoints({
  endpoints: (build) => ({
    providerUsage: build.query<
      TranslateProviderUsage.Response,
      TranslateProviderUsage.Request['body']
    >({
      transformResponse: (response, meta, arg) => {
        console.log({ response, meta, arg })
        return response as TranslateProviderUsage.Response
      },
      providesTags: ['TranslateProviderUsage'],
      query: () => ({ url: `/translate/usage`, method: 'GET' }),
    }),
    estimateUsage: build.query<
      UsageEstimate.Response,
      UsageEstimate.Request['body']
    >({
      query: (data) => ({
        url: `/translate/usage/estimate`,
        method: 'POST',
        data,
      }),
      providesTags: (_result, _error, arg) => [
        {
          type: 'TranslateUsageEstimate',
          id: `${arg.contentType}_${arg.documentId}_${arg.sourceLocale}`,
        },
      ],
    }),
    estimateUsageCollection: build.query<
      UsageEstimateCollection.Response,
      UsageEstimateCollection.Request['body']
    >({
      query: (data) => ({
        url: `/translate/usage/estimate-collection`,
        method: 'POST',
        data,
      }),
      providesTags: (_result, _error, arg) => [
        {
          type: 'TranslateUsageEstimate',
          id: `${arg.contentType}_${arg.sourceLocale}_${arg.targetLocale}`,
        },
      ],
    }),
  }),
  overrideExisting: false,
})

const {
  useProviderUsageQuery,
  useLazyEstimateUsageQuery,
  useLazyEstimateUsageCollectionQuery,
} = usageApi

console.log('usageApi.endpoints', usageApi.endpoints)

export {
  useProviderUsageQuery,
  useLazyEstimateUsageQuery,
  useLazyEstimateUsageCollectionQuery,
}
