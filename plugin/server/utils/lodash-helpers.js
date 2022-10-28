'use strict'

const _ = require('lodash')

const flatten_and_compact = (arr) => _.compact(_.flattenDeep(arr))

module.exports = { flatten_and_compact }
