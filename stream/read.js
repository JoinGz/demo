// 参考文章： https://juejin.im/post/5940a9c3128fe1006a0ab176#heading-2
// 流模式的转换 https://juejin.im/post/6844904078363852807#heading-13
// https://juejin.im/post/6844903588402036750#heading-1
// 可写流 主要是自定义write方法
const { Writable, Readable  } = require('stream');
const outStream = new Writable({
  write(chunk, encoding, callback){
    /**
     * chunk 通常是一个 buffer，除非我们对流进行了特殊配置。
     * encoding 通常可以忽略。除非 chunk 被配置为不是 buffer。
     * callback 方法是一个在我们完成数据处理后要执行的回调函数。它用来表示数据是否成功写入。
     * 若是写入失败，在执行该回调函数时需要传入一个错误对象。
     */
    console.log(Object.prototype.toString.call(chunk));
    console.log(chunk);
    
    console.log(chunk.toString());
    callback()
  }
})

process.stdin.pipe(outStream);

// 可读流 主要是自定义read方法

const inStream = new Readable()
inStream.push('gz,')
inStream.push('666!')
inStream.push(null) // 当我们 push 一个 null 值，这表示该流后续不会再有任何数据了。
inStream.pipe(process.stdout);

/**
 * 当我们执行以上代码时，所有读取自 inStream 的数据都会被显示到标准输出上。非常简单，但并不高效。
 * 在把该流连接到 process.stdout 之前，我们就已经推送了所有数据。
 * 更好的方式是只在使用者要求时按需推送数据。我们可以通过在可读流配置中实现 read() 方法来达成这一目的：
 */

const inStream2 = new Readable({
  read(size){
    this.push(String.fromCharCode(this.currentCharCode++))
    if (this.currentCharCode > 90) {
      this.push(null)
    }
  }
})
inStream2.currentCharCode = 65
inStream2.pipe(process.stdout);

/**
 * 当使用者读取该可读流时，read 方法会持续被触发，我们不断推送字母。
 * 我们需要在某处停止该循环，这就是为何我们放置了一个 if 语句以便在 currentCharCode 大于 90（代表 Z） 时推送一个 null 值。
 * 这段代码等价于之前的我们开始时编写的那段简单代码，但我们已改为在使用者需要时推送数据。你始终应该这样做。
 */


/**
  可读流分为：
  1.暂停模式
    先读取到highWaterMark个数据，等待用户调用read(n),n大于highWaterMark，更改highWaterMark为n,小于等于读取到
    highWaterMark个数据返回buffer。
  2.流动模式

    实现：
    自己调自己，不断的读取highWaterMark个数据。


      流动模式中又有暂停状态（stream.pause()）和流动状态（stream.resume()）。
  如果同时监听data(流动模式)、readable(暂停模式)，暂停模式会起作用，暂停模式中返回的buffer会同步到data里面。
  但是需要留意的是，如果流存在 'readable' 事件监听器或调用了 stream.read()，则 readable.pause() 方法不起作用（流动模式才才起作用）。

  模式切换
  1.流动切换暂停模式：stream.unpipe()
  const stream = fs.createReadStream(files["what-is-a-stream"], {
    highWaterMark: 20
  });
  // 切换到流动模式
  stream.pipe(process.stdout);
  setTimeout(() => {
    // 切换为暂停模式
    stream.unpipe();
    // 暂停模式下，读取数据
    stream.on("readable", () => {
      let data;
      while (null !== (data = stream.read())) {
        console.log("From paused mode:", data.toString());
      }
    });
  }, 3);
  2.暂停切换到流动，无法切换。只可以流动模式中，流动和暂停状态的切换
  
  
 */


/**
  可写流
  
  接受数据，写入载体。如果写入的超过highWaterMark返回false,一次的写完了调用drain，表示可以再次写入。
  
  
 */


/**
  提交代码检查
  1.husky 功能比较多
  2.pre-commit 就在提交前检查就可以用这个
  
  只检查改动的 lint-staged 参考：https://juejin.cn/post/6844904013368934407#heading-28
 */