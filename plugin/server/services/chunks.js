'use strict'

const { stringByteLengthEncoded } = require('../utils/byte-length')

/**
 * Splits the given array of strings into chunks a maximum length
 * and each chunk being at most a specific byte size.
 *
 * @param {string[]} textArray
 * @param {{maxLength?: number, maxByteSize?: number} | undefined}  options Configuration options
 * @returns { { chunks: string[][], reduceFunction: () => string[] }  }
 */
function splitTextArray(textArray, { maxLength, maxByteSize } = {}) {
  // Information about how to join chunks back together
  const reduceInformation = []

  const chunkedText = [[]]
  // The index of the current Chunk
  let chunkIndex = 0
  // The total byte length of the current chunk (only the text)
  let currentChunkByteLength = 0

  let txtIndex = 0

  // Utility to progress to the next chunk
  const nextChunk = () => {
    chunkIndex++
    currentChunkByteLength = 0
    chunkedText.push([])
  }

  // Iterate over all texts and decide if:
  // - the string can be added to the current chunk
  // - the string needs to be added to a new chunk
  // - the string itself is too big and needs to be split before it can be put into chunks
  const stack = textArray.map((text) => ({ text, info: { original: true } }))
  while (stack.length > 0) {
    const { text: textField, info } = stack.shift()

    const fieldByteLength = stringByteLengthEncoded(textField)
    if (maxByteSize && fieldByteLength > maxByteSize) {
      strapi.log.warn(
        'There is a field being translated, that is itself longer than the maxByteSize parameter. ' +
          'This may result in issues because the field content needs to be split into multiple requests!' +
          'Splitting is currently achieved by splitting at one or multiple new lines and joining back together with one new line.'
      )

      let splitTextField
      let joinChar = '\n'
      let splitChar

      if (textField.includes('\n')) {
        // FIXME: Splitting at multiple newlines might be breaking content layout
        splitTextField = textField.split(/\n+/)
      } else if (textField.includes('. ')) {
        splitChar = '.'
      } else if (textField.includes('? ')) {
        splitChar = '?'
      } else if (textField.includes('! ')) {
        splitChar = '!'
      }

      if (splitChar) {
        // If there are no new lines try to split at sentence endings
        joinChar = ' '
        const regex = new RegExp(`\\${splitChar} `)
        splitTextField = textField.split(regex).map((sentence, index, arr) => {
          // Re-add the delimiter to the sentence except for the last one
          return sentence + (index + 1 < arr.length ? splitChar : '')
        })
      }

      // final sanity check
      if (!splitTextField || splitTextField.length === 1) {
        strapi.log.warn(
          'The field being translated is too long and could not be split at new lines or sentence endings. ' +
            'This may result in issues because the field content needs to be split into multiple requests!' +
            'The field will be split in half which will break sentences.'
        )
        const whitespace_closest_to_half = textField
          .split('')
          .reduce((prev, curr, index) => {
            if (curr === ' ') {
              if (
                Math.abs(textField.length / 2 - index) <
                Math.abs(textField.length / 2 - prev)
              ) {
                return index
              }
            }
            return prev
          }, 0)

        splitTextField = [
          textField.slice(0, whitespace_closest_to_half),
          textField.slice(whitespace_closest_to_half),
        ]
        joinChar = ''
      }

      stack.unshift(
        ...splitTextField.map((part, idx) => ({
          text: part,
          info: {
            ...info,
            original: false,
            startNewText:
              idx === 0 && (info.original === true || info.startNewText),
            joinChar: idx === 0 ? info.joinChar ?? joinChar : joinChar,
          },
        }))
      )
    } else {
      if (
        (maxLength && chunkedText[chunkIndex].length >= maxLength) ||
        (maxByteSize && currentChunkByteLength + fieldByteLength >= maxByteSize)
      ) {
        nextChunk()
      }
      currentChunkByteLength += fieldByteLength
      chunkedText[chunkIndex].push(textField)
      reduceInformation.push({ type: 'append', index: txtIndex++, info })
    }
  }

  if (chunkedText[chunkIndex].length === 0) {
    // Pop the last empty chunk if the last text was too large
    chunkedText.pop()
  } else {
    // Otherwise the last chunk needs to be appended
    reduceInformation.push({ type: 'append', index: txtIndex++ })
  }

  const reduceFunction = (translationResults) => {
    const flatTranslations = translationResults.flat()
    return reduceInformation.reduce((prev, { type, ...props }) => {
      if (type === 'append' && 'index' in props) {
        if ('info' in props && props.info && props.info.original === false) {
          if (props.info.startNewText) {
            // This is the start of a splitted field that needs to be joined
            const joinedText = flatTranslations[props.index]
            prev.push(joinedText)
            return prev
          }
          // This was a splitted field that needs to be joined
          const joinedText = props.info.joinChar + flatTranslations[props.index]
          prev.splice(-1, 1, prev.at(-1) + joinedText)
          return prev
        }
        if (props.index >= flatTranslations.length) {
          return prev
        }
        // Just concatenate the translation texts in the append case
        return prev.concat(flatTranslations[props.index])
      } else if (type === 'join') {
        strapi.log.error('Join type is not supported anymore')
        return prev
      } else {
        throw new Error(
          `Unrecognized props for reducing: ${JSON.stringify({
            type,
            ...props,
          })}`
        )
      }
    }, [])
  }

  return {
    chunks: chunkedText,
    reduceFunction,
    reduceInformation,
  }
}

module.exports = () => ({
  split: splitTextArray,
})
