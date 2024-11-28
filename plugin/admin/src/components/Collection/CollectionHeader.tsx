import React, { memo } from 'react'
import { Thead, Tr, Th, Typography } from '@strapi/design-system'
import PropTypes from 'prop-types'
import { Locale } from '@shared/types/locale'

type CollectionTableHeaderProps = {
  locales: Array<Pick<Locale, 'code' | 'name'>>
}

const CollectionTableHeader = ({ locales }: CollectionTableHeaderProps) => {
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
