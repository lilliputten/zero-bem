module.exports = {
  presets: [
    '@babel/preset-env',
  ],
  ignore: [ '**/*.test.js',  '**/*.UNUSED.js' ],
  plugins: [
    /* [ 'module-resolver', { // https://github.com/tleunen/babel-plugin-module-resolver
     *   root: [ './' ],
     *   alias: {
     *     'zero-bem': [ '../' ],
     *     components: [ './src/components' ],
     *   },
     * }],
     */
    'directory-resolver', // https://github.com/mgcrea/babel-plugin-directory-resolver
  ],
};
