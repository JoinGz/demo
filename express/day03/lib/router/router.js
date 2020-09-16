const Layer = require('./layer')
const Route = require('./route')
const http = require('http')

class Router {
  constructor() {
    this.stack = []
  }
  handle(req, res, done) {
    // this.stack.forEach((layer, i) => {
    //   if (i > 0) {
    //     if (layer.match(req.url) && layer.route && layer.route._handles_method(req.method)) {
    //       return layer.hand_requset(req, res)
    //     }
    //   }
    // })
    let nextNum = 0

    const next = (err) => {
      let layerError = (err === 'route' ? null : err);

      if (layerError === 'route') {
        return done(null)
      }
      if (nextNum >= this.stack.length || layerError) {
        return done(layerError)
      }
      let layer = this.stack[nextNum++]

      if (layer.match(req.url) && layer.route && layer.route._handles_method(req.method)) {
        return layer.hand_requset(req, res, next)
      } else {
        next(err)
      }
      // try {
      //   layer.hand_requset(req, res, next)
      // } catch (error) {
      //   next(error)
      // }
    }
    next()
    // 都没有匹配 返回404
    // return this.stack[0].hand_requset && this.stack[0].hand_requset(req, res)

  }
  route(path) {
    let route = new Route(path)
    let layer = new Layer(path, route.dispath.bind(route))
    layer.route = route
    this.stack.push(layer)
    return route
  }
  // get(path, fn) {
  //   let route = this.route(path);
  //   route.get(fn);
  //   return this;
  // }
}

http.METHODS.forEach(method => {
  method = method.toLowerCase();
  Router.prototype[method] = function (path, fn) {
    let route = this.route(path);
    route[method](fn);
    return this;
  }
})

exports = module.exports = Router