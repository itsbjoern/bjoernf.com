/* eslint-disable no-undef */
'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err
})

// Ensure environment variables are read.
// require('../config/env')

const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const HtmlWebpackExcludeAssetsPlugin = require('./HtmlWebpackExcludeAssetsPlugin')
const paths = require('../config/paths')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const TerserPlugin = require('terser-webpack-plugin')
const smp = new SpeedMeasurePlugin()

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1)
}

// const getClientEnvironment = require('../config/env')
// const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1))

const getClientEnvironment = require('../config/env')
const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1))

let transformConf = {
  entry: path.join(paths.appSrc, 'AppServer.js'),
  resolve: {
    alias: {
      app: path.resolve('app/src/'),
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web',
      // Allows for better profiling with ReactDevTools
    },
  },
  // optimization: {
  //   minimize: true,
  //   minimizer: [
  //     // This is only used in production mode
  //     new TerserPlugin({
  //       terserOptions: {
  //         parse: {
  //           // We want terser to parse ecma 8 code. However, we don't want it
  //           // to apply any minification steps that turns valid ecma 5 code
  //           // into invalid ecma 5 code. This is why the 'compress' and 'output'
  //           // sections only apply transformations that are ecma 5 safe
  //           // https://github.com/facebook/create-react-app/pull/4234
  //           ecma: 8,
  //         },
  //         compress: {
  //           ecma: 5,
  //           warnings: false,
  //           // Disabled because of an issue with Uglify breaking seemingly valid code:
  //           // https://github.com/facebook/create-react-app/issues/2376
  //           // Pending further investigation:
  //           // https://github.com/mishoo/UglifyJS2/issues/2011
  //           comparisons: false,
  //           // Disabled because of an issue with Terser breaking valid code:
  //           // https://github.com/facebook/create-react-app/issues/5250
  //           // Pending further investigation:
  //           // https://github.com/terser-js/terser/issues/120
  //           inline: 2,
  //         },
  //         mangle: {
  //           safari10: true,
  //         },
  //         // Added for profiling in devtools
  //         keep_classnames: false,
  //         keep_fnames: false,
  //         output: {
  //           ecma: 5,
  //           comments: false,
  //           // Turned on because emoji and regex is not minified properly using default
  //           // https://github.com/facebook/create-react-app/issues/2488
  //           ascii_only: true,
  //         },
  //       },
  //       sourceMap: false,
  //     }),
  //   ],
  // },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        include: paths.appSrc,
        loader: require.resolve('babel-loader'),
        options: {
          babelrc: false,
          configFile: false,
          compact: false,
          cacheDirectory: true,
          // See #6846 for context on why cacheCompression is disabled
          cacheCompression: false,
          plugins: [
            [
              require.resolve('babel-plugin-direct-import'),
              { modules: ['@mui/material', '@mui/icons-material'] },
            ],
          ],
          presets: [
            [
              require.resolve('babel-preset-react-app'),
              {
                runtime: 'automatic',
              },
            ],
          ],
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,

            options: paths.publicUrlOrPath.startsWith('.')
              ? { publicPath: '../../' }
              : {},
          },

          {
            loader: require.resolve('css-loader'),
          },
        ],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      excludeAssets: [/\*.js$/],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new HtmlWebpackExcludeAssetsPlugin(),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
    new webpack.DefinePlugin(env.stringified),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.IgnorePlugin(/canvas/, /jsdom$/),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'static/css/[name].css',
    }),
  ],
  output: {
    path: path.resolve(__dirname, '..', 'node'),
    filename: 'AppServer.js',
    globalObject: 'this',
    publicPath: '/node/public/',
    libraryTarget: 'umd',
    library: '',
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
  target: 'node',
}

const compiler = webpack(transformConf)
compiler.run((err, stats) => {
  if (err) {
    console.log(err)
  }
  const messages = formatWebpackMessages(
    stats.toJson({ all: false, warnings: true, errors: true })
  )
  console.log(messages.errors)
})
