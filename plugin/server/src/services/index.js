import batchTranslateJob from './batch-translate-job.js';
import chunks from './chunks.js';
import provider from './provider.js';
import translate from './translate.js';
import untranslated from './untranslated.js';
import format from './format.js';
import updatedEntry from './updated-entry.js';

export default {
  'batch-translate-job': batchTranslateJob,
  provider,
  translate,
  untranslated,
  chunks,
  format,
  'updated-entry': updatedEntry,
};
