import React, { memo } from 'react'
import {
  Box,
  CardBadge,
  ProgressBar,
  Table,
  Tr,
  Td,
  Tbody,
  Typography,
} from '@strapi/design-system'
import { useIntl } from 'react-intl'

import useUsage from '../../Hooks/useUsage'
import { getTranslation } from '../../utils'

const UsageOverview = () => {
  const { usage, error, isLoading } = useUsage()

  const { formatMessage } = useIntl()

  const content = isLoading
    ? [
        <Td key="loading">
          <Typography textColor="neutral800">
            {formatMessage({
              id: getTranslation('usage.loading'),
              defaultMessage: 'Loading Usage data...',
            })}
          </Typography>
        </Td>,
      ]
    : error || !usage
      ? [
          <Td key="error">
            <Typography textColor="neutral800">
              {formatMessage({
                id: getTranslation('usage.failed-to-load'),
                defaultMessage: 'Failed to load Usage data',
              })}
            </Typography>
          </Td>,
        ]
      : [
          <Td key="usage">
            <Typography textColor="neutral800">
              {usage.count}/{usage.limit}{' '}
              {formatMessage({
                id: getTranslation('usage.characters-used'),
                defaultMessage: 'characters used',
              })}
            </Typography>
          </Td>,
          <Td key="progress-bar">
            <CardBadge>
              <ProgressBar
                value={usage ? (usage.count / usage.limit) * 100 : 0}
              />
              <Typography>
                {usage.count}/{usage.limit}{' '}
                {formatMessage({
                  id: getTranslation('usage.characters-used'),
                  defaultMessage: 'characters used',
                })}
              </Typography>
            </CardBadge>
          </Td>,
        ]

  return (
    <Box background="neutral100" marginTop={4}>
      <Table colCount={3} rowCount={1}>
        <Tbody>
          <Tr>
            <Td>
              <Typography variant="sigma">
                {formatMessage({
                  id: getTranslation('usage.title'),
                  defaultMessage: 'Usage',
                })}
              </Typography>
            </Td>
            {content}
          </Tr>
        </Tbody>
      </Table>
    </Box>
  )
}

export default memo(UsageOverview)
