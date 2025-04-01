import { Data, Modules, UID } from '@strapi/strapi'

export interface UntranslatedService {
  getUntranslatedEntity<TSchemaUID extends UID.ContentType>(
    params: { uid: TSchemaUID; targetLocale: string; sourceLocale: string },
    options: { populate: Modules.Documents.Params.Populate.Any<TSchemaUID> }
  ): Promise<Modules.Documents.Document<TSchemaUID>>
  getUntranslatedDocumentIDs(params: {
    uid: UID.ContentType
    targetLocale: string
    sourceLocale: string
  }): Promise<Data.DocumentID[]>
}
