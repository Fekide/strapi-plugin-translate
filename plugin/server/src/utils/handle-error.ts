import type { Context } from 'koa'

export function handleContextError(
  ctx: Context,
  error: unknown,
  fallbackMessage?: string
) {
  if (typeof error === 'string') {
    strapi.log.error('Error on request: ' + error)
    return ctx.internalServerError(error)
  }
  if (error instanceof Error) {
    strapi.log.error('Error on request: ' + error.message)
    if (
      'response' in error &&
      typeof error.response === 'object' &&
      'status' in error.response &&
      error.response?.status !== undefined
    ) {
      switch (error.response.status) {
        case 400:
          return ctx.badRequest({
            message: 'translate.error.badRequest',
            error: {
              message: error.message,
            },
          })
        case 403:
          return ctx.forbidden({
            message: 'translate.error.forbidden',
            error: {
              message: error.message,
            },
          })
        case 404:
          return ctx.notFound({
            message: 'translate.error.notFound',
            error: {
              message: error.message,
            },
          })
        case 413:
          return ctx.payloadTooLarge({
            message: 'translate.error.payloadTooLarge',
            error: {
              message: error.message,
            },
          })
        case 414:
          return ctx.uriTooLong({
            message: 'translate.error.uriTooLong',
            error: {
              message: error.message,
            },
          })
        case 429:
          return ctx.tooManyRequests({
            message: 'translate.error.tooManyRequests',
            error: {
              message: error.message,
            },
          })
        case 456:
          return ctx.paymentRequired({
            message: 'translate.error.paymentRequired',
            error: {
              message: error.message,
            },
          })
        default:
          return ctx.internalServerError(error.message)
      }
    } else if (error.message) {
      return ctx.internalServerError({
        message: fallbackMessage || 'Error.internalServerError',
        error: { message: error.message },
      })
    } else {
      return ctx.internalServerError(
        fallbackMessage || 'CMEditViewTranslateLocale.translate-failure'
      )
    }
  }
}
