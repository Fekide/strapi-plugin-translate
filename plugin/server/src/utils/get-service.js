// Migrated util for Strapi 5

export const getService = (name) => {
  return strapi.plugin('translate').service(name);
};
