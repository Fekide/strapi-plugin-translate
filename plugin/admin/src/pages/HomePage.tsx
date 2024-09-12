import { Main } from '@strapi/design-system';
import { useIntl } from 'react-intl';

import PluginHeader from 'src/components/PluginHeader';
import PluginPage from 'src/components/PluginPage';

const HomePage = () => {
  return (
    <Main>
      <PluginHeader />
      <PluginPage />
    </Main>
  );
};

export { HomePage };
