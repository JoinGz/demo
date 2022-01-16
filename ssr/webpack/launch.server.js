const webpack = require('webpack')
const devServerConfig = require('./dev.server')
const cp = require('child_process')
const path = require('path')

const compiler = webpack(devServerConfig)


const watching = compiler.watch(
  {
    aggregateTimeout: 300, // 类似节流功能,聚合多个更改一起构建
    ignored: /node_modules/, //排除文件
    poll: 2000, //轮训的方式检查变更 单位：秒  ,如果监听没生效，可以试试这个选项.
    'info-verbosity': 'verbose', //在增量构建的开始和结束时，向控制台发送消息
  },
  (err, stats) => {
    let json = stats.toJson('minimal')
    if (json.errors) {
      json.errors.forEach((item) => {
        console.log(item)
      })
    }
    if (json.warnings) {
      json.warnings.forEach((item) => {
        console.log(item)
      })
    }
  }
)

let server; 

compiler.hooks.done.tap('done', function (data) {
  // 每次编译完就重启服务
  server && server.kill()
  server = cp.fork(path.resolve(__dirname, '../dist/main.js'))
  console.log('\n server code done') //编译完成的时候  可以监听每次的监听
})


