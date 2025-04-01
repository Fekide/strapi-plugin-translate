export default [
  {
    method: 'POST',
    path: '/entity',
    handler: 'translate.translateEntity',
  },
  {
    method: 'POST',
    path: '/batch',
    handler: 'translate.translateBatch',
  },
  {
    method: 'GET',
    path: '/report',
    handler: 'translate.report',
  },
  {
    method: 'GET',
    path: '/batch/status:id',
    handler: 'translate.translateBatchJobStatus',
  },
  {
    method: 'POST',
    path: '/batch/pause:id',
    handler: 'translate.translateBatchPauseJob',
  },
  {
    method: 'POST',
    path: '/batch/resume:id',
    handler: 'translate.translateBatchResumeJob',
  },
  {
    method: 'POST',
    path: '/batch/cancel:id',
    handler: 'translate.translateBatchCancelJob',
  },
  {
    method: 'POST',
    path: '/batch/updates',
    handler: 'translate.translateBatchUpdate',
  },
  {
    method: 'GET',
    path: '/batch/updates',
    handler: 'updated-entry.find',
  },
  {
    method: 'DELETE',
    path: '/batch/updates/:id',
    handler: 'updated-entry.delete',
  },
  {
    method: 'POST',
    path: '/usage/estimate',
    handler: 'translate.usageEstimate',
  },
  {
    method: 'POST',
    path: '/usage/estimate-collection',
    handler: 'translate.usageEstimateCollection',
  },
]
