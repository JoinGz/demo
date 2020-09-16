const http = require('http')
const res = Object.create(http.ServerResponse.prototype)
res.send = function (str) {
  this.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  this.write(str)
  this.end()
}
module.exports = res