import { useState, useEffect } from 'react'
import { request } from '@strapi/helper-plugin'
import pluginId from '../pluginId'
import useAlert from './useAlert'
import getTrad from '../utils/getTrad'

export function useCollection() {
  const [collections, setCollections] = useState([])
  const [locales, setLocales] = useState([])
  const [refetchIndex, setRefetchIndex] = useState(true)
  const [realTimeReports, setRealTimeReports] = useState(false)

  const { handleNotification } = useAlert()

  const refetchCollection = () =>
    setRefetchIndex((prevRefetchIndex) => !prevRefetchIndex)

  const fetchCollections = async () => {
    const { data, error } = await request(
      `/${pluginId}/batch-translate/content-types/`,
      {
        method: 'GET',
      }
    )

    if (error) {
      handleNotification({
        type: 'warning',
        id: error.message,
        defaultMessage: 'Failed to fetch Collections',
        link: error.link,
      })
    } else {
      const isTranslating = data.contentTypes.find(
        (col) =>
          !!Object.keys(col.localeReports).find((locale) =>
            ['created', 'setup', 'running'].includes(
              col.localeReports[locale].job?.status
            )
          )
      )

      if (!isTranslating) setRealTimeReports(false)
      else setRealTimeReports(true)

      setCollections(data.contentTypes)
      setLocales(data.locales)
    }
  }

  const translateCollection = async ({
    contentType,
    sourceLocale,
    targetLocale,
    autoPublish,
  }) => {
    const { error } = await request(`/${pluginId}/batch-translate`, {
      method: 'POST',
      body: {
        contentType,
        sourceLocale,
        targetLocale,
        autoPublish,
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
      refetchCollection()
      handleNotification({
        type: 'success',
        id: getTrad('batch-translate.start-success'),
        defaultMessage: 'Request to translate content-type was successful',
        blockTransition: false,
      })
    }
  }

  const pauseTranslation = async ({ jobID }) => {
    const { error } = await request(
      `/${pluginId}/batch-translate/pause/${jobID}`,
      {
        method: 'GET',
      }
    )
    if (error) {
      handleNotification({
        type: 'warning',
        id: error.message,
        defaultMessage: 'Failed to pause translation',
        link: error.link,
      })
    } else {
      refetchCollection()
      handleNotification({
        type: 'success',
        id: getTrad('batch-translate.pause-success'),
        defaultMessage: 'Successfully paused translation',
        blockTransition: false,
      })
    }
  }

  const resumeTranslation = async ({ jobID }) => {
    const { error } = await request(
      `/${pluginId}/batch-translate/resume/${jobID}`,
      {
        method: 'GET',
      }
    )
    if (error) {
      handleNotification({
        type: 'warning',
        id: error.message,
        defaultMessage: 'Failed to resume translation',
        link: error.link,
      })
    } else {
      refetchCollection()
      handleNotification({
        type: 'success',
        id: getTrad('batch-translate.resume-success'),
        defaultMessage: 'Successfully resumed translation',
        blockTransition: false,
      })
    }
  }

  const cancelTranslation = async ({ jobID }) => {
    const { error } = await request(
      `/${pluginId}/batch-translate/cancel/${jobID}`,
      {
        method: 'GET',
      }
    )
    if (error) {
      handleNotification({
        type: 'warning',
        id: error.message,
        defaultMessage: 'Failed to cancel translation',
        link: error.link,
      })
    } else {
      refetchCollection()
      handleNotification({
        type: 'success',
        id: getTrad('batch-translate.cancel-success'),
        defaultMessage: 'Successfully cancelled translation',
        blockTransition: false,
      })
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [refetchIndex])

  // Start refreshing the collections when a collection is being indexed
  useEffect(() => {
    let interval
    if (realTimeReports) {
      interval = setInterval(() => {
        refetchCollection()
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [realTimeReports])

  return {
    collections,
    locales,
    translateCollection,
    pauseTranslation,
    resumeTranslation,
    cancelTranslation,
    refetchCollection,
    handleNotification,
  }
}

export default useCollection
