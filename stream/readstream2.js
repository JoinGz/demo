/* 创建 ReadStream 类 流动模式*/ 
// 引入依赖模块
const EventEmitter = require('events')
const fs = require('fs')

// 创建 ReadStream 类
class ReadStream extends EventEmitter {
  constructor(path, options = {}) {
    super()
    // 创建可读流参数传入的属性
    this.path = path // 读取文件的路径
    this.flags = options.flags || 'r' // 文件标识位
    this.encoding = options.encoding || null // 字符编码
    this.fd = options.fd || null // 文件描述符
    this.mode = options.mode || 0o666 // 权限位
    this.autoClose = options.autoClose || true // 是否自动关闭
    this.start = options.start || 0 // 读取文件的起始位置
    this.end = options.end || null // 读取文件的结束位置（包含）

    // 每次读取文件的字节数
    this.highWaterMark = options.highWaterMark || 64 * 1024
    this.flowing = false // 控制当前是否是流动状态，默认为暂停状态

    // 存储读取内容的 Buffer
    this.buffer = Buffer.alloc(this.highWaterMark)
    this.pos = this.start // 下次读取文件的位置（变化的）

    // 创建可读流要打开文件
    this.open()

    // 如果监听了 data 事件，切换为流动状态
    this.on('newListener', (type) => {
      if (type === 'data') {
        this.flowing = true

        // 开始读取文件
        this.read()
      }
    })
  }
}

/* open 方法 */
// 打开文件
ReadStream.prototype.open = function () {
  fs.open(this.path, this.flags, this.mode, (err, fd) => {
    if (err) {
      this.emit('error', err)

      // 如果文件打开了出错，并配置自动关闭，则关掉文件
      if (this.autoClose) {
        // 关闭文件（触发 close 事件）
        this.destroy()

        // 不再继续执行
        return
      }
    }
    // 存储文件描述符
    this.fd = fd

    // 成功打开文件后触发 open 事件
    this.emit('open')
  })
}

/* detroy 方法 */
// 关闭文件
ReadStream.prototype.detroy = function () {
  // 判断是否存在文件描述符
  if (typeof this.fd === 'number') {
    // 存在则关闭文件并触发 close 事件
    fs.close(this.fd, () => {
      this.emit('close')
    })
    return
  }

  // 不存在文件描述符直接触发 close 事件
  this.emit('close')
}

/* read 方法 */
// 读取文件
ReadStream.prototype.read = function () {
  // 由于 open 异步执行，read 是在创建实例时同步执行，read 执行可能早于 open，此时不存在文件描述符
  if (typeof this.fd !== 'number') {
    // 因为 open 用 emit 触发了 open 事件，所以在这是重新执行 read
    return this.once('open', () => this.read())
  }

  // 如过设置了结束位置，读到结束为止就不能再读了，最后一次读取真实读取数应该小于 highWaterMark
  // 所以每次读取的字节数应该和 highWaterMark 取最小值
  const howMuchToRead = this.end
    ? Math.min(this.highWaterMark, this.end - this.pos + 1)
    : this.highWaterMark

  // 读取文件
  fs.read(
    this.fd,
    this.buffer,
    0,
    howMuchToRead,
    this.pos,
    (err, bytesRead) => {
      // 如果读到内容执行下面代码，读不到则触发 end 事件并关闭文件
      if (bytesRead > 0) {
        // 维护下次读取文件位置
        this.pos += bytesRead

        // 保留有效的 Buffer
        let realBuf = this.buffer.slice(0, bytesRead)

        // 根据编码处理 data 回调返回的数据
        realBuf = this.encoding ? realBuf.toString(this.encoding) : realBuf

        // 触发 data 事件并传递数据
        this.emit('data', realBuf)

        // 递归读取
        if (this.flowing) {
          this.read()
        }
      } else {
        this.isEnd = true
        this.emit('end') // 触发 end 事件
        this.detroy() // 关闭文件
      }
    }
  )
}

/* pause 方法 */
// 暂停读取
ReadStream.prototype.pause = function () {
  this.flowing = false
}

/* resume 方法 */
// 恢复读取
ReadStream.prototype.resume = function () {
  this.flowing = true
  if (!this.isEnd) this.read()
}

// 导出模块
module.exports = ReadStream

/* 验证 ReadStream */
// 文件 1.txt 内容为 0123456789
// const fs = require('fs')
// const ReadStream = require('./ReadStream')

// 创建可读流
const rs = new ReadStream('1.txt', {
  encoding: 'utf8',
  start: 0,
  end: 5,
  highWaterMark: 2,
})

rs.on('open', () => console.log('open'))

rs.on('data', (data) => {
  console.log(data, new Date())
  rs.pause()
})

rs.on('end', () => console.log('end'))
rs.on('close', () => console.log('close'))
rs.on('error', (err) => console.log(err))

setInterval(() => rs.resume(), 1000)

// open
// 01 2018-07-04T10:44:20.384Z
// 23 2018-07-04T10:44:21.384Z
// 45 2018-07-04T10:44:22.384Z
// end
// close
