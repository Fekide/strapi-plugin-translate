'use strict'

const { setupServer } = require('msw/node')
const { http, HttpResponse } = require('msw')

function createJsonEndpoint(path, response) {
  return http.get(path, (info) =>
    HttpResponse.json(response(info), {status: 200})
  )
}

function createQueryJsonEndpoint(path, queryResponseMap) {
  return http.get(path, ({request}) => {
    const response = queryResponseMap[request.url.search]
    if (!response) {
      console.warn(
        `API call ${request.url.toString()} doesn't have a query handler.`
      )
      return new HttpResponse(null, {status: 404})
    }

    return HttpResponse.json(response,{status: 200})
  })
}

function createTextEndpoint(path, response) {
  return http.get(path, () =>
    HttpResponse.text(response, {status: 200})
  )
}

const notFoundByDefault = http.get(/.*/, ({request}) => {
  console.warn(
    `API call ${request.url.toString()} doesn't have a query handler.`
  )
  return new HttpResponse(null,  {status: 404})
})

function getServer(...handlers) {
  const server = setupServer(...handlers, notFoundByDefault)
  server.listen()
  return server
}

module.exports = {
  createJsonEndpoint,
  createQueryJsonEndpoint,
  createTextEndpoint,
  getServer,
}
