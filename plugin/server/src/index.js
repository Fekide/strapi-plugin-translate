// Strapi 5 plugin entrypoint (server)
import register from './register';
import bootstrap from './bootstrap';
import destroy from './destroy';
import config from './config';
import contentTypes from './content-types';
import controllers from './controllers';
import routes from './routes';
import services from './services';
import policies from './policies';
import middlewares from './middlewares';

export default {
  register,
  bootstrap,
  destroy,
  config,
  controllers,
  routes,
  services,
  contentTypes,
  policies,
  middlewares,
};
