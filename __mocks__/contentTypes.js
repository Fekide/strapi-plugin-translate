const simpleContentType = {
  uid: 'article',
  schema: {
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
    },
  },
}

const complexContentType = {
  uid: 'article',
  schema: {
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
  },
}

module.exports = {
  simpleContentType,
  complexContentType,
}
