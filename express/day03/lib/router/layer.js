// 具体细分处理
class Layer {
  constructor (path, fn) {
    this.path = path;
    this.fn = fn;
    this.fnName = fn.name || '<anonymous>';
  }
  hand_requset (req, res, next) {
    try {
      this.fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
  handle_error (err, req, res, next) {
    let fn = this.fn
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
    if (path === this.path || path === '*') {
      return true
    }
    return false
  }
}

exprots = module.exports = Layer