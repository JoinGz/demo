"use strict";
exports.__esModule = true;
exports.myP = void 0;
var STATUS_MEUN;
(function (STATUS_MEUN) {
    STATUS_MEUN["PENDING"] = "PENDING";
    STATUS_MEUN["FAIL"] = "FAIL";
    STATUS_MEUN["SUCCESS"] = "SUCCESS";
})(STATUS_MEUN || (STATUS_MEUN = {}));
var id = 0;
var myP = /** @class */ (function () {
    function myP(fn) {
        this.id = id;
        this.status = STATUS_MEUN.PENDING;
        this._fnArr = [];
        this._catchFnArr = [];
        this.id = id++;
        try {
            fn(this.resolve.bind(this), this.reject.bind(this));
        }
        catch (e) {
            this.reject(e);
        }
    }
    myP.prototype.then = function (fn, errFn) {
        var _this = this;
        console.log('status:' + this.status);
        fn = typeof fn === 'function' ? fn : function (value) { return value; };
        errFn = typeof errFn === 'function' ? errFn : function (value) { throw value; };
        var p2 = new myP(function (r2, j2) {
            if (_this.status === STATUS_MEUN.SUCCESS) {
                queueMicrotask(function () {
                    try {
                        var value = fn(_this._value);
                        return promiseResolve(p2, value, r2, j2);
                    }
                    catch (e) {
                        j2(e);
                    }
                });
            }
            if (_this.status === STATUS_MEUN.FAIL) {
                queueMicrotask(function () {
                    try {
                        var value = errFn(_this._errValue);
                        return promiseResolve(p2, value, r2, j2);
                    }
                    catch (e) {
                        j2(e);
                    }
                });
            }
            if (_this.status === STATUS_MEUN.PENDING) {
                _this._fnArr.push(function () {
                    try {
                        var value = fn(_this._value);
                        return promiseResolve(p2, value, r2, j2);
                    }
                    catch (e) {
                        j2(e);
                    }
                });
                _this._catchFnArr.push(function () {
                    try {
                        var value = errFn(_this._errValue);
                        return promiseResolve(p2, value, r2, j2);
                    }
                    catch (e) {
                        j2(e);
                    }
                });
            }
        });
        return p2;
    };
    myP.prototype["catch"] = function (fn) {
        // 只需要进行错误处理,注册错误处理
        return this.then(null, fn);
    };
    myP.prototype.resolve = function (data) {
        var _this = this;
        if (this.status === STATUS_MEUN.PENDING) {
            this._value = data;
            this.status = STATUS_MEUN.SUCCESS;
            /**
             * 这里不要要异步，就两种情况
             * 1.在注册前。注册事件前调用。
             * 不影响，因为then的时候会再判断此时promise的状态，如果不是pending就会直接增加到微任务执行
             * 2.注册后，注册后所有事件都有了，直接执行即可。
             */
            // queueMicrotask(() => {
            this._fnArr.forEach(function (fn) {
                fn(_this._value);
            });
            // })
        }
    };
    myP.prototype.reject = function (e) {
        var _this = this;
        if (this.status === STATUS_MEUN.PENDING) {
            this._errValue = e;
            this.status = STATUS_MEUN.FAIL;
            // 注释原因： 参看 resolve
            // queueMicrotask(() => {
            this._catchFnArr.forEach(function (fn) {
                fn(_this._errValue);
            });
            // })
        }
    };
    myP.resolve = function (data) {
        return new myP(function (r) { return r(data); });
    };
    myP.reject = function (data) {
        return new myP(function (r, j) { return j(data); });
    };
    return myP;
}());
exports.myP = myP;
new myP(function (R, J) {
    setTimeout(function () {
        R('123');
    }, 1000);
})
    .then(function (data) {
    console.log(data);
    return new myP(function (r, j) {
        j('666');
    });
})
    .then(function (data) {
    console.log(data);
}, function (e) {
    console.log('xixi->', e);
})["catch"](function (e) {
    console.log("catch->".concat(e));
}).then(function (d) {
    console.log('last->then', d);
});
myP.reject('xixida').then(function (e) { return console.log(e); })["catch"](function (e) { return console.log("catch:".concat(e)); });
// myP.resolve().then(() => {
//   console.log(0); // 1
//   return myP.resolve(4)
// }).then((res) => {
//   console.log(res)
// })
// myP.resolve().then(() => {
//   console.log(1); // 0
// }).then(() => {
//   console.log(2); // 2
// }).then(() => {
//   console.log(3); // 3
// }).then(() => {
//   console.log(5); // 5
// }).then(() =>{
//   console.log(6);  // 6
// })
// new Promise<number>((R, J) => {
//   J('123')
// }).then((data) => {
//   console.log(data)
// }).catch(e => {
// })
console.log('begin--');
function promiseResolve(p2, value, r2, j2) {
    if (p2 === value) {
        return j2(new TypeError('The promise and the return value are the same'));
    }
    if (typeof value === 'object' || typeof value === 'function') {
        if (value == null) {
            r2(value);
        }
        var then = void 0;
        try {
            then = value.then;
        }
        catch (error) {
            return j2(error);
        }
        if (typeof then === 'function') {
            var isRuned_1 = false;
            try {
                then.call(value, function (y) {
                    if (isRuned_1)
                        return;
                    isRuned_1 = true;
                    return promiseResolve(p2, y, r2, j2);
                }, function (r) {
                    if (isRuned_1)
                        return;
                    isRuned_1 = true;
                    return j2(r);
                });
            }
            catch (e) {
                if (isRuned_1)
                    return;
                j2(e);
            }
        }
        else {
            r2(value);
        }
    }
    else {
        r2(value);
    }
}
