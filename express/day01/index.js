const Express = require('./lib/index.js')
const app = new Express()
app.get('/gztest',function (req, res) {
  res.send('gz')
})

app.listen(3003, function () {
  console.log('on 3003 port!');
  
})