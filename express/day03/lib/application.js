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
}
http.METHODS.forEach(method => {
  method = method.toLowerCase();
  Application.prototype[method] = function (path, fn) {
    this._router[method](
      path,
      fn,
    )
    return this;
  }

})
exports = module.exports = Application