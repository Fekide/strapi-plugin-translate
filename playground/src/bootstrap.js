'use strict'

const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
const set = require('lodash.set')
const {
  categories,
  homepage,
  writers,
  articles,
  global,
} = require('../data/data.json')

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  })
  const initHasRun = await pluginStore.get({ key: 'initHasRun' })
  await pluginStore.set({ key: 'initHasRun', value: true })
  return !initHasRun
}

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({
      where: {
        type: 'public',
      },
    })

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = []
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller]
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      })
    })
    allPermissionsToCreate.push(...permissionsToCreate)
  })
  await Promise.all(allPermissionsToCreate)
}

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath)
  const fileSizeInBytes = stats['size']
  return fileSizeInBytes
}

function getFileData(fileName) {
  const filePath = `./data/uploads/${fileName}`

  // Parse the file metadata
  const size = getFileSizeInBytes(filePath)
  const ext = fileName.split('.').pop()
  const mimeType = mime.lookup(ext)

  return {
    path: filePath,
    name: fileName,
    size,
    type: mimeType,
  }
}

// Create an entry and attach files if there are any
async function createEntry({ model, entry, files }) {
  try {
    if (files) {
      for (const [key, file] of Object.entries(files)) {
        // Get file name without the extension
        const [fileName] = file.name.split('.')
        // Upload each individual file
        const uploadedFile = await strapi
          .plugin('upload')
          .service('upload')
          .upload({
            files: file,
            data: {
              fileInfo: {
                alternativeText: fileName,
                caption: fileName,
                name: fileName,
              },
            },
          })

        // Attach each file to its entry
        set(entry, key, uploadedFile[0].id)
      }
    }

    // Actually create the entry in Strapi
    const createdEntry = await strapi.entityService.create(
      `api::${model}.${model}`,
      {
        data: entry,
      }
    )
  } catch (e) {
    console.log('model', entry, e)
  }
}

async function importCategories() {
  return Promise.all(
    categories.map((category) => {
      return createEntry({ model: 'category', entry: category })
    })
  )
}

async function importHomepage() {
  const files = {
    'seo.shareImage': getFileData('default-image.png'),
  }
  await createEntry({ model: 'homepage', entry: homepage, files })
}

async function importWriters() {
  return Promise.all(
    writers.map(async (writer) => {
      const files = {
        picture: getFileData(`${writer.email}.jpg`),
      }
      return createEntry({
        model: 'writer',
        entry: writer,
        files,
      })
    })
  )
}

async function importArticles() {
  return Promise.all(
    articles.map((article) => {
      const files = {
        image: getFileData(`${article.slug}.jpg`),
      }

      return createEntry({
        model: 'article',
        entry: {
          ...article,
          // Make sure it's not a draft
          publishedAt: Date.now(),
        },
        files,
      })
    })
  )
}

async function importGlobal() {
  const files = {
    favicon: getFileData('favicon.png'),
    'defaultSeo.shareImage': getFileData('default-image.png'),
  }
  return createEntry({ model: 'global', entry: global, files })
}

async function addLocales(locales) {
  return Promise.all(
    locales.map((locale) =>
      strapi
        .service('plugin::i18n.locales')
        .create(locale)
        .catch(() =>
          console.log(`Failed to create locale ${locale.code}. Already exists`)
        )
    )
  )
}

async function importSeedData() {
  // Allow read of application content types
  await setPublicPermissions({
    global: ['find'],
    homepage: ['find'],
    article: ['find', 'findOne'],
    category: ['find', 'findOne'],
    writer: ['find', 'findOne'],
  })

  // Create all entries
  await importCategories()
  await importHomepage()
  await importWriters()
  await importArticles()
  await importGlobal()
  await addLocales([{ name: 'German (de)', code: 'de' }])
}

async function cleanCollectionType(uid) {
  return strapi.db.query(uid).deleteMany({ where: { id: { $notNull: true } } })
}

async function cleanData() {
  await cleanCollectionType('api::global.global')
  await cleanCollectionType('api::article.article')
  await cleanCollectionType('api::category.category')
  await cleanCollectionType('api::homepage.homepage')
  await cleanCollectionType('api::writer.writer')
}

module.exports = async () => {
  const shouldImportSeedData = await isFirstRun()

  if (shouldImportSeedData) {
    try {
      console.log('Cleaning database')
      await cleanData()
      console.log('Setting up the template...')
      await importSeedData()
      console.log('Ready to go')
    } catch (error) {
      console.log('Could not import seed data')
      console.error(error)
    }
  }
}
