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
    if(!fs.existsSync(upload_file_path)) {
      fs.mkdirSync(upload_file_path, { recursive: true },)
    }
    if(!fs.existsSync(upload_file_path_finish)) {
      fs.mkdirSync(upload_file_path_finish, { recursive: true },)
    }
    if(!fs.existsSync(upload_file_path_tmp)) {
      fs.mkdirSync(upload_file_path_tmp, { recursive: true },)
    }
    const url = request.url
    if (url === '/') {
      fs.createReadStream('./uploadFile.html').pipe(response)
    } else if (url === '/upload' && request.method.toLowerCase() == 'post') {
      // 在 multiparty.parse 的回调中，files 参数保存了 FormData 中文件
      // fields 参数保存了 FormData 中非文件的字段
      const multipartEx = new multiparty.Form();
      // 设置下临时目录
      multipartEx.uploadDir='tmp';
      multipartEx.parse(request, async (err, fields, files) => {
        if (err) {
          console.log(err)
          return
        }
        const [chunk] = files.chunk
        const [hash] = fields.hash
        const [filename] = fields.filename
        const chunkDir = `${upload_file_path}/${filename2Path(filename)}`
        if(!fs.existsSync(chunkDir)) {
          fs.mkdirSync(chunkDir, { recursive: true },)
        }
        await fs.rename(chunk.path, `${chunkDir}/${hash}`,(err)=>{
          if(err){
            console.log('重命名失败');
            console.log(err);
          }
        })
        response.end('123')
        // response.write(request.method)
      })
      
    } else if (url === '/merge' && request.method.toLowerCase() == 'post') {
      let reqData = ''
      request.on('data',(chunk)=>{
        reqData += chunk
      })
      request.on('end',()=>{
        reqData = JSON.parse(reqData)
        if (mergeFile(reqData) ) {
          response.write('成功')
        } else {
          response.write('失败')
        }
        response.end()
      })
    }
  })
  .listen(3001, () => {
    console.log('on 3001 port!')
  })

function mergeFile({filename}) {
  const chunkDir = `${upload_file_path}/${filename2Path(filename)}`
  if(!fs.existsSync(chunkDir)) {
    return false
  }
  let fileArr = fs.readdirSync(chunkDir)
  fileArr.forEach((item)=>{
    fs.appendFileSync(`${upload_file_path_finish}/${filename}`,fs.readFileSync(`${chunkDir}/${item}`))
    fs.unlinkSync(`${chunkDir}/${item}`,(err)=>{
      if (err) {
        console.log(err)
        console.log('删除文件失败')
        return
      }
    })
  })
  fs.rmdirSync(chunkDir,{},(err)=>{
    if (err) {
      console.log(err)
      console.log('删除文件夹失败')
      return
    }
  })
  return true
}
function filename2Path (filename) {
  return filename.replace('.','')
}