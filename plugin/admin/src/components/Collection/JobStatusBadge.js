import React from 'react'
import { Badge } from '@strapi/design-system/Badge'
import { Tooltip } from '@strapi/design-system/Tooltip'
import { useIntl } from 'react-intl'
import PropTypes from 'prop-types'
import { getTrad } from '../../utils'

const JobStatusBadge = ({ job }) => {
  const { formatMessage } = useIntl()

  if (!job) {
    return null
  }

  if (
    ['created', 'setup', 'running', 'paused', 'finished'].includes(job.status)
  ) {
    return (
      <Badge
        marginLeft={1}
        textColor="neutral100"
        backgroundColor={'success500'}
      >
        {formatMessage({
          id: getTrad(`batch-translate.table.job-status.${job.status}`),
          defaultMessage: `Job ${job.status}`,
        })}
      </Badge>
    )
  }

  if (job.status === 'cancelled') {
    return (
      <Badge
        marginLeft={1}
        textColor="neutral100"
        backgroundColor={'danger500'}
      >
        {formatMessage({
          id: getTrad(`batch-translate.table.job-status.cancelled`),
          defaultMessage: `Job cancelled`,
        })}
      </Badge>
    )
  }

  let description = ''

  if (job.failureReason?.entityId) {
    description += 'ID: ' + job.failureReason.entityId + ' - '
  }

  if (job.failureReason?.message) {
    description += job.failureReason.message
  } else {
    description += formatMessage({
      id: getTrad(`errors.unknown`),
      defaultMessage: 'Unknown error',
    })
  }

  return (
    <Tooltip description={description}>
      <Badge
        marginLeft={1}
        textColor="neutral100"
        backgroundColor={'danger500'}
      >
        {formatMessage({
          id: getTrad(`batch-translate.table.job-status.${job.status}`),
          defaultMessage: `Job ${job.status}`,
        })}
      </Badge>
    </Tooltip>
  )
}

JobStatusBadge.propTypes = {
  job: PropTypes.shape({
    status: PropTypes.string,
    failureReason: PropTypes.objectOf(PropTypes.string),
  }),
}

export default JobStatusBadge
