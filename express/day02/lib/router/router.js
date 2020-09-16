const Layer = require('./layer')
const Route = require('./route')
class Router {
  constructor () {
    this.stack = [new Layer('*', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end('404');
    })]
  }
  // get(path, fn) {
  //   this.stack.push(new Layer(path, fn))
  // }
  handle(req, res) {
      this.stack.forEach((layer, i) => {
        if (i > 0) {
          if (layer.match(req.url) && layer.route && layer.route._handles_method(req.method)) {
            return layer.hand_requset(req, res)
          }
        }
      })
      // 都没有匹配 返回404
      return this.stack[0].hand_requset && this.stack[0].hand_requset(req, res)

  }
  route (path) {
    let route = new Route(path)
    let layer = new Layer(path, function (req, res) {
      route.dispath(req, res)
    })
    layer.route = route
    this.stack.push(layer)
    return route
  }
  get (path, fn) {
    let route = this.route(path);
    route.get(fn);
    return this;
  }
}

exports = module.exports = Router