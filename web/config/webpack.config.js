/* eslint-disable no-undef */
const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const safePostCssParser = require('postcss-safe-parser')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const getClientEnvironment = require('./env')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const modules = require('./modules')
const paths = require('./paths')

module.exports = function (webpackEnv, isNode) {
  const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1))
  const isEnvDevelopment = webpackEnv === 'development'
  const ext = isEnvDevelopment ? '' : '.[contenthash:8]'

  return {
    mode: isEnvDevelopment ? 'development' : 'production',
    devtool: isEnvDevelopment && 'cheap-module-source-map',
    entry: isNode
      ? {
          AppServer: path.join(paths.appSrc, 'AppServer.js'),
        }
      : {
          main: path.join(paths.appSrc, 'index.js'),
        },
    resolve: {
      modules: ['node_modules', paths.appNodeModules].concat(
        modules.additionalModulePaths || []
      ),
      alias: {
        app: path.resolve('app/src/'),
        // Support React Native Web
        // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        'react-native': 'react-native-web',
        // Allows for better profiling with ReactDevTools
        ...(modules.webpackAliases || {}),
      },
    },
    optimization: {
      minimize: !isEnvDevelopment,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: {
              // We want terser to parse ecma 8 code. However, we don't want it
              // to apply any minification steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending further investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            // Added for profiling in devtools
            keep_classnames: !isEnvDevelopment,
            keep_fnames: !isEnvDevelopment,
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true,
            },
          },
          sourceMap: isEnvDevelopment,
        }),
        // This is only used in production mode
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser,
            map: isEnvDevelopment
              ? {
                  // `inline: false` forces the sourcemap to be output into a
                  // separate file
                  inline: false,
                  // `annotation: true` appends the sourceMappingURL to the end of
                  // the css file, helping the browser find the sourcemap
                  annotation: true,
                }
              : false,
          },
          cssProcessorPluginOptions: {
            preset: ['default', { minifyFontValues: { removeQuotes: false } }],
          },
        }),
      ],
    },
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
                  runtime: 'classic',
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
          options: {
            name: `static/media/[name]${ext}.[ext]`,
          },
        },
      ],
    },
    plugins: isNode
      ? [
          new webpack.DefinePlugin(env.stringified),
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
          new webpack.IgnorePlugin(/canvas/, /jsdom$/),
          new MiniCssExtractPlugin({
            filename: `static/css/[name]${ext}.css`,
          }),
        ]
      : [
          new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
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
          new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),

          new webpack.DefinePlugin(env.stringified),
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
          new webpack.IgnorePlugin(/canvas/, /jsdom$/),
          new MiniCssExtractPlugin({
            filename: `static/css/[name]${ext}.css`,
          }),
        ],
    output: {
      path: isEnvDevelopment
        ? path.resolve(__dirname, '..', 'dist')
        : paths.appBuild,
      filename: `static/js/[name]${isNode ? '' : ext}.js`,
      globalObject: 'this',
      publicPath: '/public/',
      devtoolModuleFilenameTemplate: !isEnvDevelopment
        ? (info) =>
            path
              .relative(paths.appSrc, info.absoluteResourcePath)
              .replace(/\\/g, '/')
        : (info) => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
      ...(isNode ? { libraryTarget: 'commonjs' } : {}),
    },
    node: {
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
    target: isNode ? 'node' : 'web',
    externals: isNode
      ? ['react', 'react-dom', 'bufferutil', 'utf-8-validate']
      : [],
    performance: false,
  }
}
