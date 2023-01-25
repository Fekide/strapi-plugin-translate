import { useState, useEffect } from 'react'
import { request } from '@strapi/helper-plugin'
import pluginId from '../pluginId'
import useAlert from './useAlert'

export function useCollection() {
  const [usage, setUsage] = useState([])
  const [refetchIndex, setRefetchIndex] = useState(true)
  const { handleNotification } = useAlert()

  const refetch = () => setRefetchIndex((prevRefetchIndex) => !prevRefetchIndex)

  const fetchUsage = async () => {
    const { data, error } = await request(`/${pluginId}/usage`, {
      method: 'GET',
    })

    if (error) {
      handleNotification({
        type: 'warning',
        id: error.message,
        defaultMessage: 'Failed to fetch Usage',
        link: error.link,
      })
    } else {
      setUsage(data)
    }
  }

  useEffect(() => {
    fetchUsage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchIndex])

  return {
    usage,
    refetch,
    handleNotification,
  }
}

export default useCollection
