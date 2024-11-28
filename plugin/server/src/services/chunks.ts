import { ChunksService, SplitFunction } from '@shared/services/chunks'
import { stringByteLengthEncoded } from '../utils/byte-length'

/**
 * Splits the given array of strings into chunks a maximum length
 * and each chunk being at most a specific byte size.
 *
 */
const splitTextArray: SplitFunction = (
  textArray,
  { maxLength, maxByteSize }
) => {
  // Information about how to join chunks back together
  const reduceInformation = []

  const chunkedText = [[]]
  // The index of the current Chunk
  let chunkIndex = 0
  // The total byte length of the current chunk (only the text)
  let currentChunkByteLength = 0

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
  textArray.forEach((textField) => {
    const fieldByteLength = stringByteLengthEncoded(textField)
    if (maxByteSize && fieldByteLength > maxByteSize) {
      strapi.log.warn(
        'There is a field being translated, that is itself longer than the maxByteSize parameter. ' +
          'This may result in issues because the field content needs to be split into multiple requests!' +
          'Splitting is currently achieved by splitting at one or multiple new lines and joining back together with one new line.'
      )

      // FIXME: Splitting at multiple newlines might be breaking content layout
      const splitTextField = textField.split(/\n+/)

      // Recursively call this method to split the array into chunks of appropriate length and size
      const { chunks } = splitTextArray(splitTextField, {
        maxLength,
        maxByteSize,
      })

      if (chunkedText[chunkIndex].length === 0) {
        // When we are at the beginning or after another too big field, there will be a new empty chunk
        chunkedText.pop()
      } else {
        // If the current chunk is not empty, strings were added that were not too long. So the next chunk must be selected
        reduceInformation.push({ type: 'append', index: chunkIndex })
        chunkIndex++
      }

      // Add the splitted chunks and add the information that these need to be joined together
      chunkedText.push(...chunks)
      reduceInformation.push({
        type: 'join',
        from: chunkIndex,
        to: chunkIndex + chunks.length,
      })
      chunkIndex += chunks.length - 1
      nextChunk()
    } else {
      if (
        (maxLength && chunkedText[chunkIndex].length >= maxLength) ||
        (maxByteSize && currentChunkByteLength + fieldByteLength >= maxByteSize)
      ) {
        reduceInformation.push({ type: 'append', index: chunkIndex })
        nextChunk()
      }
      currentChunkByteLength += fieldByteLength
      chunkedText[chunkIndex].push(textField)
    }
  })

  if (chunkedText[chunkIndex].length === 0) {
    // Pop the last empty chunk if the last text was too large
    chunkedText.pop()
  } else {
    // Otherwise the last chunk needs to be appended
    reduceInformation.push({ type: 'append', index: chunkIndex })
  }

  const reduceFunction = (translationResults) => {
    return reduceInformation.reduce((prev, { type, ...props }) => {
      if (type === 'append' && 'index' in props) {
        // Just concatenate the translation texts in the append case
        return prev.concat(translationResults[props.index])
      } else if (type === 'join' && 'from' in props && 'to' in props) {
        const joinedText = translationResults
          // Get all of the relevant chunks for joining
          .slice(props.from, props.to)
          // Get the translations
          .flat()
          .reduce((prev, cur) => {
            // FIXME: Adding the texts back together with only a new line might be breaking content layout
            return prev ? prev + '\n' + cur : cur
          }, '')
        return prev.concat(joinedText)
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

  return { chunks: chunkedText, reduceFunction }
}

export default (): ChunksService => ({
  split: splitTextArray,
})
