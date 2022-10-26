const simpleContentType = createSimpleContentType(false)

function createSimpleContentType(
  localized,
  uid = 'simple',
  translate = 'translate'
) {
  return {
    pluginOptions: {
      i18n: {
        localized,
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
          deepl: {
            translate,
          },
        },
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

function createRelationContentType(
  relationType,
  inverseOrMapped,
  localized,
  target,
  uid = 'api::first.first',
  translate = 'translate'
) {
  return {
    pluginOptions: {
      i18n: {
        localized: !!localized,
      },
    },
    kind: 'collectionType',
    attributes: {
      related: {
        pluginOptions: {
          deepl: {
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

function createContentTypeWithUid(translated, uid = 'simple') {
  return {
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

function createContentTypeWithComponent(
  component,
  { localized = true, repeatable = false, translate = 'translate' }
) {
  return {
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
          deepl: {
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

function createContentTypeWithDynamicZone(components, { translated = true }) {
  return {
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

const complexContentType = {
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
        deepl: {
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
        deepl: {
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
        deepl: {
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
        deepl: {
          translate: 'translate',
        },
      },
      type: 'dynamiczone',
      components: ['simpleComponent', 'twoFieldComponent'],
    },
    child_component: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
        deepl: {
          translate: 'translate',
        },
      },
      type: 'component',
      component: 'simpleComponent',
    },
    repeated_child_component: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
        deepl: {
          translate: 'translate',
        },
      },
      repeatable: true,
      type: 'component',
      component: 'twoFieldComponent',
    },
  },
}

const complexContentTypeDelete = {
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
        deepl: {
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
        deepl: {
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
        deepl: {
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
        deepl: {
          translate: 'delete',
        },
      },
      type: 'dynamiczone',
      components: ['simpleComponent', 'twoFieldComponent'],
    },
    child_component: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
        deepl: {
          translate: 'delete',
        },
      },
      type: 'component',
      component: 'simpleComponent',
    },
    repeated_child_component: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
        deepl: {
          translate: 'delete',
        },
      },
      repeatable: true,
      type: 'component',
      component: 'twoFieldComponent',
    },
  },
}

module.exports = {
  complexContentTypeDelete,
  simpleContentType,
  createSimpleContentType,
  complexContentType,
  createRelationContentType,
  createContentTypeWithComponent,
  createContentTypeWithDynamicZone,
  createContentTypeWithUid,
}
