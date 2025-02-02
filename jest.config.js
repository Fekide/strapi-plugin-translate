'use strict'

module.exports = {
  projects: [
    '<rootDir>/plugin/jest.config.js',
    '<rootDir>/providers/*/jest.config.js',
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports',
        outputName: 'jest-junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],
}
