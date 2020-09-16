const Readable = require('stream').Readable;
// 实现一个可读流
class SubReadable extends Readable {
  constructor(dataSource, options) {
    super(options);
    this.dataSource = dataSource;
  }
  // 必须通过_read方法调用push来实现对底层数据的读取
  _read() {
    console.log('B阈值规定大小：', arguments['0'] + ' bytes')
    const data = this.dataSource.makeData()
    let result = this.push(data)
    if(data) console.log('B添加数据大小：', data.toString().length + ' bytes')
    console.log('B已缓存数据大小: ', subReadable._readableState.length + ' bytes')
    console.log('B超过阈值限制或数据推送完毕：', !result)
    console.log('B====================================')
  }
}

// 模拟资源池
const dataSource = {
  data: new Array(80000).fill('1'),
  // 每次读取时推送一定量数据
  makeData() {
    if (!dataSource.data.length) return null;
    return dataSource.data.splice(dataSource.data.length - 5000).reduce((a,b) => a + '' + b)
  },
};

const subReadable = new SubReadable(dataSource, );
subReadable.setEncoding('utf8');
// 流的暂停模式
// 这里我们使用了 'readable' 事件，当有数据可从流中读取时，就会触发 'readable' 事件
// 当到达流数据的尽头时， 'readable' 事件也会触发，但是在 'end' 事件之前触发。
subReadable.on('readable', () => {
  /**
   * 当直接调用read()，n参数则为NaN，当处于流动模式的时候n则为buffer头数据的长度，
   * 否则是整个缓存的数据长度。若为read(n)传入数字，大于当前的hwm时可以发现会重新计算一个hwm，
   * 与此同时如果已缓存的数据小于请求的数据量，那么将设置state.needReadable = true;并返回0；
   */
    // 当read不传入时，会读取整个缓存的数据长度，读取一次后面就会自动读取
    let chunk = subReadable.read()
    if(chunk) 
    console.log(`A读取 ${chunk.length} bytes数据`);
    console.log('A缓存剩余数据大小: ', subReadable._readableState.length + ' byte')
    console.log('A------------------------------------')

    // 当指定read值的时候，如果值小于已缓存的数据，就不会在调用read了，需要手动调用。
    // 如果每次读取的字节少于缓存中的数据，则可读流不会再从资源加载新的数据
    // let chunk
    // while (chunk = subReadable.read(4000)) {
    //   console.log(`A读取 ${chunk.length} bytes数据`);
    //   console.log('A缓存剩余数据大小: ', subReadable._readableState.length + ' byte')
    //   console.log('A------------------------------------')
    // }
})

// 防止程序过早退出
setTimeout(() => {
  console.log('over')
}, 30000);