import React, { memo } from 'react'
import { Tr, Td } from '@strapi/design-system/Table'
import { BaseCheckbox } from '@strapi/design-system/BaseCheckbox'
import { Typography } from '@strapi/design-system/Typography'
import { Flex } from '@strapi/design-system/Flex'
import { Box } from '@strapi/design-system/Box'
import { Button } from '@strapi/design-system/Button'
import { Badge } from '@strapi/design-system/Badge'
import { Stack } from '@strapi/design-system/Stack'
import { IconButton, IconButtonGroup } from '@strapi/design-system/IconButton'
import Earth from '@strapi/icons/Earth'
import Cross from '@strapi/icons/Cross'
import Clock from '@strapi/icons/Clock'
import Play from '@strapi/icons/Play'

const CollectionRow = ({ entry, locales, onAction }) => {
  return (
    <Tr key={entry.contentType}>
      {/* Name */}
      <Td>
        <Typography textColor="neutral800">{entry.collection}</Typography>
      </Td>
      {/* Status by Locale */}
      {locales.map((locale) => {
        const { count, complete, job } = entry.localeReports[locale.code]
        return (
          <Td key={locale.code}>
            <Stack spacing={3}>
              <Typography textColor="neutral800">{count} entries</Typography>
              <Flex wrap="wrap">
                <Badge
                  textColor="neutral100"
                  backgroundColor={complete ? 'success500' : 'warning500'}
                >
                  {complete ? 'complete' : 'incomplete'}
                </Badge>
                {job && (
                  <Badge
                    marginLeft={1}
                    textColor="neutral100"
                    backgroundColor={
                      [
                        'created',
                        'setup',
                        'running',
                        'paused',
                        'finished',
                      ].includes(job.status)
                        ? 'success500'
                        : 'danger500'
                    }
                  >
                    Job {job.status}
                  </Badge>
                )}
              </Flex>
              <IconButtonGroup>
                <IconButton
                  onClick={() => onAction('translate', locale.code)}
                  label="Translate"
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
                  onClick={() => onAction('cancel', locale.code)}
                  label="Cancel"
                  icon={<Cross />}
                  disabled={
                    complete ||
                    !['created', 'setup', 'running'].includes(job?.status)
                  }
                />
                <IconButton
                  onClick={() => onAction('pause', locale.code)}
                  label="Pause"
                  icon={<Clock />}
                  disabled={
                    complete ||
                    !['created', 'setup', 'running'].includes(job?.status)
                  }
                />
                <IconButton
                  onClick={() => onAction('resume', locale.code)}
                  label="Resume"
                  icon={<Play />}
                  disabled={complete || job?.status !== 'paused'}
                />
              </IconButtonGroup>
            </Stack>
          </Td>
        )
      })}
    </Tr>
  )
}

export default memo(CollectionRow)
