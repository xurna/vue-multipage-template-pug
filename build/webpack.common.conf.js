const utils = require('./utils')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path')
const HappyPack = require('happypack');
const process = require('process')
const nodeModuleDir = path.resolve(process.cwd(), 'node_module')
const appDir = path.resolve(process.cwd(), 'app')

function resolve(dir) {
  return path.join(appDir, dir)
}
module.exports = {
  entry: utils.entries(),
  resolve: {
    extensions: ['.js', '.vue', '.less', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': appDir,
      'js': resolve('assets/js'),
      'less': resolve('assets/less'),
      'img': resolve('assets/images'),
      'cmp': resolve('components'),
      'page': resolve('pages'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        include: [appDir],
        exclude: [nodeModuleDir]
      },
      {
        test: /\.js$/,
        use: ['happypack/loader?id=js'],
        include: [appDir],
        exclude: [nodeModuleDir]
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader'
      },
    ]
  },
  plugins: [
    // make sure to include the plugin for the magic
    new VueLoaderPlugin(),
    new HappyPack({
      id: 'js',
      threads: 4,
      loaders: ['babel-loader','cache-loader']
    }),
  ]
}