import React, { memo } from 'react'
import { Thead, Tr, Th } from '@strapi/design-system/Table'
import { BaseCheckbox } from '@strapi/design-system/BaseCheckbox'
import { Typography } from '@strapi/design-system/Typography'
import { VisuallyHidden } from '@strapi/design-system/VisuallyHidden'

const CollectionTableHeader = ({ locales }) => {
  return (
    <Thead>
      <Tr>
        <Th>
          <Typography variant="sigma">NAME</Typography>
        </Th>
        {locales.map((locale) => (
          <Th key={locale.code}>
            <Typography variant="sigma">{locale.name}</Typography>
          </Th>
        ))}
      </Tr>
    </Thead>
  )
}

export default memo(CollectionTableHeader)
