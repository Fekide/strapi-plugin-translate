/**
 * Calculate the length of a string in byte when it is encoded using `encodeURI`
 * @param {string} str String to get the byte length for
 * @returns The length of the string in bytes when encoded using `encodeURI`
 */
export function stringByteLength(str: string) {
  return Buffer.byteLength(str, 'utf8')
}

export function stringByteLengthEncoded(str: string) {
  return stringByteLength(encodeURI(str))
}
