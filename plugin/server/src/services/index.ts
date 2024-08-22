import batchTranslateJob from './batch-translate-job'
import chunks from './chunks'
import provider from './provider'
import translate from './translate'
import untranslated from './untranslated'
import format from './format'
import updatedEntry from './updated-entry'

export default {
  'batch-translate-job': batchTranslateJob,
  provider,
  translate,
  untranslated,
  chunks,
  format,
  'updated-entry': updatedEntry,
}
