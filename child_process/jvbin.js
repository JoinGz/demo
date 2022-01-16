const path = require('path')

var child1 = require('child_process').fork(path.resolve(__dirname, './child.js'))
var child2 = require('child_process').fork(path.resolve(__dirname, './child.js'))


// child.send(message, [sendHandle])
// Open up the server object and send the handle
var server = require('net').createServer()
server.on('connection', function (socket) {
  socket.end('handled by parent\n')
})
server.listen(1337, function () {
  child1.send('server', server)
  child2.send('server', server)
})
