const batchTranslateJob = require('./batch-translate-job');
const provider = require('./provider');
const translate = require('./translate');
const updatedEntry = require('./updated-entry');

module.exports = {
  'batch-translate-job': batchTranslateJob,
  provider,
  translate,
  'updated-entry': updatedEntry,
};
