import React, { memo } from 'react'
import ArrowLeft from '@strapi/icons/ArrowLeft'
import { Box } from '@strapi/design-system/Box'
import { Link } from '@strapi/design-system/Link'
import { BaseHeaderLayout } from '@strapi/design-system/Layout'

const PluginHeader = () => {
  return (
    <Box background="neutral100">
      <BaseHeaderLayout
        title="DeepL"
        subtitle="Manage integration and batch translations"
        as="h2"
      />
    </Box>
  )
}

export default memo(PluginHeader)
