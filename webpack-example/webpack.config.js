/** @module webpack.config
 *  @description Webpack configuration
 *  @since 2019.06.26, 08:29
 *  @changed 2019.06.21, 11:38
 */

// Requirements...

const path = require('path');
// const fs = require('fs');
const webpack = require('webpack');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const UglifyJS = require('uglify-js');
const ExtractCssPlugin = require('mini-css-extract-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier'); // https://www.npmjs.com/package/webpack-build-notifier
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const WebpackFilePreprocessorPlugin = require('webpack-file-preprocessor-plugin');
const dateformat = require('dateformat');
const pkgConfig = require('../package');

// Paths...

const rootPath = path.resolve(__dirname);
const buildPath = path.resolve(__dirname, 'build');
const srcPath = path.join(rootPath, 'src');
const mixinsPath = path.join(srcPath, 'postcss-mixins');

const zeroBemHtmlLoaderPath = '../bemhtml-loader/webpack-zero-bemhtml-loader';

module.exports = (env = {}, argv) => {

  // // Personalize webpack configuration
  // const webpackEnvFile = './webpack.env.js';
  // const webpackEnv = fs.existsSync(webpackEnvFile) && require(webpackEnvFile);
  // env = Object.assign({}, webpackEnv, env);

  // Determine environment params...

  // Project properties
  const { version } = pkgConfig;

  // Date stamps
  const dateStringFormat = 'yyyy.mm.dd HH:MM:ss';
  const dateTagFormat = 'yymmdd-HHMM';
  const now = new Date();
  const dateString = dateformat(now, dateStringFormat);
  const dateTag = dateformat(now, dateTagFormat);

  // webpack/dev-server modes
  const mode = argv.mode || 'production';
  const isDevServer = !!argv.host; // (mode === 'none'); // (none = server) // Alternate method: !!argv.host;
  const cssHotReload = isDevServer; // Hot reload css for dev-server
  const isStats = !!argv.profile;
  const isWatch = !!argv.watch;
  const isDev = (/* isDevServer || */ mode === 'development');
  const isProd = !isDev; // mode === 'production';
  const useDevTool = true /* && (isDev || isDevServer) */; // Need server restart
  const minimizeBundles = true && isProd; // To minimize production bundles
  const preprocessBundles = true && !isStats && isProd; // To minimize production bundles
  const sourceMaps = !preprocessBundles; // To minimize production bundles
  const extemeUglify = false; // Use mangling (WARNING: May broke some code! Don't use without testing!)
  const DEBUG = true && (isDev || isDevServer);
  // Stats waiting only json on output...
  const debugModes = [
    // dateTag,
    // mode,
    isDevServer && 'DevServer',
    isWatch && 'Watch',
    isDev && 'Development',
    isProd && 'Production',
    useDevTool && 'DevTool',
    minimizeBundles && 'minmize',
    preprocessBundles && 'preprocess',
    sourceMaps && 'sourceMaps',
    extemeUglify && 'extemeUglify',
    DEBUG && 'DEBUG',
  ].filter(x => x).join(' ');
  if (!isStats) {
    !isStats && console.log('Build parameters:', debugModes); // eslint-disable-line no-console
  }

  // Basic params

  const entryPoint = './src/index.js';

  const htmlFilename = 'default.html';
  const htmlTemplateFile = './html/' + htmlFilename;

  const useHashes = false; // NOTE: Not works with pseudo-dynamic bundles loading method (with hardcoded urls)
  const bundleName = ({ ext, name, dir }={}) => (dir || 'js/') + (name || '[name]') + (useHashes && !isWatch && !isDevServer ? '-[contenthash:8]' : '') + (ext || '.js');

  const cssConfig = require('./styles.config.js');
  const postcssPlugins = [
    // require('postcss-flexbugs-fixes'),
    // require('postcss-import'),
    require('postcss-mixins')({
      mixinsDir: mixinsPath,
    }), // https://github.com/postcss/postcss-mixins
    require('postcss-advanced-variables')({ // https://github.com/jonathantneal/postcss-advanced-variables
      variables: cssConfig,
    }),
    require('postcss-simple-vars'), // https://github.com/postcss/postcss-simple-vars
    require('postcss-color-function'), // https://github.com/postcss/postcss-color-function
    require('postcss-calc')(),
    require('postcss-nested-ancestors'), // https://github.com/toomuchdesign/postcss-nested-ancestors
    require('postcss-nested'),
    require('postcss-url')({
      url: 'rebase',
      // maxSize: 20,
      // url: 'rebase',
    }),
    // Finishing...
    require('autoprefixer')(),
    minimizeBundles && require('postcss-csso'),
    require('postcss-reporter'),
  ].filter(x => x);

  const uglifyOptions = {
    mangle: extemeUglify ? {
      toplevel: false,
    } : false,
    // nameCache: {},
  };

  /**
   * TODO: Source maps?
   * @see https://www.npmjs.com/package/uglify-js#source-map-options
   */
  const preprocessJs = (src) => {

    // Preprocess DEBUG/DEBUG-BEGIN-DEBUG-END/NO-DEBUG statements
    src = src
      .replace(/(\/\*\s*DEBUG-BEGIN.*?)\*\/([\s\S]*?)\/\*(.*?DEBUG-END\s*\*\/)/gm, '$1...$3') // '$1$2...$2$4')
      .replace(/(\s*)\/\*\s*DEBUG\b(|[^-].*?)\*\/\s*/gm, '$1//DEBUG$2// ')
      // .replace(/(HASHTAG)\s*=\s*["']([^'"]*)["']/g, '$1=\'' + CONFIG.hashTag + '\'')
      .replace(/\/\*\s*NO-?DEBUG\s+([\s\S]*?)\s*\*\//gm, '$1')
    ;

    if (minimizeBundles) {
      var result = UglifyJS.minify(src, uglifyOptions);
      if (result.error) {
        console.error('Uglify error:', result.error); // eslint-disable-line no-console
        process.exit(1);
      }
      src = result.code;
    }

    return src;
  };

  return { // Configuration object...

    mode, // Depends on command line options
    devtool: useDevTool && 'source-map', // 'cheap-module-source-map',
    performance: {
      hints: false,
    },

    entry: [
      entryPoint,
    ],
    resolve: {
      extensions: ['.js'],
    },

    output: {
      path: buildPath,
      filename: bundleName(),
    },
    devServer: {
      contentBase: buildPath,
      index: htmlFilename,
      watchContentBase: true,
      port: 8080,
    },

    module: { rules:[
      { // js
        test: /\.(js)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          // sourceRoot: '/',
          retainLines: true,
          cacheDirectory: true,
        },
      },
      { // bemhtml
        test: /\.(bemhtml)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: path.resolve(zeroBemHtmlLoaderPath),
            options: {
              sourceMap: sourceMaps,
              /* // Add required modules to resulted code
               * requires: {
               *   config: 'src/config/config',
               *   // DEBUG: 'src/lib/DEBUG/DEBUG',
               * },
               */
            },
          },
          !isDevServer && 'babel-loader', // TODO: BEMHTML sourcemaps
        ].filter(x => x),
      },
      { // css/postcss
        test: /\.(pcss|css)$/,
        // exclude: /node_modules/, // Some imports may be from `node_modules/...`
        use: [
          cssHotReload ? 'style-loader' : ExtractCssPlugin.loader, // Hot styles realoading for dev-server
          {
            loader: require.resolve('css-loader'),
            options: {
              sourceMap: sourceMaps,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              ident: 'postcss',
              sourceMap: sourceMaps,
              parser: require('postcss-scss'),
              plugins: () => postcssPlugins,
            },
          },
        ],
      },
    ]},

    plugins: [
      /** Cleanup before build */
      !isDevServer && !isStats && new CleanWebpackPlugin(
        {
          // path: path.join(buildPath, '**/*'),
          exclude: ['.gitkeep'],
          verbose: true,
          beforeEmit: true,
          // dry: false,
        }
      ),
      /** Pass constants to source code */
      new webpack.DefinePlugin({
        'process.env': {
          DEBUG: JSON.stringify(DEBUG),
          isDevServer: JSON.stringify(isDevServer),
          isDev: JSON.stringify(isDev),
          isProd: JSON.stringify(isProd),
          isWatch: JSON.stringify(isWatch),
          dateTag: JSON.stringify(dateTag),
          dateString: JSON.stringify(dateString),
          version: JSON.stringify(version),
        },
      }),
      /** Process html entrypoint */
      new HtmlWebPackPlugin({
        inject: true,
        template: htmlTemplateFile,
        filename: htmlFilename,
        templateParameters: {
          theme: env.THEME || 'none',
          rootPath,
          dateString,
          dateTag,
          version,
        },
      }),
      preprocessBundles && new WebpackFilePreprocessorPlugin({
          // Prints processed assets if set to true (default: false)
          debug: true,
          // RegExp pattern to filter assets for pre-processing.
          pattern: /\.js$/,
          // Do your processing in this process function.
          process: (source) => preprocessJs(source.toString())
      }),
      /** Extract css */
      !cssHotReload && new ExtractCssPlugin({
        filename: bundleName({ ext: '.css', dir: 'css/' }),
      }),
      /** Show system notification */
      new WebpackBuildNotifierPlugin({
        // title: "My Project Webpack Build",
        // logo: path.resolve("./img/favicon.png"),
        suppressSuccess: true
      }),
      /** Show datetag after build */
      /* (!isWatch && !isDevServer) && */ new EventHooksPlugin({
        done: (/* compiler */) => {
          setTimeout(() => {
            if (!isStats) {
              console.log('Build parameters:', debugModes); // eslint-disable-line no-console
              console.log('Built', dateTag, 'at', dateformat(Date.now(), dateStringFormat)); // eslint-disable-line no-console
            }
          }, 0);
        }
      }),
    ].filter(x => x),

    optimization: {
      // Minimize if not preprocess and minimize flags configured
      minimize: preprocessBundles ? false : minimizeBundles,
      // minimize: minimizeBundles,
      minimizer: [
        new UglifyJsPlugin({
          test: /\.js$/i,
          // parallel: 8,
          sourceMap: sourceMaps,
          uglifyOptions: {
            output: {
              comments: false,
              ie8: true
            },
            // https://github.com/mishoo/UglifyJS2#compress-options
            compress: {
              drop_debugger: false,
              // screw_ie8: true,
              // sequences: true,
              // booleans: true,
              // loops: true,
              // unused: true,
              // warnings: false,
              // drop_console: true,
              // unsafe: true
            },
          },
        }),
      ],
      splitChunks: {
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
    },

    stats: {
      // Nice colored output
      colors: true,
    },

  };

};
