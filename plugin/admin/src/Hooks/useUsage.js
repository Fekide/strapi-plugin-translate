import { useState, useEffect } from 'react'
import { request } from '@strapi/helper-plugin'
import pluginId from '../pluginId'
import useAlert from './useAlert'

export function useCollection() {
  const [usage, setUsage] = useState([])
  const [error, setError] = useState(undefined)
  const [refetchIndex, setRefetchIndex] = useState(true)
  const { handleNotification } = useAlert()

  const refetch = () => setRefetchIndex((prevRefetchIndex) => !prevRefetchIndex)

  const fetchUsage = async () => {
    const { data, error } = await request(`/${pluginId}/usage`, {
      method: 'GET',
    })

    if (error) {
      setError(error)
      handleNotification({
        type: 'warning',
        id: error.message,
        defaultMessage: 'Failed to fetch Usage',
        link: error.link,
      })
    } else {
      setError(undefined)
      setUsage(data)
    }
  }

  const estimateUsageForCollection = async ({
    contentType,
    sourceLocale,
    targetLocale,
  }) => {
    const { error, data } = await request(
      `/${pluginId}/usage/estimateCollection`,
      {
        method: 'POST',
        body: {
          contentType,
          sourceLocale,
          targetLocale,
        },
      }
    )

    if (error) {
      handleNotification({
        type: 'warning',
        id: error.message,
        defaultMessage: 'Failed to estimate usage',
        link: error.link,
      })
    }

    return data
  }

  const estimateUsage = async ({ id, contentTypeUid, sourceLocale }) => {
    const { error, data } = await request(`/${pluginId}/usage/estimate`, {
      method: 'POST',
      body: {
        id,
        contentTypeUid,
        sourceLocale,
      },
    })

    if (error) {
      handleNotification({
        type: 'warning',
        id: error.message,
        defaultMessage: 'Failed to estimate usage',
        link: error.link,
      })
    }

    return data
  }

  useEffect(() => {
    fetchUsage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchIndex])

  return {
    hasUsageInformation:
      typeof usage?.count === 'number' && typeof usage?.limit === 'number',
    usage,
    error,
    refetch,
    handleNotification,
    estimateUsage,
    estimateUsageForCollection,
  }
}

export default useCollection
