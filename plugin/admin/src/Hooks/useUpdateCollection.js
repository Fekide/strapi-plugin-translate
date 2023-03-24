import { useState, useEffect } from 'react'
import { request } from '@strapi/helper-plugin'
import pluginId from '../pluginId'
import getTrad from '../utils/getTrad'
import useAlert from './useAlert'

export function useUpdateCollection() {
  const [updates, setUpdates] = useState([])
  const [refetchIndex, setRefetchIndex] = useState(true)

  const { handleNotification } = useAlert()

  const refetch = () => setRefetchIndex((prevRefetchIndex) => !prevRefetchIndex)

  const fetchUpdates = async () => {
    const { data, error } = await request(
      `/${pluginId}/batch-update/updates/`,
      {
        method: 'GET',
      }
    )

    if (error) {
      handleNotification({
        type: 'warning',
        id: error.message,
        defaultMessage: 'Failed to fetch Updates',
        link: error.link,
      })
    } else if (Array.isArray(data)) {
      setUpdates(data)
    }
  }

  const dismissUpdates = async (ids) => {
    for (const id of ids) {
      const { error } = await request(
        `/${pluginId}/batch-update/dismiss/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (error) {
        handleNotification({
          type: 'warning',
          id: error.message,
          defaultMessage: 'Failed to dismiss Update',
          link: error.link,
        })
      }
    }

    refetch()
  }

  const startUpdate = async (ids, sourceLocale) => {
    const { error } = await request(`/${pluginId}/batch-update`, {
      method: 'POST',
      body: {
        updatedEntryIDs: ids,
        sourceLocale,
      },
    })

    if (error) {
      handleNotification({
        type: 'warning',
        id: error.message,
        defaultMessage: 'Failed to translate collection',
        link: error.link,
      })
    } else {
      refetch()
      handleNotification({
        type: 'success',
        id: getTrad('batch-translate.start-success'),
        defaultMessage: 'Request to translate content-type was successful',
        blockTransition: false,
      })
    }
  }

  useEffect(() => {
    fetchUpdates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchIndex])

  return {
    updates,
    dismissUpdates,
    startUpdate,
    refetch,
    handleNotification,
  }
}

export default useUpdateCollection
