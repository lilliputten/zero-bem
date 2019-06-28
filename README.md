[![npm version](https://badge.fury.io/js/zero-bem.svg)](https://badge.fury.io/js/zero-bem)

# zero-bem

Minimal ES6 bem-stack implementation library.

Based, inspired and partly inherits the code from famous client-side framework
[i-bem](https://en.bem.info/technologies/classic/i-bem/) but it can work
without `y-modules`, `borschik`, `enb` and other endemic Yandex' tools.

## Installation

```shell
npm i -S zero-bem
```

## Using

### Using in runtime

Basic usage case (rehydratiing dom, adding new nodes & entities):

```javascript

  // const $ = require('jquery');

  // document.body.innerHTML = '<div class="Wrapper"><div class="App bem-js" data-bem=\'{"Test":{"test":true}}\'>App content</div></div>';

  const { BEMDOM, BEMHTML } = require('zero-bem');

  // Init frozen DOM (came from app template)
  BEMDOM.hydrate();

  // Find target block
  // const appBlock = BEMDOM.findEntities({ domElem: $('body'), block: 'App' });
  const appBlock = $('.App').bem('App');

  // Find parent container
  const wrapperBlock = appBlock.findParentBlock('Wrapper');

  // Try to dynamically create blocks from template
  const template = {
    block: 'Demo',
    mix: {
      block: 'Mixed',
      mods: { test: 'val' },
      js: { param: 1 },
    },
    mods: { test: true },
    content: [
      { elem: 'Button', modName: 'id', modVal: 'action' },
    ],
  };

  // Create html from template
  const html = BEMHTML.apply(template);

  // Add dom node
  const dom = BEMDOM.prepend(wrapperBlock, html);

  // Get bem entity
  const demoBlock = dom.bem('Demo');

  // const mixedBlock = wrapperBlock.findChildBlock('Mixed');
  const mixedBlock = demoBlock.findMixedBlock({ block: 'Mixed', modName: 'test', modVal: 'val' });
  console.log('Mixed block params:', mixedBlock.params);

  // Find child
  const buttonElem = demoBlock.findChildElem('Button');
  console.log('Button element id:', buttonElem.getMod('id'));

  mixedBlock.setMod('alreadyFound');

  // Remove created node & all linked & nested bem entities (Demo itself, all mixes, siblings and children)
  BEMDOM.remove(demoBlock);
```

### Using as modules

Suppose you have component `Demo`. Then you can create some 'technologies'
modules for it in (for example) folder
[src/components/Demo/](webpack-example/src/components/Demo/):

JS runtime code (main module, which includes any other components' technology
modules, as shown below) --
[Demo.js](webpack-example/src/components/Demo/Demo.js):

```javascript
const { BEMDOM } = require('zero-bem');

require('./Demo.bemhtml'); // Include bemhtml templates
require('./Demo.pcss'); // Include styles

const Demo_proto = /** @lends Demo.prototype */ {

  /** Initialize the component event handler
   */
  onInit: function() {

    this.__base();

    console.log('Demo:onInit: params', this.params); // eslint-disable-line no-console

    // Emit demo event
    setTimeout(() => {
      this.emit('demoEvent', { ok: true });
    }, 1000);

  },

};

export default BEMDOM.declBlock('Demo', Demo_proto);
```

BEMHTML templates -- [Demo.bemhtml](webpack-example/src/components/Demo/Demo.bemhtml):

```javascript
block('Demo')(

  // Adding modifiers
  addMods()(function(){
    return this.extend({
      // Test passing modifiers
      bemhtml: 'ok',
    }, applyNext());
  }),

  // Live entity
  js()(true)

);
```

Some styles if you need/want -- [Demo.pcss](webpack-example/src/components/Demo/Demo.pcss):

```scss
.Demo {
  padding: $(itemPadding)px;
  @mixin debug gray, 10%;
}
```

Hereafter you can use your component in other module.

You must use import component to let the webpack to know that it must to include it in the application build.

For example application main component [App.js](webpack-example/src/components/App/App.js) uses our `Demo`:

```javascript
import('components/Demo');

const App_proto = /** @lends App.prototype */ {

  /** Initialize the app event handler
   */
  onInit: function() {

    // Find demo block
    const demoBlock = this.findChildBlock('Demo');

    // Do something with Demo: subscribe to events, change state, get properties, call it methods...

  },

};

export default BEMDOM.declBlock('App', App_proto);
```

NOTE: Other documentation is in progress...

### Webpack configuration

You need to add `webpack-zero-bemhtml-loader` as `.bemhtml` files loader.

(`ZEROBEM_PATH` hereafter means the location of the `zero-bem` library, for
example `./node_modules/zero-bem/` or `<rootDir>/node_modules/zero-bem/`
etc...)

`webpack.config.js` sample fragment:

```javascript
const nanoBemHtmlLoaderPath = path.join(ZEROBEM_PATH, 'bemhtml-loader/webpack-zero-bemhtml-loader'); // Or use `require.resolve`
// ...
module.exports = (env, argv) => {
  return {
    // ...
    module: { rules: [
      // ...
      { // bemhtml begin
        test: /\.(bemhtml)?$/,
        exclude: /node_modules/,
        use: [
          // ...
          {
            // Specify loader path
            loader: path.resolve(nanoBemHtmlLoaderPath),
            // Loader options
            options: {
              // Allow sourcemaps (not supported now)
              sourceMap: sourceMaps,
              // Add required modules to resulted code
              requires: {
                // For example< we can use common configuration
                config: 'src/config/config',
                // ...
              },
            },
          },
          // ...
        ],
      }, // bemhtmlk end
      // ...
    ]}, // module.rules end
    // ...
  }; // return end
}; // module.exports end
```

### Jest configuration

You need to add `jest-transform-zero-bemhtml` as jest transform rule.

`jest.config.js` sample fragment:

```javascript
module.exports = {
  // ...
  transform: {
    // ...
    '.+\\.(bemhtml)$': path.join(ZEROBEM_PATH, 'bemhtml-loader/jest-transform-zero-bemhtml.js'),
    // ...
  },
  // ...
};
```

### Webpack example

Webpack minimal working example configuration included in packag in folder
[webpack-example](webpack-example).

You can run npm scripts `webpack-example-server` or `webpack-example-build` (or
`webpack-example-build-prod` if you wish to play around production build) for
testing/experiments.

## Original Yandex bem libs:

- [bem/bem-core: BEM Core Library](https://github.com/bem/bem-core)
- [bem/bem-xjst: bem-xjst (eXtensible JavaScript Templates): declarative template engine for the browser and server](https://github.com/bem/bem-xjst)
- [bem/project-stub: deps](https://github.com/bem/project-stub)

See also:

- [bem/bem-sdk: BEM SDK packages](https://github.com/bem/bem-sdk)
- [SDK / Toolbox / BEM](https://en.bem.info/toolbox/sdk/)
- [bem/webpack-bem-loader: Webpack BEM loader](https://github.com/bem/webpack-bem-loader)
- [bem/eslint-plugin-bem-xjst: ESLint environments for bem-xjst](https://github.com/bem/eslint-plugin-bem-xjst)

- [...And so on...](https://github.com/bem)

