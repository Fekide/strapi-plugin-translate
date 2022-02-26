module.exports = {
  name: 'Unit test',
  // setupFilesAfterEnv: ['<rootDir>/test/unit.setup.js'],
  transform: {},
  coverageDirectory: './coverage/',
  collectCoverage: true,
  // collectCoverageFrom: ['./admin/src/**/*.(js|jsx)', './server/**/*.(js|jsx)'],
  testMatch: ['**/__tests__/?(*.)+(spec|test).js'],
}
