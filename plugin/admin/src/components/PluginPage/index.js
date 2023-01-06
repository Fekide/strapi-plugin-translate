import React, { memo } from 'react'
import { Box } from '@strapi/design-system/Box'
import { CollectionTable } from '../Collection'

const PluginPage = () => {
  return (
    <Box padding={8} margin={10} background="neutral">
      <CollectionTable />
    </Box>
  )
}

export default memo(PluginPage)
