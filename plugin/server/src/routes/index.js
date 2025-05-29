import translateRoutes from './translate.js';
import providerRoutes from './provider.js';

const routes = {
  admin: {
    type: 'admin',
    routes: [
      ...translateRoutes,
      ...providerRoutes,
    ],
  },
};

export default routes;
