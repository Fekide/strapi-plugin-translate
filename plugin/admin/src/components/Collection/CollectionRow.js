import React, { memo } from 'react'
import { Tr, Td } from '@strapi/design-system/Table'
import { Button } from '@strapi/design-system/Button'
import { Typography } from '@strapi/design-system/Typography'
import { Flex } from '@strapi/design-system/Flex'
import { Badge } from '@strapi/design-system/Badge'
import { Stack } from '@strapi/design-system/Stack'
import { useIntl } from 'react-intl'
import { IconButton, IconButtonGroup } from '@strapi/design-system/IconButton'
import Earth from '@strapi/icons/Earth'
import Cross from '@strapi/icons/Cross'
import Clock from '@strapi/icons/Clock'
import Play from '@strapi/icons/Play'
import PropTypes from 'prop-types'
import { getTrad } from '../../utils'
import JobStatusBadge from './JobStatusBadge'

const CollectionRow = ({ entry, locales, onAction, updateCount, index }) => {
  const { formatMessage } = useIntl()

  return (
    <Tr key={entry.contentType} aria-rowindex={index}>
      {/* Name */}
      <Td>
        <Typography textColor="neutral800">{entry.collection}</Typography>
      </Td>
      {/* Status by Locale */}
      {locales.map((locale) => {
        const { count, complete, job } = entry.localeReports[locale.code]

        return (
          <Td key={locale.code} data-cy={`${entry.contentType}.${locale.code}`}>
            <Stack spacing={3}>
              <Typography textColor="neutral800">
                {count}{' '}
                {formatMessage({
                  id: getTrad(`batch-translate.table.entries`),
                  defaultMessage: 'entries',
                })}
              </Typography>
              <Flex wrap="wrap">
                <Badge
                  textColor="neutral100"
                  backgroundColor={complete ? 'success500' : 'warning500'}
                >
                  {formatMessage({
                    id: getTrad(`batch-translate.table.complete.${complete}`),
                    defaultMessage: complete ? 'complete' : 'incomplete',
                  })}
                </Badge>
                <JobStatusBadge job={job} />
              </Flex>
              <IconButtonGroup>
                <IconButton
                  data-cy={`${entry.contentType}.${locale.code}.translate`}
                  onClick={() => onAction('translate', locale.code)}
                  label={formatMessage({
                    id: getTrad(
                      'batch-translate.table.actions.labels.translate'
                    ),
                    defaultMessage: 'Translate',
                  })}
                  icon={<Earth />}
                  disabled={
                    complete ||
                    (job &&
                      !['finished', 'cancelled', 'failed'].includes(
                        job?.status
                      ))
                  }
                />
                <IconButton
                  data-cy={`${entry.contentType}.${locale.code}.cancel`}
                  onClick={() => onAction('cancel', locale.code)}
                  label={formatMessage({
                    id: getTrad('batch-translate.table.actions.labels.cancel'),
                    defaultMessage: 'Cancel',
                  })}
                  icon={<Cross />}
                  disabled={
                    complete ||
                    !['created', 'setup', 'running'].includes(job?.status)
                  }
                />
                <IconButton
                  data-cy={`${entry.contentType}.${locale.code}.pause`}
                  onClick={() => onAction('pause', locale.code)}
                  label={formatMessage({
                    id: getTrad('batch-translate.table.actions.labels.pause'),
                    defaultMessage: 'Pause',
                  })}
                  icon={<Clock />}
                  disabled={
                    complete ||
                    !['created', 'setup', 'running'].includes(job?.status)
                  }
                />
                <IconButton
                  data-cy={`${entry.contentType}.${locale.code}.resume`}
                  onClick={() => onAction('resume', locale.code)}
                  label={formatMessage({
                    id: getTrad('batch-translate.table.actions.labels.resume'),
                    defaultMessage: 'Resume',
                  })}
                  icon={<Play />}
                  disabled={complete || job?.status !== 'paused'}
                />
              </IconButtonGroup>
            </Stack>
          </Td>
        )
      })}
      <Td>
        <Typography textColor="neutral800">
          {updateCount > 0 && (
            <Button
              variant="tertiary"
              onClick={() => onAction('update')}
              data-cy={`${entry.contentType}.update`}
            >
              {updateCount}{' '}
              {formatMessage({
                id: getTrad('batch-update.out-of-date'),
                defaultMessage: 'translations may be out of date',
              })}
            </Button>
          )}
        </Typography>
      </Td>
    </Tr>
  )
}
CollectionRow.propTypes = {
  locales: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  onAction: PropTypes.func.isRequired,
  entry: PropTypes.shape({
    contentType: PropTypes.string,
    localeReports: PropTypes.objectOf(
      PropTypes.shape({
        count: PropTypes.number,
        complete: PropTypes.bool,
        job: PropTypes.shape({
          status: PropTypes.string,
          failureReason: PropTypes.objectOf(PropTypes.string),
        }),
      })
    ),
    collection: PropTypes.string,
  }),
  updateCount: PropTypes.number,
  index: PropTypes.number,
}

export default memo(CollectionRow)
