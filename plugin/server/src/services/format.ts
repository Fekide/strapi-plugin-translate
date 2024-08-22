'use strict'

import { Converter } from 'showdown'
import { JSDOM } from 'jsdom'

const dom = new JSDOM()
const showdownConverter = new Converter({
  noHeaderId: true,
  strikethrough: true,
})

function markdownToHtml(singleText) {
  return showdownConverter.makeHtml(singleText)
}

function htmlToMarkdown(singleText) {
  return showdownConverter
    .makeMarkdown(singleText, dom.window.document)
    .replace(/<!-- -->\n/g, '')
    .trim()
}

export default () => ({
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
