import React, { memo } from 'react'
import { Stack } from '@strapi/design-system/Stack'
import { CollectionTable } from '../Collection'
import UsageOverview from '../Usage'

const PluginPage = () => {
  return (
    <Stack padding={8} margin={10} spacing={4} background="neutral">
      <CollectionTable />
      <UsageOverview />
    </Stack>
  )
}

export default memo(PluginPage)
