const http = require("http")
class Express {
  constructor() {
    this.routers = [{
      path: '*',
      method: '*',
      handle: (req, res) => {
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end('404');
      }
    }]
  }
  get(path, fn) {
    this.routers.push({
      method: 'GET',
      path,
      handle: fn,
    })
  }
  listen(port, fn) {
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
      this.routers.forEach((route, i) => {
        if (i > 0) {
          if ((route.method === req.method || route.method === '*') && (route.path === req.url || route.path === '*')) {
            return route.handle && route.handle(req, res)
          }
        }

      })
      // 都没有匹配 返回404
      return this.routers[0].handle && this.routers[0].handle(req, res)
    })
    // server.listen(port, () => {
    //   fn.apply(fn, arguments)
    // })
    // 使用 apply 代理手法
    server.listen.apply(server, arguments)
  }
}
exports = module.exports = Express