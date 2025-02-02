import { useState } from 'react'
import useAlert from './useAlert'
import {
  useLazyEstimateUsageCollectionQuery,
  useLazyEstimateUsageQuery,
  useProviderUsageQuery,
} from '../services/usage'
import { TranslateProviderUsageResult } from '@shared/types/provider'

export function useUsage() {
  const { data: usage, error, refetch, isLoading } = useProviderUsageQuery({})
  const { handleNotification } = useAlert()

  const [estimateUsage, { data: estimateUsageResult }] =
    useLazyEstimateUsageQuery({})
  const [
    estimateUsageForCollection,
    { data: estimateUsageForCollectionResult },
  ] = useLazyEstimateUsageCollectionQuery({})

  // const estimateUsageForCollection = async ({
  //   contentType,
  //   sourceLocale,
  //   targetLocale,
  // }) => {
  //   const { error, data } = await request(
  //     `/${pluginId}/usage/estimateCollection`,
  //     {
  //       method: 'POST',
  //       body: {
  //         contentType,
  //         sourceLocale,
  //         targetLocale,
  //       },
  //     }
  //   )

  //   if (error) {
  //     handleNotification({
  //       type: 'warning',
  //       id: error.message,
  //       defaultMessage: 'Failed to estimate usage',
  //       link: error.link,
  //     })
  //   }

  //   return data
  // }

  // const estimateUsage = async ({ id, contentTypeUid, sourceLocale }) => {
  //   const { error, data } = await request(`/${pluginId}/usage/estimate`, {
  //     method: 'POST',
  //     body: {
  //       id,
  //       contentTypeUid,
  //       sourceLocale,
  //     },
  //   })

  //   if (error) {
  //     handleNotification({
  //       type: 'warning',
  //       id: error.message,
  //       defaultMessage: 'Failed to estimate usage',
  //       link: error.link,
  //     })
  //   }

  //   return data
  // }

  return {
    usage: usage?.data,
    error,
    isLoading,
    refetch,
    handleNotification,
    estimateUsage,
    estimateUsageForCollection,
    estimateUsageResult: estimateUsageResult?.data,
    estimateUsageForCollectionResult: estimateUsageForCollectionResult?.data,
  }
}

export default useUsage
