/*
 *
 * HomePage
 *
 */

import React, { memo } from 'react'
import PluginHeader from '../../components/PluginHeader'
import PluginPage from '../../components/PluginPage'

const HomePage = () => {
  return (
    <div>
      <PluginHeader />
      <PluginPage />
    </div>
  )
}

export default memo(HomePage)
