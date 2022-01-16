// console.log('child')

// process.on('message', (m) => {
//   console.log('接受到值-child')
//   console.log(m)
// })

// process.send({ xx: 123 })

process.on('message', function (m, server) {
  if (m === 'server') {
    server.on('connection', function (socket) {
      socket.end('handled by child, pid is ' + process.pid + '\n')
    })
  }
})