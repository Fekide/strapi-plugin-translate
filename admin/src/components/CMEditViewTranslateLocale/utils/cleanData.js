// This file is highly inspired by the utils of the CMEditViewCopyLocale component of @strapi/plugin-i18n
// In the following the referenced License by Strapi Solutions

// Copyright (c) 2015-present Strapi Solutions SAS
//
// Portions of the Strapi software are licensed as follows:
//
// * All software that resides under an "ee/" directory (the “EE Software”), if that directory exists, is licensed under the license defined in "ee/LICENSE".
//
// * All software outside of the above-mentioned directories or restrictions above is available under the "MIT Expat" license as set forth below.
//
// MIT Expat License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import {
  contentManagementUtilRemoveFieldsFromData,
  formatComponentData,
} from '@strapi/helper-plugin'

import { get } from 'lodash'
import { getType, getOtherInfos } from '@strapi/helper-plugin'

const removeFieldTypesFromData = (
  data,
  contentTypeSchema,
  componentSchema,
  fieldTypes = ['password']
) => {
  const recursiveCleanData = (data, schema) => {
    return Object.keys(data).reduce((acc, current) => {
      const attrType = getType(schema, current)
      const value = get(data, current)
      const component = getOtherInfos(schema, [current, 'component'])
      const isRepeatable = getOtherInfos(schema, [current, 'repeatable'])

      if (attrType === 'dynamiczone') {
        acc[current] = value.map((componentValue) => {
          const subCleanedData = recursiveCleanData(
            componentValue,
            componentSchema[componentValue.__component]
          )

          return subCleanedData
        })

        return acc
      }

      if (attrType === 'component') {
        if (isRepeatable) {
          /* eslint-disable indent */
          acc[current] = value
            ? value.map((compoData) => {
                const subCleanedData = recursiveCleanData(
                  compoData,
                  componentSchema[component]
                )

                return subCleanedData
              })
            : value
          /* eslint-enable indent */
        } else {
          acc[current] = value
            ? recursiveCleanData(value, componentSchema[component])
            : value
        }

        return acc
      }

      if (!fieldTypes.includes(attrType)) {
        acc[current] = value
      }

      return acc
    }, {})
  }

  return recursiveCleanData(data, contentTypeSchema)
}

const cleanData = (data, { contentType, components }, initialLocalizations) => {
  const dataWithoutPasswordsAndRelations = removeFieldTypesFromData(
    data,
    contentType,
    components,
    ['password']
  )

  dataWithoutPasswordsAndRelations.localizations = initialLocalizations

  const fieldsToRemove = [
    'createdBy',
    'updatedBy',
    'publishedAt',
    'id',
    'updatedAt',
    'createdAt',
  ]

  const cleanedClonedData = contentManagementUtilRemoveFieldsFromData(
    dataWithoutPasswordsAndRelations,
    contentType,
    components,
    fieldsToRemove
  )

  return formatComponentData(cleanedClonedData, contentType, components)
}

export default cleanData
