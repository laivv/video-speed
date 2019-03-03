const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const basePath = path.join(__dirname, '../');
const htmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: path.join(basePath, './src/main.js'),
    background: path.join(basePath, './src/background.js'),
    content_script: path.join(basePath, './src/content_script.js'),
  },
  output: {
    filename: '[name].js',
    path: path.join(basePath, 'dist')
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],

    // alias: {
    //   'vue$': 'vue/dist/vue.esm.js'
    //   // 'vue$': 'vue/dist/vue.js'
    //   // 'vue$': 'vue/dist/vue.common.js'
    // }
  },
  // externals: {
  //   chrome: 'chrome'
  // },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      // { test: /\.(vue|js|jsx)$/, loader: 'eslint-loader', exclude: /node_module/, enforce: 'pre' },

      {
        test: /\.vue$/,
        loader: ['vue-loader']
      },
      {
        test: /\.css$/,
        loader: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      { from: path.join(basePath, './src/assets/'), to: path.join(basePath, './dist') }
    ]),
    new htmlWebpackPlugin({
      chunks: ['popup'],
      filename: 'popup.html',
      template: path.join(basePath, './src/popup.html'),
      inject: 'body',
      chunksSortMode: 'dependency',
    }),
  ]
}
