const Layer = require('./layer')
// Route 类，它包含用于区分相同路径，不同请求方法的路由
class Route {
  constructor (path) {
    this.path = path;
    this.stack = [];
    this.method = {}
  }
  _handles_method (method) {
    let name = method.toLowerCase()
    return Boolean(this.method[name])
  }
  get(fn) {
    let layer = new Layer('/', fn)
    layer.method = 'get'
    this.method.get = true
    this.stack.push(layer)
    return this;
  }
  dispath(req, res,) {
    const method = req.method.toLowerCase();
    for (let i = 0; i < this.stack.length; i++) {
      const layer = this.stack[i];
      if (layer.method = method) {
        return layer.hand_requset(req, res)
      }
    }
  }

}
exports = module.exports = Route