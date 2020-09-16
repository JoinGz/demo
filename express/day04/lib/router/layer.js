// 具体细分处理
class Layer {
  constructor (path, fn) {
    this.fn = fn;
    this.fnName = fn.name || '<anonymous>';
    
    this.path = undefined;
    this.fast_star = (this.path === '*')
    if (!this.fast_star) {
      this.path = path
    }
  }
  hand_requset (req, res, next) {
    try {
      this.fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
  handle_error (err, req, res, next) {
    let fn = this.handle
    if (fn.length !== 4) {
      return next(err)
    }
    try {
      fn(err,req,res,next)
    } catch (error) {
      next(error)
    }
  }
  match (path) {
    //如果为*，匹配
    if (this.fast_star) {
      this.path = ''
      return true
    }
    // 如果是普通路由，从后匹配
    // this.route ? ==> layte.route = route; router.js ---> 43行
    if (this.route && this.path === path.slice(-this.path.length)) {
      return true
    }

    if (!this.route) {
      // // 带路径中间件
      // if (this.path) {
      //   if(this.path === path)
      // } else {
      //   // 不带路径中间件

      // }

        //不带路径的中间件
      if (this.path === '/') {
        // this.path = '' 是为了给removed '',就是没有裁剪
        this.path = '';
        return true;
      }

      //带路径中间件
      if(this.path === path.slice(0, this.path.length)) {
        return true;
      }
    }
    return false
  }
}

exprots = module.exports = Layer