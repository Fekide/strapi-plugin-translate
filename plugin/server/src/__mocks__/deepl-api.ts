import { jest } from '@jest/globals'
export function createMock(translatedText: string) {
  return {
    translate(props: { text: string | string[] }) {
      if (Array.isArray(props.text)) {
        return {
          translations: props.text.map((t) => ({
            detected_source_language: 'EN',
            text: translatedText,
          })),
        }
      } else if (props.text) {
        return {
          translations: [
            { detected_source_language: 'EN', text: translatedText },
          ],
        }
      } else {
        return { translations: [] }
      }
    },
    parseLocale: jest.fn(),
  }
}
