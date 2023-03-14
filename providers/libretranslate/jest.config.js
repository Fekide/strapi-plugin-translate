const defaults = require('../../jest.config')

module.exports = {
  ...defaults,
  collectCoverageFrom: ['./lib/**/*.js'],
}
