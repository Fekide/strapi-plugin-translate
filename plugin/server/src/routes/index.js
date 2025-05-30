const translateRoutes = require('./translate');
const providerRoutes = require('./provider');

const routes = {
  admin: {
    type: 'admin',
    routes: [
      ...translateRoutes,
      ...providerRoutes,
    ],
  },
};

module.exports = routes;
