const Layer = require('./layer')
const Route = require('./route')
const http = require('http')
// 把router类变成一个中间件
// 中间件 有一个route即可

let proto = function () {
  function route(req, res, next) {
    route.handle(req, res, next)
  }
  Object.setPrototypeOf(route, proto)
  route.stack = []
  // 实例是 route
  return route
}
proto.handle = function (req, res, done) {

  let nextNum = 0
  // 保存路由信息
  //获取当前父路径
  let parentUrl = req.baseUrl || '' ; // 记录基础url,中间件设置的url
  req.baseUrl = parentUrl
  // 保存原始路径
  req.orginalUrl = req.orginalUrl || req.url
  let removed = ''
  let slashAdded = false
  const next = (err) => {
    let layerError = (err === 'route' ? null : err);
    //如果有移除，复原原有路径
    // slashAdded 在一次中间件循环完之后，复原req.url路径
		if(slashAdded) {
			req.url = '';
			slashAdded = false;
    }

    // 如果有移除，复原原有路径信息
    if (removed.length !== 0) {
      req.baseUrl = parentUrl
      req.url = removed + req.url
      removed = ''
    }
    if (layerError === 'router') {
      return done(null)
    }
    if (nextNum >= this.stack.length) {
      // layerError 判断后移，因为有一个中间件报错了就会跳出整个中间件了
      return done(layerError)
    }
    let layer = this.stack[nextNum++]
    //获取当前路径
    var path = require('url').parse(req.url).pathname;
    if (layer.match(path)) {
      if (!layer.route) {

        removed = layer.path
        // 当前路径
        req.url = req.url.slice(layer.path.length)
        // 就是use('/abc') 路径也是/abc时，处理成'/',不然req.url变成'',再次parse(req.url).pathname时就会变成null。就无法匹配了。
        if(req.url === '') {
					req.url = '/' + req.url;
					slashAdded = true;
				}
        //设置当前路径的父路径
				req.baseUrl = parentUrl + removed;
        //判断是否发生错误，主动调用人工设置的错误函数
        if (layerError) {
          layer.handle_error(layerError, req, res, next)
        } else {
          layer.hand_requset(req, res, next)
        }
      } else if (layer.route && layer.route._handles_method(req.method)) {
        return layer.hand_requset(req, res, next)
      }
    } else {
      next(err)
    }

    // if (layer.match(req.url) && layer.route && layer.route._handles_method(req.method)) {
    //   return layer.hand_requset(req, res, next)
    // } else {
    //   next(err)
    // }
  }
  next()
  // 都没有匹配 返回404
  // return this.stack[0].hand_requset && this.stack[0].hand_requset(req, res)

}

proto.use = function (fn) {
  let path = "/"
  if (typeof fn !== 'function') {
    path = fn
    fn = arguments[1]
  }
  let layer = new Layer(path, fn)
  layer.route = undefined
  this.stack.push(layer)
  return this
}

proto.route = function (path) {
  let route = new Route(path)
  let layer = new Layer(path, route.dispath.bind(route))
  layer.route = route
  this.stack.push(layer)
  return route
}
// class Router {
//   constructor() {
//     this.stack = []
//   }
//   handle(req, res, done) {
//     // this.stack.forEach((layer, i) => {
//     //   if (i > 0) {
//     //     if (layer.match(req.url) && layer.route && layer.route._handles_method(req.method)) {
//     //       return layer.hand_requset(req, res)
//     //     }
//     //   }
//     // })
//     let nextNum = 0

//     const next = (err) => {
//       let layerError = (err === 'route' ? null : err);

//       if (layerError === 'route') {
//         return done(null)
//       }
//       if (nextNum >= this.stack.length || layerError) {
//         return done(layerError)
//       }
//       let layer = this.stack[nextNum++]

//       if(layer.match(req.url)) {
//         if (!layer.route) {
//           //判断是否发生错误，主动调用人工设置的错误函数
//           if (layerError) {
//              layer.handle_error(layerError, req, res, next)
//           } else {
//             layer.hand_requset(req, res, next)
//           }
//         } else if (layer.route && layer.route._handles_method(req.method)) {
//           return layer.hand_requset(req, res, next)
//         }
//       } else {
//         next(err)
//       }

//       // if (layer.match(req.url) && layer.route && layer.route._handles_method(req.method)) {
//       //   return layer.hand_requset(req, res, next)
//       // } else {
//       //   next(err)
//       // }
//     }
//     next()
//     // 都没有匹配 返回404
//     // return this.stack[0].hand_requset && this.stack[0].hand_requset(req, res)

//   }
//   route(path) {
//     let route = new Route(path)
//     let layer = new Layer(path, route.dispath.bind(route))
//     layer.route = route
//     this.stack.push(layer)
//     return route
//   }
//   use (fn) {
//     let path = "/"
//     if(typeof fn !== 'function'){
//       path = fn
//       fn = arguments[1]
//     }
//     let layer = new Layer(path, fn)
//     layer.route = undefined
//     this.stack.push(layer)
//     return this
//   }
// }

http.METHODS.forEach(method => {
  method = method.toLowerCase();
  proto[method] = function (path, fn) {
    let route = this.route(path);
    route[method](fn);
    return this;
  }
})

exports = module.exports = proto