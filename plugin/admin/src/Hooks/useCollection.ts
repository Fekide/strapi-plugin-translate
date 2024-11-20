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
      if (isFetchError(reportError)) {
        handleNotification({
          type: 'warning',
          id: reportError.message,
          defaultMessage: 'Failed to fetch Collections',
        })
      } else unkownError()
    }
  }, [reportError])

  // If a job in the report is in progress, set realTimeReports to true
  useEffect(() => {
    if (report) {
      const isTranslating = report.data?.contentTypes.find(
        (col) =>
          !!Object.keys(col.localeReports).find((locale) =>
            ['created', 'setup', 'running'].includes(
              col.localeReports[locale].job?.status
            )
          )
      )

      if (!isTranslating) setRealTimeReports(false)
      else setRealTimeReports(true)
    }
  }, [report])

  // Start refreshing the collections when a collection is being indexed
  useEffect(() => {
    let interval: NodeJS.Timer | undefined

    if (realTimeReports) {
      interval = setInterval(() => {
        refetchReport()
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [realTimeReports])

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
