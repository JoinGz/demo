const path = require("path")
const cp = require('child_process')
const n = cp.fork(path.resolve(__dirname , './child.js'))

console.log('main')

n.on('message', (m) => {
  console.log('接受到值-main')
  console.log(m)
})

n.send('发送一个值')

setTimeout(() => {
  console.log('end');
  
}, 50 * 1000);