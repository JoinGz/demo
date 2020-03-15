// 用于测试cors的服务
const http = require('http')
http
    .createServer((req, res) => {
        console.log('当前请求方法：'+req.method)
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.end('ok')
    }).listen('3002', () => {
        console.log('3002');

    })