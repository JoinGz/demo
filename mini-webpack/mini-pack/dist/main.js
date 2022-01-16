;(function (pathAndId) {
  function getObjFromId(path) {
    return pathAndId[path]
  }
  function require(id) {
    let module = { exports: {} }
    const obj = getObjFromId(id)
    obj.code(requirePath, module, module.exports)
    function requirePath(path) {
      const id = obj.depends[path]
      return require(id)
    }
    return module.exports
  }

  require(0)
})({
  0: {
    code: function (require, module, exports) {
      'use strict'

      var _sayHello = require('./src/sayHello.js')

      var _sayHello2 = _interopRequireDefault(_sayHello)

      var _test = require('./test.js')

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj }
      }

      console.log('\u591A\u6B21\u4F9D\u8D56' + _test.test + '\u6D4B\u8BD5')
      ;(0, _sayHello2.default)()
    },
    depends: { './src/sayHello.js': 1, './test.js': 5 },
  },

  1: {
    code: function (require, module, exports) {
      'use strict'

      Object.defineProperty(exports, '__esModule', {
        value: true,
      })

      var _name = require('./name.js')

      var _name2 = _interopRequireDefault(_name)

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj }
      }

      function sayHello() {
        console.log('hello, ' + _name2.default)
      }

      exports.default = sayHello
    },
    depends: { './name.js': 3 },
  },

  3: {
    code: function (require, module, exports) {
      'use strict'

      Object.defineProperty(exports, '__esModule', {
        value: true,
      })

      var _test = require('../test.js')

      var name = 'Gz'
      console.log(_test.test)
      exports.default = name
    },
    depends: { '../test.js': 5 },
  },

  5: {
    code: function (require, module, exports) {
      'use strict'

      Object.defineProperty(exports, '__esModule', {
        value: true,
      })
      exports.test = undefined

      var _pathtest = require('./src/pathtest/apath/bpath/pathtest.js')

      var test = (exports.test = _pathtest.pathtest)
    },
    depends: { './src/pathtest/apath/bpath/pathtest.js': 6 },
  },

  6: {
    code: function (require, module, exports) {
      'use strict'

      Object.defineProperty(exports, '__esModule', {
        value: true,
      })
      var pathtest = (exports.pathtest = 'pathtest')
    },
    depends: {},
  },

  // 0: {
  //   code: function (require, module, exports) {
  //     'use strict'
  //     var _sayHello = require('./src/sayHello.js')
  //     var _sayHello2 = _interopRequireDefault(_sayHello)
  //     function _interopRequireDefault(obj) {
  //       return obj && obj.__esModule ? obj : { default: obj }
  //     }
  //     ;(0, _sayHello2.default)()
  //   },
  //   depends: { './src/sayHello.js': 1 },
  // }
})
