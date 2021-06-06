const express = require('../express/day06/lib/express.js')
const app = express()
const fs = require('fs')
app.get('/', function(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  fs.createReadStream('./yzm/sj3.jpg').pipe(res)
})
app.listen(3003, function () {
  console.log('on 3003 port!');
})