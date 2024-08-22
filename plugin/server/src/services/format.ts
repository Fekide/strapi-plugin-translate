import { Converter } from 'showdown'
import { JSDOM } from 'jsdom'

const dom = new JSDOM()
const showdownConverter = new Converter({
  noHeaderId: true,
  strikethrough: true,
})

function markdownToHtml(singleText: string): string {
  return showdownConverter.makeHtml(singleText)
}

function htmlToMarkdown(singleText: string): string {
  return showdownConverter
    .makeMarkdown(singleText, dom.window.document)
    .replace(/<!-- -->\n/g, '')
    .trim()
}

export interface FormatService {
  markdownToHtml(text: string | string[]): string | string[]
  htmlToMarkdown(text: string | string[]): string | string[]
}

export default (): FormatService => ({
  markdownToHtml(text) {
    if (Array.isArray(text)) {
      return text.map(markdownToHtml)
    }
    return markdownToHtml(text)
  },
  htmlToMarkdown(text) {
    if (Array.isArray(text)) {
      return text.map(htmlToMarkdown)
    }
    return htmlToMarkdown(text)
  },
})
