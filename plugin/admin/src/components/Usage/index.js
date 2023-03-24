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
import { getTrad } from '../../utils'

const UsageOverview = () => {
  const { usage, error, hasUsageInformation } = useUsage()

  const { formatMessage } = useIntl()

  if (!error && !hasUsageInformation) {
    return null
  }

  const content = error ? (
    <Td>
      <Typography textColor="neutral800">
        {formatMessage({
          id: getTrad('usage.failed-to-load'),
          defaultMessage: 'Failed to load Usage data',
        })}
      </Typography>
    </Td>
  ) : (
    <>
      <Td>
        <Typography textColor="neutral800">
          {usage.count}/{usage.limit}{' '}
          {formatMessage({
            id: getTrad('usage.characters-used'),
            defaultMessage: 'characters used',
          })}
        </Typography>
      </Td>
      <Td>
        <CardBadge>
          <ProgressBar value={usage ? (usage.count / usage.limit) * 100 : 0}>
            {usage.count}/{usage.limit}{' '}
            {formatMessage({
              id: getTrad('usage.characters-used'),
              defaultMessage: 'characters used',
            })}
          </ProgressBar>
        </CardBadge>
      </Td>
    </>
  )

  return (
    <Box background="neutral100">
      <Table colCount={3} rowCount={1}>
        <Tbody>
          <Tr>
            <Td>
              <Typography variant="sigma">
                {formatMessage({
                  id: getTrad('usage.title'),
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
