import React, { memo } from 'react'
import { Box } from '@strapi/design-system'
import { Layouts } from '@strapi/strapi/admin'

const PluginHeader = () => {
  return (
    <Box background="neutral100">
      <Layouts.BaseHeader
        title="Translate"
        subtitle="Manage integration and batch translations"
      />
    </Box>
  )
}

export default memo(PluginHeader)
