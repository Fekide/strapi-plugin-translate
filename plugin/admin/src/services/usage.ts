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
    }),
  }),
})

const {
  useProviderUsageQuery,
  useLazyEstimateUsageQuery,
  useLazyEstimateUsageCollectionQuery,
} = usageApi

export {
  useProviderUsageQuery,
  useLazyEstimateUsageQuery,
  useLazyEstimateUsageCollectionQuery,
}
