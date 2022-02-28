module.exports = (body) => {
  return {
    request: {
      body,
    },
    badRequest: jest.fn(),
    notFound: jest.fn(),
    forbidden: jest.fn(),
    notFound: jest.fn(),
    payloadTooLarge: jest.fn(),
    uriTooLong: jest.fn(),
    tooManyRequests: jest.fn(),
    paymentRequired: jest.fn(),
    internalServerError: jest.fn(),
  }
}
