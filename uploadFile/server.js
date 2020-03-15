const http = require('http')
const fs = require('fs')
const multiparty = require('multiparty')
const util = require('util')
const path = require('path')
const upload_file_path = path.resolve(__dirname, 'target')
const upload_file_path_finish = path.resolve(__dirname, 'finish')
const upload_file_path_tmp = path.resolve(__dirname, 'tmp')

http
  .createServer((request, response) => {
    if (!fs.existsSync(upload_file_path)) {
      fs.mkdirSync(upload_file_path, { recursive: true })
    }
    if (!fs.existsSync(upload_file_path_finish)) {
      fs.mkdirSync(upload_file_path_finish, { recursive: true })
    }
    if (!fs.existsSync(upload_file_path_tmp)) {
      fs.mkdirSync(upload_file_path_tmp, { recursive: true })
    }
    const url = request.url
    if (url === '/') {
      fs.createReadStream('./uploadFile.html').pipe(response)
    } else if (url === '/upload' && request.method.toLowerCase() == 'post') {
      // 在 multiparty.parse 的回调中，files 参数保存了 FormData 中文件
      // fields 参数保存了 FormData 中非文件的字段
      const multipartEx = new multiparty.Form()
      // 设置下临时目录
      multipartEx.uploadDir = 'tmp'
      multipartEx.parse(request, async (err, fields, files) => {
        if (err) {
          console.log(err)
          return
        }
        const [chunk] = files.chunk
        const [hash] = fields.hash
        const [fileHashName] = fields.fileHashName
        const [filename] = fields.filename
        const chunkDir = `${upload_file_path}/${fileHashName}`

        if (!fs.existsSync(chunkDir)) {
          fs.mkdirSync(chunkDir, { recursive: true })
        }
        await fs.rename(chunk.path, `${chunkDir}/${hash}`, err => {
          if (err) {
            console.log('重命名失败')
            console.log(err)
          }
        })
        response.end('123')
        // response.write(request.method)
      })
    } else if (url === '/merge' && request.method.toLowerCase() == 'post') {
      let reqData = ''
      request.on('data', chunk => {
        reqData += chunk
      })
      request.on('end', () => {
        reqData = JSON.parse(reqData)
        if (mergeFile(reqData)) {
          response.write('成功')
        } else {
          response.write('失败')
        }
        response.end()
      })
    } else if (url === '/getmd5js') {
      response.setHeader('Content-Type', 'text/javascript')
      fs.createReadStream('./md5.js').pipe(response)
    } else if (url === '/isExist' && request.method.toLowerCase() == 'post') {
      let reqData = ''
      request.on('data', chunk => {
        reqData += chunk
      })
      request.on('end', () => {
        reqData = JSON.parse(reqData)
        if (checkFileExist(reqData)) {
          response.write(
            JSON.stringify({
              success: true,
              code: 1,
              codeName: '已存在'
            })
          )
        } else {
          response.write(
            JSON.stringify({
              success: true,
              code: -1,
              codeName: '不存在'
            })
          )
        }
        response.end()
      })
    } else if (
      url === '/getuploadedList' &&
      request.method.toLowerCase() == 'post'
    ) {
      let reqData = ''
      request.on('data', chunk => {
        reqData += chunk
      })
      request.on('end', () => {
        reqData = JSON.parse(reqData)
        let arr = uploadedList(reqData)
        response.write(
          JSON.stringify({
            success: true,
            result: arr
          })
        )
        response.end()
      })
    } else if (url === '/uploadST' &&
      request.method.toLowerCase() == 'options') {
      // 处理跨域预请求
      response.setHeader("Access-Control-Allow-Origin", "http://192.168.0.5:8080")
      response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      response.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
      response.setHeader("Access-Control-Allow-Credentials", "true");
      // response.setHeader("Content-Type", "application/json;charset=utf-8");
      response.end('pass')
    } else if (url === '/uploadST' &&
      request.method.toLowerCase() == 'post') {
      // 正式请求
      response.setHeader("Access-Control-Allow-Origin", "http://192.168.0.5:8080")
      // response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      // response.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
      response.setHeader("Access-Control-Allow-Credentials", "true");
      const multipartEx = new multiparty.Form()
      // 设置下临时目录
      multipartEx.uploadDir = 'uploadST'
      multipartEx.parse(request, async (err, fields, files) => {
        if (err) {
          console.log(err)
          response.end('fail')
          return
        }
        response.end('success')
        // response.write(request.method)
      })
    } else if (url === '/corsTest' &&
      request.method.toLowerCase() == 'post') {
      response.setHeader("Content-Type", "text/plain;charset=utf-8")
      response.end('同源不会预请求')
    } else {
      response.end('404')
    }
  })
  .listen(3001, () => {
    console.log('on 3001 port!')
  })

function mergeFile({ fileHashName, filename }) {
  const chunkDir = `${upload_file_path}/${fileHashName}`
  if (!fs.existsSync(chunkDir)) {
    return false
  }
  let fileArr = fs.readdirSync(chunkDir)
  fileArr.forEach(item => {
    fs.appendFileSync(
      `${upload_file_path_finish}/${fileHashName}${getExt(filename)}`,
      fs.readFileSync(`${chunkDir}/${item}`)
    )
    fs.unlinkSync(`${chunkDir}/${item}`, err => {
      if (err) {
        console.log(err)
        console.log('删除文件失败')
        return
      }
    })
  })
  fs.rmdirSync(chunkDir, {}, err => {
    if (err) {
      console.log(err)
      console.log('删除文件夹失败')
      return
    }
  })
  return true
}
function filename2Path(filename) {
  return filename.replace('.', '')
}
function getExt(file) {
  // 获取后缀名
  return file.slice(file.lastIndexOf('.'), file.length)
}
function checkFileExist({ fileHashName, filename }) {
  if (
    fs.existsSync(
      `${upload_file_path_finish}/${fileHashName}${getExt(filename)}`
    )
  ) {
    return true
  } else {
    return false
  }
}

function uploadedList({ fileHashName, filename }) {
  const chunkDir = `${upload_file_path}/${fileHashName}`
  if (fs.existsSync(`${chunkDir}`)) {
    return fs.readdirSync(chunkDir)
  } else {
    return []
  }
}
