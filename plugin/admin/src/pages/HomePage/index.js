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
    <>
      <PluginHeader />
      <PluginPage />
    </>
  )
}

export default memo(HomePage)
