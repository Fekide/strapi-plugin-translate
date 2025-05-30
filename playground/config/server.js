module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
  keys: ['miClaveSuperSecreta1', 'miClaveSuperSecreta2'],
  },
})
