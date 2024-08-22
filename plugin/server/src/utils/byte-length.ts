'use strict'

/**
 * Calculate the length of a string in byte when it is encoded using `encodeURI`
 * @param {string} string String to get the byte length for
 * @returns The length of the string in bytes when encoded using `encodeURI`
 */
export function stringByteLength(string) {
  return Buffer.byteLength(string, 'utf8')
}

export function stringByteLengthEncoded(string) {
  return stringByteLength(encodeURI(string))
}

