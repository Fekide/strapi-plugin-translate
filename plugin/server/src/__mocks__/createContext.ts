import { jest } from '@jest/globals'
import { Context } from 'koa'

export default (body: unknown, query?: unknown): Context => {
  return {
    body: {},
    request: {
      body,
    },
    query,
    badRequest: jest.fn(),
    notFound: jest.fn(),
    forbidden: jest.fn(),
    payloadTooLarge: jest.fn(),
    uriTooLong: jest.fn(),
    tooManyRequests: jest.fn(),
    paymentRequired: jest.fn(),
    internalServerError: jest.fn(),
  } as any as Context
}
