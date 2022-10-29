import React, { memo } from 'react'
import { Box } from '@strapi/design-system/Box'
import { BaseHeaderLayout } from '@strapi/design-system/Layout'

const PluginHeader = () => {
  return (
    <Box background="neutral100">
      <BaseHeaderLayout
        title="Translate"
        subtitle="Manage integration and batch translations"
        as="h2"
      />
    </Box>
  )
}

export default memo(PluginHeader)
