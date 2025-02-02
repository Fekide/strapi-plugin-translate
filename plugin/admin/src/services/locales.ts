import { GetLocales } from '@shared/contracts/locales'
import { translateApi } from './api'

const localesApi = translateApi.injectEndpoints({
  endpoints: (builder) => ({
    getI18NLocales: builder.query<GetLocales.Response, void>({
      query: () => '/i18n/locales',
      providesTags: (res) => [
        { type: 'Locale', id: 'LIST' },
        ...(Array.isArray(res)
          ? res.map((locale) => ({
              type: 'Locale' as const,
              id: locale.id,
            }))
          : []),
      ],
    }),
  }),
  overrideExisting: false,
})

export const { useGetI18NLocalesQuery } = localesApi
