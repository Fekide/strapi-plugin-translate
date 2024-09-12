import React, { memo } from 'react'
import { Box } from '@strapi/design-system'
import { CollectionTable } from './Collection'
import UsageOverview from './Usage'

const PluginPage = () => {
  return (
    <Box padding={8} margin={10} background="neutral">
      <CollectionTable />
      <UsageOverview />
    </Box>
  )
}

export default memo(PluginPage)
