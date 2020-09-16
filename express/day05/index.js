const Express = require('./lib/express.js')
const app = Express()
const router = Express.Router()
// app.get('/gztest',function (req, res) {
//   res.send('gz')
// }).post('/gztest', function (req,res) {
//   res.send('gztest')
// })

// app.get('/', function(req, res, next) {
// 	next();
// })

// .get('/', function(req, res, next) {
// 	next(new Error('error-test'));
// })

// .get('/', function(req, res) {
// 	res.send('third');
// });
router.use(function(req,res,next){
  console.log('进入中间件');
  next()
})
router.use('/tl', function(req,res,next){
  console.log('进入中间件--tl');
  res.send('123')
})
app.use('/mm', router)
app.listen(3003, function () {
  console.log('on 3003 port!');
  
})