// Migrated util for Strapi 5

exports.getService = (name) => {
  return strapi.plugin('translate').service(name);
};
