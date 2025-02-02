import React, { memo } from 'react'
import { Tr, Td, Button } from '@strapi/design-system'
import { Typography } from '@strapi/design-system'
import { Flex } from '@strapi/design-system'
import { Badge } from '@strapi/design-system'
import { useIntl } from 'react-intl'
import { IconButton, IconButtonGroup } from '@strapi/design-system'
import { Tooltip } from '@strapi/design-system'
import { Earth, Cross, Clock, Play } from '@strapi/icons'
import PropTypes from 'prop-types'
import { getTranslation } from '../../utils'
import { ContentTypeTranslationReport } from '@shared/types/report'
import { Locale } from '@shared/types/locale'
import { ActionType } from './actions'

interface CollectionRowProps {
  entry: ContentTypeTranslationReport
  locales: Array<Pick<Locale, 'code' | 'name'>>
  onAction: (action: ActionType, locale?: string) => void
  updateCount: number
  index: number
}

const CollectionRow = ({
  entry,
  locales,
  onAction,
  updateCount,
  index,
}: CollectionRowProps) => {
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
            <Flex gap={3} direction="row">
              <Typography textColor="neutral800">
                {count}{' '}
                {formatMessage({
                  id: getTranslation(`batch-translate.table.entries`),
                  defaultMessage: 'entries',
                })}
              </Typography>
              <Flex wrap="wrap">
                <Badge
                  textColor="neutral100"
                  backgroundColor={complete ? 'success500' : 'warning500'}
                >
                  {formatMessage({
                    id: getTranslation(
                      `batch-translate.table.complete.${complete}`
                    ),
                    defaultMessage: complete ? 'complete' : 'incomplete',
                  })}
                </Badge>
                {job &&
                  ([
                    'created',
                    'setup',
                    'running',
                    'paused',
                    'finished',
                  ].includes(job.status) ? (
                    <Badge
                      marginLeft={1}
                      textColor="neutral100"
                      backgroundColor={'success500'}
                    >
                      {formatMessage({
                        id: getTranslation(
                          `batch-translate.table.job-status.${job.status}`
                        ),
                        defaultMessage: `Job ${job.status}`,
                      })}
                    </Badge>
                  ) : (
                    <Tooltip
                      label={
                        job.failureReason?.message ||
                        formatMessage({
                          id: getTranslation(`errors.unknown`),
                          defaultMessage: 'Unknown error',
                        })
                      }
                    >
                      <div>
                        <Badge
                          marginLeft={1}
                          textColor="neutral100"
                          backgroundColor={'danger500'}
                        >
                          {formatMessage({
                            id: getTranslation(
                              `batch-translate.table.job-status.${job.status}`
                            ),
                            defaultMessage: `Job ${job.status}`,
                          })}
                        </Badge>
                      </div>
                    </Tooltip>
                  ))}
              </Flex>
              <IconButtonGroup>
                <IconButton
                  data-cy={`${entry.contentType}.${locale.code}.translate`}
                  onClick={() => onAction('translate', locale.code)}
                  label={formatMessage({
                    id: getTranslation(
                      'batch-translate.table.actions.labels.translate'
                    ),
                    defaultMessage: 'Translate',
                  })}
                  disabled={
                    complete ||
                    (job &&
                      !['finished', 'cancelled', 'failed'].includes(
                        job?.status
                      ))
                  }
                >
                  <Earth />
                </IconButton>
                <IconButton
                  data-cy={`${entry.contentType}.${locale.code}.cancel`}
                  onClick={() => onAction('cancel', locale.code)}
                  label={formatMessage({
                    id: getTranslation(
                      'batch-translate.table.actions.labels.cancel'
                    ),
                    defaultMessage: 'Cancel',
                  })}
                  disabled={
                    complete ||
                    !['created', 'setup', 'running'].includes(job?.status)
                  }
                >
                  <Cross />
                </IconButton>
                <IconButton
                  data-cy={`${entry.contentType}.${locale.code}.pause`}
                  onClick={() => onAction('pause', locale.code)}
                  label={formatMessage({
                    id: getTranslation(
                      'batch-translate.table.actions.labels.pause'
                    ),
                    defaultMessage: 'Pause',
                  })}
                  disabled={
                    complete ||
                    !['created', 'setup', 'running'].includes(job?.status)
                  }
                >
                  <Clock />
                </IconButton>
                <IconButton
                  data-cy={`${entry.contentType}.${locale.code}.resume`}
                  onClick={() => onAction('resume', locale.code)}
                  label={formatMessage({
                    id: getTranslation(
                      'batch-translate.table.actions.labels.resume'
                    ),
                    defaultMessage: 'Resume',
                  })}
                  disabled={complete || job?.status !== 'paused'}
                >
                  <Play />
                </IconButton>
              </IconButtonGroup>
            </Flex>
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
                id: getTranslation('batch-update.out-of-date'),
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
}

export default memo(CollectionRow)
