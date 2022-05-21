/*
 *
 * HomePage
 *
 */

import React, { memo } from 'react'
import PluginHeader from '../../components/PluginHeader'
import PluginTabs from '../../components/PluginTabs'

const HomePage = () => {
  return (
    <div>
      <PluginHeader />
      <PluginTabs />
    </div>
  )
}

export default memo(HomePage)
