import {
    ContentTypesTranslationReport,
  } from '@shared/contracts/translate'
  import { translateApi } from './api'
  
  const translationApi = translateApi.injectEndpoints({
    endpoints: (build) => ({
      contentTypesTranslationReport: build.query<
      ContentTypesTranslationReport.Response,
      ContentTypesTranslationReport.Request['body']
      >({
        query: () => ({ url: `/translate/report`, method: 'GET', }),
      }),
    }),
  })
  
  const { useContentTypesTranslationReportQuery } = translationApi
  
  export { useContentTypesTranslationReportQuery }
  