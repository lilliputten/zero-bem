[![npm version](https://badge.fury.io/js/nanobem.svg)](https://badge.fury.io/js/nanobem)

# nanobem

Minimal ES6 bem-stack implementation library.

Based, inspired and partly inherits the code from famous client-side framework
[i-bem](https://en.bem.info/technologies/classic/i-bem/) but it can work
without `y-modules`, `borschik`, `enb` and other endemic Yandex' tools.

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

## Using in webpack

You need to add `webpack-nano-bemhtml-loader` as `.bemhtml` files loader.

(`NANOBEM_PATH` hereafter means the location of the `nano-bem` library, for
example `./node_modules/nano-bem/` or `<rootDir>/node_modules/nano-bem/`
etc...)

`webpack.config.js` sample fragment:

```javascript
const nanoBemHtmlLoaderPath = path.join(NANOBEM_PATH, 'bemhtml-loader/webpack-nano-bemhtml-loader'); // Or use `require.resolve`
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

## Using with jest

You need to add `jest-transform-nano-bemhtml` as jest transform rule.

`jest.config.js` sample fragment:

```javascript
module.exports = {
  // ...
  transform: {
    // ...
    '.+\\.(bemhtml)$': path.join(NANOBEM_PATH, 'bemhtml-loader/jest-transform-nano-bemhtml.js'),
    // ...
  },
  // ...
};
```
