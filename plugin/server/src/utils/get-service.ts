
export const getService = (name) => {
  return strapi.plugin('translate').service(name)
}


