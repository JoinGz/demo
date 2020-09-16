const http = require('http')
const res = Object.create(http.ServerResponse.prototype)
res.send = function (str) {
  this.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  this.write(str)
  this.end()
}
res.render = function (fileName, options = {}, callback) {
  const app = this.req.app
  const self = this;
  //如果定义回调，则返回，否则渲染
  const done = callback || function (err, str) {
    if(err) {
      self.req.next(err)
    }
    self.send(str)
  }
  //渲染
  app.render(fileName, options, done)
}
module.exports = res