/**
 * Application methods
 */
import bootstrap from './bootstrap';
import register from './register';
import destroy from './destroy';

/**
 * Plugin server methods
 */
import config from './config';
import contentTypes from './content-types';
import controllers from './controllers';
import middlewares from './middlewares';
import policies from './policies';
import routes from './routes';
import services from './services';

export default () => ({
  register,
  bootstrap,
  destroy,
  config,
  contentTypes,
  controllers,
  middlewares,
  policies,
  routes,
  services,
});