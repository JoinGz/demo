const Layer = require('./layer')
const http = require('http')
// Route 类，它包含用于区分相同路径，不同请求方法的路由
class Route {
  constructor(path) {
    this.path = path;
    this.stack = [];
    this.method = {}
    // 下面是自己的实现方法。 发现还在作者的好。一次性加到原型上。
    // this._initMethod()
  }
  _handles_method(method) {
    let name = method.toLowerCase()
    return Boolean(this.method[name])
  }
  // _initMethod () {
  //   http.METHODS.forEach(method=>{
  //     method = method.toLowerCase();
  //     this[method] = ()=>{
  //       let layer = new Layer('/', fn)
  //       layer.method = method
  //       this.method[method] = true
  //       this.stack.push(layer)
  //       return this;
  //     }

  //   })
  // }
  // get(fn) {
  //   let layer = new Layer('/', fn)
  //   layer.method = 'get'
  //   this.method.get = true
  //   this.stack.push(layer)
  //   return this;
  // }
  dispath(req, res, done) {
    const method = req.method.toLowerCase();
    // for (let i = 0; i < this.stack.length; i++) {
    //   const layer = this.stack[i];
    //   if (layer.method = method) {
    //     return layer.hand_requset(req, res)
    //   }
    // }
    let layerNum = 0

    const next = (err) => {
      //跳过route
      if (err && err === 'route') {
        return done();
      }

      //跳过整个路由系统
      if (err && err === 'router') {
        return done(err);
      }

      //越界
      if (layerNum >= this.stack.length) {
        return done(err);
      }
      // let layer = this.stack[layerNum++]
      // if (layer.method = method) {
      //   return layer.hand_requset(req, res, next)
      // } else {
      //   next(err)
      // }
      let layer = this.stack[layerNum++]
      // 不等就枚举下一个
      if (layer.method !== method) {
        return next(err);
      }
      if (err) {
        //主动报错
        layer.handle_error(err, req, res, next)
      } else {
        layer.hand_requset(req, res, next)
      }

    }
    next()
  }

}


http.METHODS.forEach(method => {
  method = method.toLowerCase();
  Route.prototype[method] = function (fn) {
    // 这里随便写路径，因为已经不会去匹配了
    let layer = new Layer('/', fn)
    layer.method = method
    this.method[method] = true
    this.stack.push(layer)
    return this;
  }

})

exports = module.exports = Route