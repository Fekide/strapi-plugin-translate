export const simpleComponent = createSimpleComponent()

export function createSimpleComponent(translate = 'translate') {
  return {
    attributes: {
      text: {
        pluginOptions: {
          translate: {
            translate,
          },
        },
        type: 'richtext',
      },
    },
  }
}

export const nestedComponent = createNestedComponent()

export function createNestedComponent(translate = 'translate') {
  return {
    attributes: {
      text: {
        pluginOptions: {
          translate: {
            translate: 'translate',
          },
        },
        type: 'text',
      },
      nested: {
        pluginOptions: {
          translate: {
            translate,
          },
        },
        type: 'component',
        component: 'nested.component',
      },
    },
  }
}

export const twoFieldComponent = {
  attributes: {
    title: {
      pluginOptions: {
        translate: {
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

export function createComponentWithRelation(relationType, target) {
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
