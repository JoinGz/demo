const Express = require('./lib/express.js')
const app = Express()
const router = Express.Router()
const fs = require('fs')
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
}, function (req, res, next) {
  console.log('进入中间件2');
  next()
})
router.use('/tl', function(req,res,next){
  console.log('进入中间件--tl');
  res.send('123')
})
app.use('/mm', router)
app.engine('gz', function(filePath, options, callback){
  fs.readFile(filePath, (err, content)=>{
      if(err) {
        callback(err)
      }
      const str = content.toString().replace('shuaige', 'Gz!')
      callback(null, str)
  })
})
//views, 放模板文件的目录
app.set('views', './views')
//view engine, 模板引擎
app.set('view engine', 'gz')
app.listen(3003, function () {
  console.log('on 3003 port!');
})