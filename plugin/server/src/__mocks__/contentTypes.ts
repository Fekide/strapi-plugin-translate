import { Struct, UID } from '@strapi/strapi'
import {} from 'zod'

export const simpleContentType = createSimpleContentType(false)

export function createSimpleContentType(
  localized: boolean,
  uid: UID.ContentType = 'api::simple.simple',
  translate = 'translate'
): Struct.ContentTypeSchema {
  return {
    modelType: 'contentType',
    uid,
    globalId: 'Complex',
    options: {
      draftAndPublish: true,
    },
    info: {
      displayName: 'Complex',
      pluralName: 'Complexes',
      singularName: 'Complex',
    },
    modelName: 'complex',
    pluginOptions: {
      i18n: {
        localized: !!localized,
      },
    },
    kind: 'collectionType',
    attributes: {
      title: {
        type: 'string',
        pluginOptions: {
          i18n: {
            localized: !!localized,
          },
          translate: {
            translate,
          },
        },
      },
    },
  }
}

export const mediaContentType: Struct.ContentTypeSchema = {
  modelType: 'contentType',
  uid: 'api::complex.complex',
  globalId: 'Complex',
  options: {
    draftAndPublish: true,
  },
  info: {
    displayName: 'Complex',
    pluralName: 'Complexes',
    singularName: 'Complex',
  },
  modelName: 'complex',
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  kind: 'collectionType',
  attributes: {
    media: {
      allowedTypes: ['images', 'files', 'videos', 'audios'],
      type: 'media',
      multiple: false,
      pluginOptions: {
        i18n: {
          localized: true,
        },
        deepl: {
          translate: 'translate',
        },
      },
    },
  },
}

export function createRelationContentType(
  relationType,
  inverseOrMapped,
  localized,
  target,
  uid: UID.ContentType = 'api::first.first',
  translate = 'translate'
): Struct.ContentTypeSchema {
  return {
    modelType: 'contentType',
    uid,
    globalId: 'Complex',
    options: {
      draftAndPublish: true,
    },
    info: {
      displayName: 'Complex',
      pluralName: 'Complexes',
      singularName: 'Complex',
    },
    modelName: 'complex',
    pluginOptions: {
      i18n: {
        localized: !!localized,
      },
    },
    kind: 'collectionType',
    attributes: {
      related: {
        pluginOptions: {
          translate: {
            translate,
          },
        },
        type: 'relation',
        relation: relationType,
        target: target,
        ...inverseOrMapped,
      },
      ...(localized
        ? {
            localizations: {
              type: 'relation',
              relation: 'oneToMany',
              target: uid,
            },
          }
        : {}),
    },
  }
}

export function createContentTypeWithUid(
  translated: boolean,
  uid: UID.ContentType = 'api::simple.simple'
): Struct.ContentTypeSchema {
  return {
    modelType: 'contentType',
    uid,
    globalId: 'Complex',
    options: {
      draftAndPublish: true,
    },
    info: {
      displayName: 'Complex',
      pluralName: 'Complexes',
      singularName: 'Complex',
    },
    modelName: 'complex',
    pluginOptions: {
      i18n: {
        localized: !!translated,
      },
    },
    kind: 'collectionType',
    attributes: {
      uid: {
        pluginOptions: {
          i18n: {
            localized: true,
          },
        },
        type: 'uid',
      },
      ...(translated
        ? {
            localizations: {
              type: 'relation',
              relation: 'oneToMany',
              target: uid,
            },
          }
        : {}),
    },
  }
}

export function createContentTypeWithComponent(
  component,
  { localized = true, repeatable = false, translate = 'translate' }
): Struct.ContentTypeSchema {
  return {
    modelType: 'contentType',
    uid: 'api::complex.complex',
    globalId: 'Complex',
    options: {
      draftAndPublish: true,
    },
    info: {
      displayName: 'Complex',
      pluralName: 'Complexes',
      singularName: 'Complex',
    },
    modelName: 'complex',
    pluginOptions: {
      i18n: {
        localized: !!localized,
      },
    },
    kind: 'collectionType',
    attributes: {
      component: {
        pluginOptions: {
          i18n: {
            localized: true,
          },
          translate: {
            translate,
          },
        },
        type: 'component',
        component,
        repeatable,
      },
    },
  }
}

