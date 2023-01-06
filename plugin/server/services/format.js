'use strict'

const showdown = require('showdown')
const jsdom = require('jsdom')

const dom = new jsdom.JSDOM()
const showdownConverter = new showdown.Converter({
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

module.exports = () => ({
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
