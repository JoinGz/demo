const http = require("http")
const Router = require('./router/router.js')
const middleware = require('./middleware/init')
class Application {
  constructor() {
    // this._router = new Router();
  }
  lazyRouter(){
    if (!this._router) {
      this._router = new Router();
      this._router.use(middleware)
    }
  }
  listen() {
    const server = http.createServer((req, res) => {
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
      // 这里无需调用lazyRouter，因为listen前一定调用了.use或者.METHODS方法。
	    // 如果二者都没有调用，没有必要创建路由系统。this._router为undefined。
      if (this._router) {
        this._router.handle(req, res, done)
      } else {
        done()
      }
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
    this.lazyRouter()
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
    this.lazyRouter()
    this._router[method].apply(this._router, arguments)
    return this;
  }

})
exports = module.exports = Application