const Strapi = require('@strapi/strapi')
const bootstrap = require('../src/bootstrap')
let instance

const waitForServer = () =>
  new Promise((resolve) => {
    const { host, port } = strapi.config.get('server')
    resolve(strapi.server.listen(port, host))
  })

async function setupStrapi() {
  if (!instance) {
    /** the following code is copied from `./node_modules/strapi/lib/Strapi.js` */
    await Strapi({ serveAdminPanel: false }).load()
    await waitForServer()

    instance = strapi // strapi is global now
  }
  return instance
}

async function stopStrapi() {
  if (instance) {
    await instance.destroy()
  }
  return instance
}

async function resetStrapi() {
  if (!instance) {
    await setupStrapi()
  }
  console.log('Strapi initialized')

  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  })
  await pluginStore.set({ key: 'initHasRun', value: false })
  await bootstrap()
  console.log('Strapi rebootstrapped')
  await stopStrapi()
}

process.env.PORT = 1234

resetStrapi()
