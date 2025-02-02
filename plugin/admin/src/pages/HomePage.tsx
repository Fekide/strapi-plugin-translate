import { Main } from '@strapi/design-system'

import PluginHeader from '../components/PluginHeader'
import PluginPage from '../components/PluginPage'

const HomePage = () => {
  return (
    <Main>
      <PluginHeader />
      <PluginPage />
    </Main>
  )
}

export { HomePage }
