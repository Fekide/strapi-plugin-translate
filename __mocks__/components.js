const simpleComponent = {
  attributes: {
    text: {
      type: 'text',
    },
  },
}

const nestedComponent = {
  attributes: {
    text: {
      type: 'text',
    },
    nested: {
      type: 'component',
      component: 'nestedComponent',
    },
  },
}

const twoFieldComponent = {
  attributes: {
    title: {
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
}
