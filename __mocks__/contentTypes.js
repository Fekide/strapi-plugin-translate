const simpleContentType = createSimpleContentType(false)

function createSimpleContentType(localized, uid = 'simple') {
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
  translated,
  target,
  uid = 'api::first.first'
) {
  return {
    pluginOptions: {
      i18n: {
        localized: !!translated,
      },
    },
    kind: 'collectionType',
    attributes: {
      related: {
        type: 'relation',
        relation: relationType,
        target: target,
        ...inverseOrMapped,
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
  { translated = true, repeatable = false }
) {
  return {
    pluginOptions: {
      i18n: {
        localized: !!translated,
      },
    },
    kind: 'collectionType',
    attributes: {
      component: {
        pluginOptions: {
          i18n: {
            localized: true,
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
      },
    },
    content: {
      type: 'richtext',
      pluginOptions: {
        i18n: {
          localized: true,
        },
      },
    },
    slug: {
      pluginOptions: {
        i18n: {
          localized: true,
        },
      },
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
      },
      type: 'dynamiczone',
      components: ['simpleComponent', 'twoFieldComponent'],
    },
    child_component: {
      pluginOptions: {
        i18n: {
          localized: true,
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
      },
      repeatable: true,
      type: 'component',
      component: 'twoFieldComponent',
    },
  },
}

module.exports = {
  simpleContentType,
  createSimpleContentType,
  complexContentType,
  createRelationContentType,
  createContentTypeWithComponent,
  createContentTypeWithDynamicZone,
  createContentTypeWithUid,
}
