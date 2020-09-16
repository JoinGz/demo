const http = require("http")
const Router = require('./router/router.js')
class Application {
  constructor() {
    this._router = new Router();
  }
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
      let done = function finalhandler(err) {
        res.writeHead(404, {
          'Content-Type': 'text/plain'
        });
    
        if(err) {
          res.write('404: ' + err);
          res.end();	
        } else {
          let msg = 'Cannot ' + req.method + ' ' + req.url;
          res.write(msg);
          res.end();
        }
      };
      this._router.handle(req, res, done)
    })
    // 使用 apply 代理手法
    server.listen.apply(server, arguments)
  }
  use (fn) {
    // let path = arguments[0];
    // let fn = arguments[1]
    // if (arguments.length === 1) {
    //   path === '/'
    //   fn = arguments[0]
    // }
    let path = '/'
    if (typeof fn !== 'function') {
      path = fn;
      fn = arguments[1]
    }
    this._router.use(path, fn)
    return this
  }
}
http.METHODS.forEach(method => {
  method = method.toLowerCase();
  Application.prototype[method] = function (path, fn) {
    // this._router[method](
    //   path,
    //   fn,
    // )
    this._router[method].apply(this._router, arguments)
    return this;
  }

})
exports = module.exports = Application