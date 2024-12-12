import _ from 'lodash'

export const flatten_and_compact = <T>(
  arr: _.ListOfRecursiveArraysOrValues<T>
) => _.compact(_.flattenDeep(arr))
