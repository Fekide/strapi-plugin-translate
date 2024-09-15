import { useState, useEffect } from 'react'
import { getTranslation } from '../utils/getTranslation'
import useAlert from './useAlert'
import { isFetchError } from '@strapi/strapi/admin'
import { useContentTypesTranslationReportQuery } from '../services/report'

export function useCollection() {
  const [realTimeReports, setRealTimeReports] = useState(false)

  const { handleNotification } = useAlert()

  const unkownError = () =>
    handleNotification({
      type: 'danger',
      id: getTranslation('errors.unknown-error'),
      defaultMessage: 'Unknown error occured',
    })

  const {
    data: report,
    refetch: refetchReport,
    error: reportError,
  } = useContentTypesTranslationReportQuery(
    {},
    { pollingInterval: realTimeReports ? 1000 : 0 }
  )

  useEffect(() => {
    if (reportError) {
      console.log('report', reportError)
      if (isFetchError(reportError)) {
        handleNotification({
          type: 'warning',
          id: reportError.message,
          defaultMessage: 'Failed to fetch Collections',
        })
      } else unkownError()
    } else {
      console.log('report', report)
    }
  }, [reportError, report])

  // const fetchCollections = async () => {
  //   try {
  //     const { data } = await get(`/${PLUGIN_ID}/batch-translate/content-types/`)
  //     const isTranslating = data.contentTypes.find(
  //       (col) =>
  //         !!Object.keys(col.localeReports).find((locale) =>
  //           ['created', 'setup', 'running'].includes(
  //             col.localeReports[locale].job?.status
  //           )
  //         )
  //     )

  //     if (!isTranslating) setRealTimeReports(false)
  //     else setRealTimeReports(true)

  //     setCollections(data.contentTypes)
  //     setLocales(data.locales)
  //   } catch (error) {
  //     if (isFetchError(error)) {
  //       handleNotification({
  //         type: 'warning',
  //         id: error.message,
  //         defaultMessage: 'Failed to fetch Collections',
  //       })
  //     }
  //   }
  // }

  // const translateCollection = async ({
  //   contentType,
  //   sourceLocale,
  //   targetLocale,
  //   autoPublish,
  // }) => {
  //   try {
  //     await post(`/${PLUGIN_ID}/batch-translate`, {
  //       body: {
  //         contentType,
  //         sourceLocale,
  //         targetLocale,
  //         autoPublish,
  //       },
  //     })
  //     refetchCollection()
  //     handleNotification({
  //       type: 'success',
  //       id: getTranslation('batch-translate.start-success'),
  //       defaultMessage: 'Request to translate content-type was successful',
  //       blockTransition: false,
  //     })
  //   } catch (error) {
  //     if (isFetchError(error)) {
  //       handleNotification({
  //         type: 'warning',
  //         id: error.message,
  //         defaultMessage: 'Failed to translate collection',
  //       })
  //     } else {
  //       unkownError()
  //     }
  //   }
  // }

  // const pauseTranslation = async ({ jobID }) => {
  //   try {
  //     await get(`/${PLUGIN_ID}/batch-translate/pause/${jobID}`)
  //     refetchCollection()
  //     handleNotification({
  //       type: 'success',
  //       id: getTranslation('batch-translate.pause-success'),
  //       defaultMessage: 'Successfully paused translation',
  //       blockTransition: false,
  //     })
  //   } catch (error) {
  //     if (isFetchError(error)) {
  //       handleNotification({
  //         type: 'warning',
  //         id: error.message,
  //         defaultMessage: 'Failed to pause translation',
  //       })
  //     } else {
  //       unkownError()
  //     }
  //   }
  // }

  // const resumeTranslation = async ({ jobID }) => {
  //   try {
  //     await get(`/${PLUGIN_ID}/batch-translate/resume/${jobID}`)
  //     refetchCollection()
  //     handleNotification({
  //       type: 'success',
  //       id: getTranslation('batch-translate.resume-success'),
  //       defaultMessage: 'Successfully resumed translation',
  //       blockTransition: false,
  //     })
  //   } catch (error) {
  //     if (isFetchError(error)) {
  //       handleNotification({
  //         type: 'warning',
  //         id: error.message,
  //         defaultMessage: 'Failed to resume translation',
  //       })
  //     } else {
  //       unkownError()
  //     }
  //   }
  // }

  // const cancelTranslation = async ({ jobID }) => {
  //   try {
  //     get(`/${PLUGIN_ID}/batch-translate/cancel/${jobID}`)
  //     refetchCollection()
  //     handleNotification({
  //       type: 'success',
  //       id: getTranslation('batch-translate.cancel-success'),
  //       defaultMessage: 'Successfully cancelled translation',
  //       blockTransition: false,
  //     })
  //   } catch (error) {
  //     if (isFetchError(error)) {
  //       handleNotification({
  //         type: 'warning',
  //         id: error.message,
  //         defaultMessage: 'Failed to cancel translation',
  //       })
  //     } else {
  //       unkownError()
  //     }
  //   }
  // }

  // useEffect(() => {
  //   fetchCollections()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [refetchIndex])

  // Start refreshing the collections when a collection is being indexed
  // useEffect(() => {
  //   let interval: NodeJS.Timer | undefined

  //   if (realTimeReports) {
  //     interval = setInterval(() => {
  //       refetchCollection()
  //     }, 1000)
  //   }

  //   return () => clearInterval(interval)
  // }, [realTimeReports])

  return {
    collections: report?.data?.contentTypes || [],
    locales: report?.data?.locales || [],
    // translateCollection,
    // pauseTranslation,
    // resumeTranslation,
    // cancelTranslation,
    refetchCollection: refetchReport,
    handleNotification,
    setRealTimeReports,
  }
}

export default useCollection
