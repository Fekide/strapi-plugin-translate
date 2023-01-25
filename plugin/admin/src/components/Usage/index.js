import React, { memo } from 'react'
import {
  Box,
  Card,
  CardBody,
  CardContent,
  CardBadge,
  CardSubtitle,
  CardTitle,
  ProgressBar,
} from '@strapi/design-system'
import { useIntl } from 'react-intl'

import useUsage from '../../Hooks/useUsage'
import { getTrad } from '../../utils'

const UsageOverview = () => {
  const { usage } = useUsage()

  const { formatMessage } = useIntl()

  if (!(typeof usage?.count === 'number' && typeof usage?.limit === 'number')) {
    return (
      <Card marginTop={4}>
        <CardBody>
          <CardTitle>
            {formatMessage({
              id: getTrad('usage.failed-to-load'),
              defaultMessage: 'Failed to load Usage data',
            })}
          </CardTitle>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card marginTop={4}>
      <CardBody style={{ alignItems: 'center' }}>
        <CardTitle>
          {' '}
          {formatMessage({
            id: getTrad('usage.title'),
            defaultMessage: 'Usage',
          })}
          :
        </CardTitle>
        <CardContent paddingLeft={2} style={{ flexGrow: '1' }}>
          <CardSubtitle>
            <Box background="neutral150" padding={2}>
              <ProgressBar
                style={{ width: 'auto' }}
                value={usage ? (usage.count / usage.limit) * 100 : 0}
              >
                {usage.count}/{usage.limit}{' '}
                {formatMessage({
                  id: getTrad('usage.characters-used'),
                  defaultMessage: 'characters used',
                })}
              </ProgressBar>
            </Box>
          </CardSubtitle>
        </CardContent>
        <CardBadge>
          {usage.count} / {usage.limit}
        </CardBadge>
      </CardBody>
    </Card>
  )
}

export default memo(UsageOverview)
