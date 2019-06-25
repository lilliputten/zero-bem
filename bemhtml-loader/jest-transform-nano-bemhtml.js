/** @module jest-transform-nano-bemhtml
 *  @description Jest NanoBem bemhtml transform plugin
 *  @since 2019.04.07, 18:05
 *  @changed 2019.04.07, 18:05
 */

const bemhtmlLoader = require('./webpack-nano-bemhtml-loader');

module.exports = {

  process: (src/* , filename, config, options */) => {
    const code = bemhtmlLoader.default(src);
    return code;
  },

};
