## 理解打包工具的核心原理

### 依赖的处理

把入口文件传入`@babel/parser`获取到文件的 AST,使用`@babel/traverse`遍历 AST 并在其中注册 ImportDeclaration 回调来获取依赖的文件

### esm 转 commonjs

使用`babel-core`中的`transformFromAst`方法,传入已经取到的 AST,中间需要安装`babel-preset-env`然后就能得到处理好的 code
### 相对依赖的处理
相对依赖根据其绝对位置来获取id,后根据id来获取依赖的内容

### 多次依赖的处理

对于绝对路径一致的依赖，我认为是同一依赖。在获取到所有依赖之后根据路径然后过滤

### 最后的代码状态

传给模版的数据接口如下：

- 所有的依赖进行扁平化,所有依赖平铺为对象的值,id 为键
- 列出当前文件所需要的依赖 id

```javascript

{
  0: {
    // 写的原始代码
    code: function (require, module, exports) {
      'use strict'

      var _sayHello = require('./src/sayHello.js')

      var _sayHello2 = _interopRequireDefault(_sayHello)

      // 需要状态require根据路径来需要对应的id
      var _test = require('./test.js')

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj }
      }

      console.log('\u591A\u6B21\u4F9D\u8D56' + _test.test + '\u6D4B\u8BD5')
      ;(0, _sayHello2.default)()
    },
    // 所有依赖项,以及其对应的id
    depends: { './src/sayHello.js': 1, './test.js': 5 },
  }，
  1: {
    code: function (require, module, exports) {...},
    depends: ...
  },
  5: {
    code: function (require, module, exports) {...},
    depends: ...
  },
}


```


### loader的实现

loader的作用: loader把非js的文件，转换成js。
转换成js后在给babel做AST
所以实现就是在获取到原始文件后，loader的test正则如果匹配文件的后缀，就把原文件传入loader中。最后loader输出js。

### plugins的实现

基于tapable事件流,在开始的时候传入hook,提供给用户注册事件。然后在打包的各个阶段触发回调。回调时可以传入一些参数来改变整个webpack中的一些变量，从而改变打包结果。


## 总结

通过mini-webpack，了解webpack。同时学习其设计思想。如抽离出来的tapable事件流。