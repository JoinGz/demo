const express = require('../express/day06/lib/express.js')
const app = express()
const fs = require('fs')
const path = require('path')
function getPath(p) {
  return path.resolve(__dirname, p)
}
console.log(getPath('./a.js'));
let a = 0;
app.get('/a.js', function(req, res) {
  // res.setHeader("Access-Control-Allow-Origin", "*")
  setTimeout(() => {
  fs.createReadStream(getPath('./a.js')).pipe(res)
    
  }, 1 * 1000);
})
app.get('/', function(req, res) {
  // res.setHeader("Access-Control-Allow-Origin", "*")
setTimeout(() => {
  fs.createReadStream(getPath('./a.html')).pipe(res)
  
}, 3 * 1000);
})
app.get('/b.js', function(req, res) {
  // res.setHeader("Access-Control-Allow-Origin", "*")
  fs.createReadStream(getPath('./b.js')).pipe(res)
})
app.listen(3003, function () {
  console.log('on 3003 port!');
})