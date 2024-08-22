import _ from 'lodash'

export const flatten_and_compact = (arr) => _.compact(_.flattenDeep(arr))

