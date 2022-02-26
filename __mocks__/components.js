const simpleComponent = {
  uid: 'simpleComponent',
  schema: {
    attributes: {
      text: {
        type: 'text',
      },
    },
  },
}

const nestedComponent = {
  uid: 'nestedComponent',
  schema: {
    attributes: {
      text: {
        type: 'text',
      },
      nested: {
        type: 'component',
        component: 'nestedComponent',
      },
    },
  },
}

const twoFieldComponent = {
  uid: 'twoFieldComponent',
  schema: {
    attributes: {
      title: {
        type: 'text',
      },
      number: {
        type: 'number',
      },
    },
  },
}

module.exports = {
  simpleComponent,
  nestedComponent,
  twoFieldComponent,
}
