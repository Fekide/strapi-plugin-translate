export interface FormatService {
    markdownToHtml(text: string | string[]): string | string[]
    htmlToMarkdown(text: string | string[]): string | string[]
  }