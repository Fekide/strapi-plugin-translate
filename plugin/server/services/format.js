'use strict'

const showdown = require('showdown')
const jsdom = require('jsdom')
const renderBlock = require('blocks-html-renderer').renderBlock


const dom = new jsdom.JSDOM()
const showdownConverter = new showdown.Converter({
  noHeaderId: true,
  strikethrough: true,
})

const blocksImageCache = new Map()

function markdownToHtml(singleText) {
  return showdownConverter.makeHtml(singleText)
}

function htmlToMarkdown(singleText) {
  return showdownConverter
    .makeMarkdown(singleText, dom.window.document)
    .replace(/<!-- -->\n/g, '')
    .trim()
}

/**
 * 
 * @param {Array} blocks 
 */
function cacheImages(blocks) {
  for (const block of blocks.flat(2)) {
    if (block.type === 'image') {
      blocksImageCache.set(block.image.url, block.image)
    }
  }
}

/**
 * 
 * @param {ChildNode} childNode 
 * @returns {Array<string>}
 */
function collectFormattings(childNode) {
  if (childNode.nodeName === '#text' || childNode.childNodes.length === 0) {
    return []
  }
  if (childNode.childNodes.length > 1) {
    throw new Error('collectFormattings expects an element with a single child')
  }
  const formattings = collectFormattings(childNode.childNodes[0])
  if (childNode.tagName === 'STRONG') {
    formattings.push('bold')
  }
  if (childNode.tagName === 'EM') {
    formattings.push('italic')
  }
  if (childNode.tagName === 'U') {
    formattings.push('underline')
  }
  if (childNode.tagName === 'S') {
    formattings.push('strikethrough')
  }
  if (childNode.tagName === 'CODE') {
    formattings.push('code')
  }
  return formattings
}

/**
 * 
 * @param {HTMLElement} element 
 * @returns 
 */
function convertInlineElementToBlocks(element) {
  const elements = []
  for (const child of element.childNodes) {
    if (child.tagName === 'A') {
      elements.push({
        type: 'link',
        url: child.href,
        children: convertInlineElementToBlocks(child),
      })
      continue
    }
    try {
      const formattings = collectFormattings(child)
      const element = {
        type: 'text',
        text: child.textContent,
      }
      for (const formatting of formattings) {
        element[formatting] = true
      }
      elements.push(element)
    } catch (error) {
      strapi.log.error(`Error while converting inline element ${element.outerHTML} to blocks, falling back to no formatting`, error)
      elements.push({
        type: 'text',
        text: child.textContent,
      })
    }
  }
  if (elements.length === 0) {
    elements.push({
      type: 'text',
      text: element.textContent,
    })
  }
  return elements
}


function convertHtmlToBlock(html) {
  const root = dom.window.document.createElement('div')
  root.innerHTML = html

  const blocks = []

  for (const child of root.children) {
    if (child.tagName === 'P') {
      blocks.push({
        type: 'paragraph',
        children: convertInlineElementToBlocks(child),
      })
    }
    if (/^H[1-6]$/.test(child.tagName)) {
      const level = parseInt(child.tagName[1], 10)
      blocks.push({
        type: 'heading',
        level,
        children: convertInlineElementToBlocks(child),
      })
    }
    if (/^[UO]L$/.test(child.tagName)) {
      const listItems = Array.from(child.children).map(li => ({
        type: 'list-item',
        children: convertInlineElementToBlocks(li),
      }))
      blocks.push({
        type: 'list',
        format: child.tagName === 'UL' ? 'unordered' : 'ordered',
        children: listItems,
      })
    }
    if (child.tagName === 'BLOCKQUOTE') {
      blocks.push({
        type: 'quote',
        children: convertInlineElementToBlocks(child),
      })
    }
    if (child.tagName === 'PRE') {
      // pre also has a code child
      const code = child.querySelector('code')
      blocks.push({
        type: 'code',
        children: [
          {
            type: 'text',
            text: code.textContent,
          }
        ]
      })
    }
    if (child.tagName === "IMG") {
      const image = blocksImageCache.has(child.src) ? blocksImageCache.get(child.src) : {
        url: child.src,
        alt: child.alt,
      }
      blocks.push({
        type: 'image',
        image,
        children: convertInlineElementToBlocks(child),
      })
    }
    if (child.tagName === "A") {
      blocks.push({
        type: 'link',
        url: child.href,
        children: convertInlineElementToBlocks(child),
      })
    }
  }
  return blocks
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
  blockToHtml(block) {
    if (!Array.isArray(block)) {
      throw new Error('blockToHtml expects an array of blocks or a single block. Got ' + typeof block)
    }
    cacheImages(block)
    if (block.length > 0 ) {
      if (!block[0].type) {
        return block.map(renderBlock)
      }
      return renderBlock(block)
    }
  },
  htmlToBlock(html) {
    if (Array.isArray(html)) {
      return html.map(convertHtmlToBlock)
    }
    return convertHtmlToBlock(html)
    // return html.map(h => [
    //   {
    //     type: 'paragraph',
    //     children: [
    //       {
    //         type: 'text',
    //         text: "The following HTML has been translated. It's not yet possible to convert it back to the original block structure.",
    //       }
    //     ]
    //   },
    //   {
    //     type: 'code',
    //     children: h.split('\n').map(text => ({ type: 'text', text })),
    //   }
    // ])
  },
})
