import { ContentTypesTranslationReport } from '@shared/contracts/translate'
import { translateApi } from './api'

const translationApi = translateApi.injectEndpoints({
  endpoints: (build) => ({
    contentTypesTranslationReport: build.query<
      ContentTypesTranslationReport.Response,
      ContentTypesTranslationReport.Request['body']
    >({
      query: () => ({ url: `/translate/report`, method: 'GET' }),
      providesTags: ['TranslateReport'],
    }),
  }),
})

const { useContentTypesTranslationReportQuery } = translationApi

export { useContentTypesTranslationReportQuery }
