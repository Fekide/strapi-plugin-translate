module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'Q2F0cyBhcmUgYXdlc29tZSEhISEhISEhIQ=='),
  },
  rateLimit: {
    enabled: false,
  },
  watchIgnoreFiles: ['./cypress/**/*'],
})
