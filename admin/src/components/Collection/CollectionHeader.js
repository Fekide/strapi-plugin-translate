import React, { memo } from 'react'
import { Thead, Tr, Th } from '@strapi/design-system/Table'
import { Typography } from '@strapi/design-system/Typography'
import PropTypes from 'prop-types'

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
CollectionTableHeader.propTypes = {
  locales: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
}

export default memo(CollectionTableHeader)
