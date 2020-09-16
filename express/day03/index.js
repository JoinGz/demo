const Express = require('./lib/express.js')
const app = Express()
app.get('/gztest',function (req, res) {
  res.send('gz')
}).post('/gztest', function (req,res) {
  res.send('gztest')
})

app.get('/', function(req, res, next) {
	next();
})

.get('/', function(req, res, next) {
	next(new Error('error-test'));
})

.get('/', function(req, res) {
	res.send('third');
});

app.listen(3003, function () {
  console.log('on 3003 port!');
  
})