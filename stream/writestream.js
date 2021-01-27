/* 创建 WriteStream 类 */
// 引入依赖模块
const EventEmitter = require('events');
const fs = require('fs');

// 创建 WriteStream 类
class WriteStream extends EventEmitter {
  constructor(path, options = {}) {
    super();
    // 创建可写流参数传入的属性
    this.path = path; // 写入文件的路径
    this.flags = options.flags || 'w'; // 文件标识位
    this.encoding = options.encoding || 'utf8'; // 字符编码
    this.fd = options.fd || null; // 文件描述符
    this.mode = options.mode || 0o666; // 权限位
    this.autoClose = options.autoClose || true; // 是否自动关闭
    this.start = options.start || 0; // 写入文件的起始位置

    // 对比写入字节数的标识
    this.highWaterMark = options.highWaterMark || 16 * 1024;
    this.writing = false; // 是否正在写入
    this.needDrain = false; // 是否需要触发 drain 事件
    this.buffer = []; // 缓存，正在写入就存入缓存中
    this.len = 0; // 当前缓存的个数
    this.pos = this.start; // 下次写入文件的位置（变化的）

    // 创建可写流要打开文件
    this.open();
  }
}

// 导出模块
module.exports = WriteStream;


/* open 方法 */
// 打开文件
WriteStream.prototype.open = function () {
  fs.open(this.path, this.flags, this.mode, (err, fd) => {
    if (err) {
      this.emit('error', err);

      // 如果文件打开了出错，并配置自动关闭，则关掉文件
      if (this.autoClose) {
        // 关闭文件（触发 close 事件）
        this.destroy();

        // 不再继续执行
        return;
      }
    }
    // 存储文件描述符
    this.fd = fd;

    // 成功打开文件后触发 open 事件
    this.emit('open');
  });
}


/* detroy 方法 */
// 关闭文件
WriteStream.prototype.detroy = function () {
  // 判断是否存在文件描述符
  if (typeof this.fd === 'number') {
    // 存在则关闭文件并触发 close 事件
    fs.close(fd, () => {
      this.emit('close');
    });
    return;
  }

  // 不存在文件描述符直接触发 close 事件
  this.emit('close');
}


/* write 方法 */
// 写入文件的方法，只要逻辑为写入前的处理
WriteStream.prototype.write = function (chunk, encoding = this.encoding, callback) {
  // 为了方便操作将要写入的数据转换成 Buffer
  chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

  // 维护缓存的长度
  this.len += chunk.length;

  // 维护是否触发 drain 事件的标识
  this.needDrain = this.highWaterMark <= this.len;

  // 如果正在写入
  if (this.writing) {
    this.buffer.push({
      chunk,
      encoding,
      callback
    });
  } else {
    // 更改标识为正在写入，再次写入的时候走缓存
    this.writing = true;
    // 如果已经写入清空缓存区的内容
    this._write(chunk, encoding, () => this.clearBuffer());
  }

  return !this.needDrain;
}



/* _write 方法 */
// 真正的写入文件操作的方法
WriteStream.prototype._write = function (chunk, encoding, callback) {
  // 由于 open 异步执行，write 是在创建实例时同步执行，write 执行可能早于 open，此时不存在文件描述符
  if (typeof this.fd !== 'number') {
    // 因为 open 用 emit 触发了 open 事件，所以在这是重新执行 write
    return this.once('open', () => this._write(chunk, encoding, callback));
  }

  // 读取文件
  fs.write(this.fd, chunk, 0, chunk.length, this.pos, (err, bytesWritten) => {
    // 维护下次写入的位置和缓存区 Buffer 的总字节数
    this.pos += bytesWritten;
    this.len -= bytesWritten;
    callback();
  });
}


/* clearBuffer 方法 */
// 清空缓存方法
WriteStream.prototype.clearBuffer = function () {
  // 先写入的在数组前面，从前面取出缓存中的 Buffer
  const buf = this.buffer.shift();

  // 如果存在 buf，证明缓存还有 Buffer 需要写入
  if (buf) {
    // 递归 _write 按照编码将数据写入文件
    this._write(buf.chunk, buf.encoding, () => this.clearBuffer());
  } else {
    // 更改正在写入状态
    this.writing = false;

    // 更改是否需要触发 drain 事件状态
    this.needDrain = false;
    
    // 如果没有 buf，说明缓存内的内容已经完全写入文件并清空，需要触发 drain 事件
    this.emit('drain');

    
  }
}


/* 验证 WriteStream */
// 向 2.txt 文件中写入 012345
// const fs = require('fs');
// const WriteStream = require('./WriteStream');

// 创建可写流
const ws = new WriteStream('2.txt', {
  highWaterMark: 3
});

let i = 0;

function write() {
  let flag = true;
  // while (i <= 6 && flag) {
    i++;
    flag = ws.write(i + '', 'utf8');
  // }
}

// ws.on('drain', function () {
//   console.log('写入成功');
//   write();
// });
write();
  write();

  write();
  write();

// true
// true
// false
// 写入成功
// true
// true
// false
// 写入成功