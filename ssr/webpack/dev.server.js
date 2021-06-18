console.warn('begin----')
process.env.BABEL_ENV = 'node'
const path = require('path')
const fs = require('fs')
const HappyPack = require('HappyPack')
const isDevlopment = true

const path2 = path.join(__dirname, '../server')
console.log(path2)
console.log([path.resolve(__dirname, '../node_modules')])

function exportConfig() {
  return {
    target: 'node',
    mode: 'development',
    entry: path.join(__dirname, '../server'),
    output: {
      // chunkFilename: runtime === 'local' ? '[id].js' : '[id].[contenthash:8].js',
      // filename: runtime === 'local' ? '[name].js' : '[name].[contenthash:8].js',
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
          loader: 'babel-loader',
          exclude: /node_modules/,
          // use: ['happypack/loader?id=babel'],
          // exclude: (file) => {
          //   if (/node_modules/.test(file)) {
          //     return true
          //   } else {
          //     return false
          //   }
          // },
        },
      ],
    },
    plugins: [
      // new HappyPack({
      //   // 用唯一的标识符id来代表当前的HappyPack 处理一类特定的文件
      //   id: 'babel',
      //   // 处理文件，用法和Loader配置是一样的
      //   loaders: [`babel-loader?cacheDirectory=${isDevlopment ? true : false}`],
      // }),
    ],
    // devServer: {
    //   contentBase: path.join(__dirname, '../dist'),
    //   compress: true,
    //   port: 9000,
    // },
  }
}
module.exports = exportConfig()
