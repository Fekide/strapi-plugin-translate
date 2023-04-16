import React, { useState } from 'react'
import { Td, Tr } from '@strapi/design-system/Table'
import { Checkbox, Typography } from '@strapi/design-system'

const BatchUpdateRows = ({ entries, selectedIDs, setSelectedIDs, locales }) => {
  const allIDs = entries.map(({ id }) => id)
  const isAllSelected = allIDs.every((id) => selectedIDs.includes(id))
  const isSomeSelected = allIDs.some((id) => selectedIDs.includes(id))

  const [isExpanded, setIsExpanded] = useState(entries.length === 1)

  let displayEntries = isExpanded ? entries : [entries[0]]

  return displayEntries.map(({ id, attributes }, index) => (
    <Tr key={id} aria-rowindex={index}>
      <Td>
        {index === 0 && (
          <Checkbox
            value={isAllSelected}
            indeterminate={isSomeSelected && !isAllSelected}
            onClick={() => {
              if (isAllSelected) {
                setSelectedIDs((selectedIDs) =>
                  selectedIDs.filter((param) => !allIDs.includes(param))
                )
              } else {
                setSelectedIDs((selectedIDs) => [...allIDs, ...selectedIDs])
              }
            }}
          >
            {attributes.contentType}
          </Checkbox>
        )}
      </Td>
      <Td>
        {isExpanded && (
          <Checkbox
            value={selectedIDs.includes(id)}
            onClick={() => {
              if (selectedIDs.includes(id)) {
                setSelectedIDs((selectedIDs) =>
                  selectedIDs.filter((param) => param !== id)
                )
              } else {
                setSelectedIDs((selectedIDs) => [id, ...selectedIDs])
              }
            }}
          />
        )}
      </Td>
      <Td>
        <Typography>
          {isExpanded
            ? attributes.groupID.split('-').join(',')
            : entries.length}
        </Typography>
      </Td>
      {locales.map(({ code }) => (
        <Td key={code}>
          {isExpanded ? (
            <Typography>
              {attributes.localesWithUpdates.includes(code)
                ? 'was updated'
                : ''}
            </Typography>
          ) : (
            <Typography>
              {entries.reduce((prev, curr) => {
                return (
                  prev +
                  (curr.attributes.localesWithUpdates.includes(code) ? 1 : 0)
                )
              }, 0)}{' '}
              updates
            </Typography>
          )}
        </Td>
      ))}

      <Td>
        {index === 0 && (
          <Checkbox
            value={isExpanded}
            onClick={() => setIsExpanded((oldValue) => !oldValue)}
          />
        )}
      </Td>
    </Tr>
  ))
}

export default BatchUpdateRows
