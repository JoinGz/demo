process.env.BABEL_ENV = 'web'
const path = require('path')
const fs = require('fs')
const HappyPack = require('HappyPack')
const isDevlopment = true

console.log([path.resolve(__dirname, '../node_modules')])

function exportConfig() {
  return {
    mode: 'development',
    entry: path.join(__dirname, '../client/index.js'),
    output: {
      // chunkFilename: runtime === 'local' ? '[id].js' : '[id].[contenthash:8].js',
      filename: 'client.js',
      // libraryTarget: 'umd',
      // publicPath: path.join(__dirname, '../'),
      path: path.join(__dirname, '../dist'),
    },
    context: path.join(__dirname, '..'),
    resolve: {
      modules: [path.resolve(__dirname, '../node_modules')],
      extensions: ['.js'],
      alias: {},
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['happypack/loader?id=babel'],
        },
      ],
    },
    plugins: [
      new HappyPack({
        // 用唯一的标识符id来代表当前的HappyPack 处理一类特定的文件
        id: 'babel',
        // 处理文件，用法和Loader配置是一样的
        loaders: [`babel-loader?cacheDirectory=${isDevlopment ? true : false}`],
      }),
    ],
    devServer: {
      contentBase: path.join(__dirname, '../dist'),
      compress: true,
      port: 9000,
    },
  }
}
module.exports = exportConfig()
