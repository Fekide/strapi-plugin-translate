const simpleComponent = createSimpleComponent()

function createSimpleComponent(translate = 'translate') {
  return {
    attributes: {
      text: {
        pluginOptions: {
          deepl: {
            translate,
          },
        },
        type: 'text',
      },
    },
  }
}

const nestedComponent = createNestedComponent()

function createNestedComponent(translate = 'translate') {
  return {
    attributes: {
      text: {
        pluginOptions: {
          deepl: {
            translate: 'translate',
          },
        },
        type: 'text',
      },
      nested: {
        pluginOptions: {
          deepl: {
            translate,
          },
        },
        type: 'component',
        component: 'nestedComponent',
      },
    },
  }
}

const twoFieldComponent = {
  attributes: {
    title: {
      pluginOptions: {
        deepl: {
          translate: 'translate',
        },
      },
      type: 'text',
    },
    number: {
      type: 'number',
    },
  },
}

function createComponentWithRelation(relationType, target) {
  return {
    attributes: {
      related: {
        type: 'relation',
        relation: relationType,
        target: target,
      },
    },
  }
}

module.exports = {
  simpleComponent,
  nestedComponent,
  twoFieldComponent,
  createComponentWithRelation,
  createSimpleComponent,
  createNestedComponent,
}
