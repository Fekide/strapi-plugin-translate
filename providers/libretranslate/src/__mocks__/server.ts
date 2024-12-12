import { setupServer } from 'msw/node'
import { http, HttpHandler, HttpResponse } from 'msw'

export const notFoundByDefault = http.get(/.*/, ({ request }) => {
  console.warn(
    `API call ${request.url.toString()} doesn't have a query handler.`
  )
  return new HttpResponse(null, { status: 404 })
})

export function getServer(...handlers: HttpHandler[]) {
  const server = setupServer(...handlers, notFoundByDefault)
  server.listen()
  return server
}
