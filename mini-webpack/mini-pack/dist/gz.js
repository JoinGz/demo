;(function (pathAndId) {
  function getObjFromId(path) {
    return pathAndId[path]
  }
  function require(id) {
    let module = {exports: {}}
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
  
    0 : {
      code: function (require, module, exports) {
        "use strict";

var _sayHello = require("./src/sayHello.js");

var _sayHello2 = _interopRequireDefault(_sayHello);

var _test = require("./test.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log("\u591A\u6B21\u4F9D\u8D56" + _test.test + "\u6D4B\u8BD5");
(0, _sayHello2.default)();
      },
      depends: {"./src/sayHello.js":1,"./test.js":6}
    },
    

    1 : {
      code: function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _name = require("./name.js");

var _name2 = _interopRequireDefault(_name);

var _package = require("../package.json");

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sayHello() {
  console.log(_package2.default);
  console.log("hello, " + _name2.default);
}

exports.default = sayHello;
      },
      depends: {"./name.js":3,"../package.json":4}
    },
    

    3 : {
      code: function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _test = require("../test.js");

var name = 'Gz';
console.log(_test.test);
exports.default = name;
      },
      depends: {"../test.js":6}
    },
    

    4 : {
      code: function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "{\n  \"name\": \"mini-pack\",\n  \"version\": \"1.0.0\",\n  \"description\": \"理解打包工具的核心原理\",\n  \"main\": \"index.js\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"test\": \"echo \\\"Error: no test specified\\\" && exit 1\"\n  },\n  \"author\": \"\",\n  \"license\": \"ISC\",\n  \"dependencies\": {\n    \"@babel/parser\": \"^7.16.8\",\n    \"@babel/traverse\": \"^7.16.8\",\n    \"babel-core\": \"^6.26.3\",\n    \"babel-preset-env\": \"^1.7.0\",\n    \"ejs\": \"^3.1.6\",\n    \"tapable\": \"^2.2.1\"\n  }\n}\n";
      },
      depends: {}
    },
    

    6 : {
      code: function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.test = undefined;

var _pathtest = require("./src/pathtest/apath/bpath/pathtest.js");

var test = exports.test = _pathtest.pathtest;
      },
      depends: {"./src/pathtest/apath/bpath/pathtest.js":7}
    },
    

    7 : {
      code: function (require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var pathtest = exports.pathtest = 'pathtest';
      },
      depends: {}
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
