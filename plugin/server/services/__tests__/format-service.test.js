'use strict'

const block = require('./block.json')

const markdown = `# Turndown Demo

This demonstrates [turndown](<https://github.com/mixmark-io/turndown>) \\- an HTML to Markdown converter in JavaScript.

## Usage

\`\`\`js
var turndownService = new TurndownService()
console.log(
  turndownService.turndown('<h1>Hello world</h1>')
)
\`\`\`

---

It aims to be [CommonMark](<http://commonmark.org/>) compliant, and includes options to style the output. These options include:

- headingStyle (setext or atx)
- horizontalRule (\\*, -, or \\_)
- bullet (\\*, -, or +)
- codeBlockStyle (indented or fenced)


List is separated

- fence (\\\` or \\~)
- emDelimiter (\\_ or \\*)
- strongDelimiter (\\*\\* or \\_\\_)
- linkStyle (inlined or referenced)
- linkReferenceStyle (full, collapsed, or shortcut)


End of Document`

const html = `<h1>Turndown Demo</h1>
<p>This demonstrates <a href="https://github.com/mixmark-io/turndown">turndown</a> - an HTML to Markdown converter in JavaScript.</p>
<h2>Usage</h2>
<pre><code class="js language-js">var turndownService = new TurndownService()
console.log(
  turndownService.turndown('&lt;h1&gt;Hello world&lt;/h1&gt;')
)
</code></pre>
<hr />
<p>It aims to be <a href="http://commonmark.org/">CommonMark</a> compliant, and includes options to style the output. These options include:</p>
<ul>
<li>headingStyle (setext or atx)</li>
<li>horizontalRule (*, -, or _)</li>
<li>bullet (*, -, or +)</li>
<li>codeBlockStyle (indented or fenced)</li>
</ul>
<p>List is separated</p>
<ul>
<li>fence (\` or ~)</li>
<li>emDelimiter (_ or *)</li>
<li>strongDelimiter (** or __)</li>
<li>linkStyle (inlined or referenced)</li>
<li>linkReferenceStyle (full, collapsed, or shortcut)</li>
</ul>
<p>End of Document</p>`

const setup = function (params) {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(params),
    writable: true,
  })
}

beforeEach(() => {
  setup({})
})

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('format', () => {
  test('markdown to html', () => {
    expect(
      strapi.service('plugin::translate.format').markdownToHtml(markdown)
    ).toEqual(html)
  })
  test('markdown to html in list', () => {
    expect(
      strapi.service('plugin::translate.format').markdownToHtml([markdown])
    ).toEqual([html])
  })
  test('html to markdown in list', () => {
    expect(
      strapi.service('plugin::translate.format').htmlToMarkdown(html)
    ).toEqual(markdown)
    expect(
      strapi.service('plugin::translate.format').htmlToMarkdown([html])
    ).toEqual([markdown])
  })
  test('html to markdown and back', () => {
    const formatService = strapi.service('plugin::translate.format')
    expect(
      formatService.markdownToHtml(formatService.htmlToMarkdown(html))
    ).toEqual(html)
  })
  test('markdown to html and back', () => {
    const formatService = strapi.service('plugin::translate.format')
    expect(
      formatService.htmlToMarkdown(formatService.markdownToHtml(markdown))
    ).toEqual(markdown)
  })
  test('block to html and back', async () => {
    const formatService = strapi.service('plugin::translate.format')
    const html = await formatService.blockToHtml(block)
    await expect(
      formatService.htmlToBlock(html)
    ).resolves.toEqual(block)
  })
})
