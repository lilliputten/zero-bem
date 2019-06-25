/** @module webpack-nano-bemhtml-loader
 *  @description Webpack NanoBem bemhtml loader plugin
 *  @since 2019.03.06, 12:00
 *  @changed 2019.06.25, 11:42
 *
 *  README:
 *
 *    - https://webpack.js.org/contribute/writing-a-loader/
 *
 *  TODO:
 *
 *    - 2019.03.22, 12:31 -- Sourcemaps?
 *    - 2019.03.22, 12:36 -- Bebel processing for template source?
 *    - 2019.03.22, 12:37 -- Correct errors handling?
 *
 */

const path = require('path');
const prjPath = path.resolve('.');

const _loaderUtils = require('loader-utils');

// const babel = require('@babel/core'); // TODO!
const offsetLines = require('offset-sourcemap-lines'); // TODO!

/** nano-bemhtml loader
 * @param {string} content
 * @return {string}
 */
function loader(content, map/* , meta */) {

  const options = (0, _loaderUtils.getOptions)(this) || {};

  /** Requires option @type {object} */
  const requires = options.requires;

  /** sourceMap @type {boolean} */
  const sourceMap = options.sourceMap || false;

  this.cacheable && this.cacheable();

  // Use BEMHTML engine module
  const corePath = require.resolve('../BEMHTML/BEMHTML').replace(/\\/g, '/');

  // Construct prepending code
  let modulePrefix = '';

  if (requires && typeof requires == 'object') {
    modulePrefix += Object.keys(requires).map(function(moduleName) {
      let modulePath = requires[moduleName];
      // If not relative path...
      if (moduleName.indexOf('.') !== 0) {
        modulePath = path.join(prjPath, modulePath).replace(/\\/g, '/');
      }
      // TODO: Use `this.resolve`?
      return 'var ' + moduleName + ' = require(\'' + modulePath + '\');';
    }).join('\n') + '\n';
  }

  // Transpile code -- TODO
  // const babelResult = babel.transformSync(content, { sourceMap });
  const code = content; // babelResult.code;

  // Add source template processing code...
  modulePrefix += 'var BEMHTML = require(\'' + corePath + '\').BEMHTML;\n'
    + 'BEMHTML.compile(function() {\n'
  ;
  // Module appendix
  const modulePostfix = '\n});\n'
    + 'module.exports = BEMHTML;\n'
  ;
  // Entire module
  const moduleCode = modulePrefix + code + modulePostfix;

  // TODO: Here we need to generate sourceMap (couldn't find a working solution)
  const prefixLinesMatch = modulePrefix.match(/[\n]/g);
  const prefixLinesCount = Array.isArray(prefixLinesMatch) && prefixLinesMatch.length;

  if (sourceMap && map && prefixLinesCount) {
    map = offsetLines(map, prefixLinesCount);
  }

  // Async resolve module if callback specified
  this.callback && this.callback(null, moduleCode, map);

  // And return code in any case
  return moduleCode;

}

// module.exports = loader;
Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = loader;
