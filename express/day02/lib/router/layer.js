// 具体细分处理
class Layer {
  constructor (path, fn) {
    this.path = path;
    this.fn = fn;
    this.fnName = fn.name || '<anonymous>';
  }
  hand_requset (req, res) {
    this.fn && this.fn(req, res)
  }
  match (path) {
    if (path === this.path || path === '*') {
      return true
    }
    return false
  }
}

exprots = module.exports = Layer