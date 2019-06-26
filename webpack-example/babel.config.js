module.exports = {
  presets: [
    '@babel/preset-env',
  ],
  plugins: [
    [ 'module-resolver', { // https://github.com/tleunen/babel-plugin-module-resolver
      root: [ './' ],
      alias: {
        'zero-bem': [ '../src' ],
        components: [ './src/components' ],
      },
    }],
    'directory-resolver', // https://github.com/mgcrea/babel-plugin-directory-resolver
  ],
};