export function createContentTypeWithDynamicZone(
  components,
  { translated = true }
): Struct.ContentTypeSchema {
  return {
    modelType: 'contentType',
    uid: 'api::complex.complex',
    globalId: 'Complex',
    options: {
      draftAndPublish: true,
    },
    info: {
      displayName: 'Complex',
      pluralName: 'Complexes',
      singularName: 'Complex',
    },
    modelName: 'complex',
    pluginOptions: {
      i18n: {
        localized: !!translated,
      },
    },
    kind: 'collectionType',
    attributes: {
      dynamic_zone: {
        pluginOptions: {
          i18n: {
            localized: true,
          },
        },
        type: 'dynamiczone',
        components,
      },
    },
  }
}

export const complexContentType: Struct.ContentTypeSchema = {
  modelType: 'contentType',
  uid: 'api::complex.complex',
  globalId: 'Complex',
  options: {
    draftAndPublish: true,
  },
  info: {
    displayName: 'Complex',
    pluralName: 'Complexes',
    singularName: 'Complex',
  },
  modelName: 'complex',
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  kind: 'collectionType',
  attributes: {
    title: {
      type: 'string',
      pluginOptions: {
        i18n: {
          localized: true,
        },
        translate: {
          translate: 'translate',
        },
      },
    },
    content: {
      type: 'richtext',
      pluginOptions: {
        i18n: {
          localized: true,
        },
        translate: {
          translate: 'translate',
        },
      },
    },
    slug: {
      type: 'uid',
      targetField: 'title',
    },
    not_translated_field: {
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
      type: 'string',
    },
    copied_field: {
      pluginOptions: {
        i18n: {
          localized: false,
        },
        translate: {
          translate: 'copy',
        },
      },
      type: 'string',
    },
    enumeration: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
      },
      type: 'enumeration',
      enum: ['option_a', 'option_b', 'option_c'],
    },
    dynamic_zone: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
        translate: {
          translate: 'translate',
        },
      },
      type: 'dynamiczone',
      components: ['simple.component', 'twofield.component'],
    },
    child_component: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
        translate: {
          translate: 'translate',
        },
      },
      type: 'component',
      component: 'simple.component',
    },
    repeated_child_component: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
        translate: {
          translate: 'translate',
        },
      },
      repeatable: true,
      type: 'component',
      component: 'twofield.component',
    },
  },
}

export const complexContentTypeDelete: Struct.ContentTypeSchema = {
  modelType: 'contentType',
  uid: 'api::complex.complex',
  globalId: 'Complex',
  options: {
    draftAndPublish: true,
  },
  info: {
    displayName: 'Complex',
    pluralName: 'Complexes',
    singularName: 'Complex',
  },
  modelName: 'complex',
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  kind: 'collectionType',
  attributes: {
    title: {
      type: 'string',
      pluginOptions: {
        i18n: {
          localized: true,
        },
        translate: {
          translate: 'translate',
        },
      },
    },
    content: {
      type: 'richtext',
      pluginOptions: {
        i18n: {
          localized: true,
        },
        translate: {
          translate: 'delete',
        },
      },
    },
    slug: {
      type: 'uid',
      targetField: 'title',
    },
    not_translated_field: {
      pluginOptions: {
        i18n: {
          localized: false,
        },
      },
      type: 'string',
    },
    copied_field: {
      pluginOptions: {
        i18n: {
          localized: false,
        },
        translate: {
          translate: 'copy',
        },
      },
      type: 'string',
    },
    enumeration: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
      },
      type: 'enumeration',
      enum: ['option_a', 'option_b', 'option_c'],
    },
    dynamic_zone: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
        translate: {
          translate: 'delete',
        },
      },
      type: 'dynamiczone',
      components: ['simple.component', 'twofield.component'],
    },
    child_component: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
        translate: {
          translate: 'delete',
        },
      },
      type: 'component',
      component: 'simple.component',
    },
    repeated_child_component: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
        translate: {
          translate: 'delete',
        },
      },
      repeatable: true,
      type: 'component',
      component: 'twofield.component',
    },
  },
}
