const http = require("http")
const Router = require('./router/router.js')
exports = module.exports = {
  _router: new Router(),
  get(path, fn) {
    this._router.get(
      path,
      fn,
    )
  },
  listen() {
    const server = http.createServer((req, res) => {
      if (!res.send) {
        res.send = function (str) {
          res.writeHead(200, {
            'Content-Type': 'text/plain'
          });
          res.write(str)
          res.end()
        }
      }
      this._router.handle(req, res)
    })
    // server.listen(port, () => {
    //   fn.apply(fn, arguments)
    // })
    // 使用 apply 代理手法
    server.listen.apply(server, arguments)
  }
}

/**
 * 主要引入3个类
 * router route layer
 * layer 负责处理对应路径的函数
 * route 保存着路径与对应的函数的关系，函数处理用layer
 * router 保存着路径与route的关系。多一层route为了可以级联挂载。
 */