import { Schema } from '@strapi/strapi'

export interface FormatService {
  markdownToHtml(text: string | string[]): string | string[]
  htmlToMarkdown(text: string | string[]): string | string[]
  blockToHtml(
    block: Schema.Attribute.BlocksValue | Schema.Attribute.BlocksValue[]
  ): Promise<string | string[]>
  htmlToBlock(
    html: string | string[]
  ): Promise<Schema.Attribute.BlocksValue | Schema.Attribute.BlocksValue[]>
}
