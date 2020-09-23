const request = require('../req.js')
const response = require('../res.js')

exports.init = function (app) {
  return function middleware (req, res, next) {
    //request文件可能用到res对象
    req.res = res;
  
    //response文件可能用到req对象
    res.req = req;
    req.app = app;
    //修改原始req和res原型
    Object.setPrototypeOf(req, request)
    Object.setPrototypeOf(res, response)
    next()
  }
}
