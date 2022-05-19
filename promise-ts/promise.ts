enum STATUS_MEUN {
  PENDING = 'PENDING',
  FAIL = 'FAIL',
  SUCCESS = 'SUCCESS',
}

type resolve<T> = (data: T | plike<T>) => void
type reject<T> = (data: T) => void
type fn<T, P = any> = (resolve: resolve<T>, reject: reject<P>) => void

interface plike<T> {
  // p = nerver ? 当P不存的时候给一个never?
  then<Y = T, P = never>(
    successFn?: (data: T) => Y | plike<Y>,
    failFn?: (errData: any) => P | plike<P>
  ): plike<Y | P>
}

let id = 0

class myP<T> {
  id: number = id
  private status: STATUS_MEUN = STATUS_MEUN.PENDING
  private _value!: T
  private _errValue!: any
  private _fnArr: ((data: T) => void)[] = []
  private _catchFnArr: ((data: T) => void)[] = []

  constructor(fn: fn<T>) {
    this.id = id++
    try {
      fn(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
  }

  then<Y = T, P = never>(
    fn?: (data: T) => Y | plike<Y>,
    errFn?: (e: any) => P | plike<P>
  ): myP<Y | P> {
    fn = typeof fn === 'function' ? fn : (value: T | Y) => value as Y
    errFn =
      typeof errFn === 'function'
        ? errFn
        : (value) => {
            throw value
          }

    const p2 = new myP<Y | P>((r2, j2) => {
      if (this.status === STATUS_MEUN.SUCCESS) {
        queueMicrotask(() => {
          try {
            const value = fn!(this._value)
            return promiseResolve(p2, value, r2, j2)
          } catch (e) {
            j2(e)
          }
        })
      }
      if (this.status === STATUS_MEUN.FAIL) {
        queueMicrotask(() => {
          try {
            const value = errFn!(this._errValue)
            return promiseResolve(p2, value, r2, j2)
          } catch (e) {
            j2(e)
          }
        })
      }
      if (this.status === STATUS_MEUN.PENDING) {
        this._fnArr.push(() => {
          try {
            const value = fn!(this._value)
            return promiseResolve(p2, value, r2, j2)
          } catch (e) {
            j2(e)
          }
        })
        this._catchFnArr.push(() => {
          try {
            const value = errFn!(this._errValue)
            return promiseResolve(p2, value, r2, j2)
          } catch (e) {
            j2(e)
          }
        })
      }
    })

    return p2
  }

  catch<B>(fn: (data: any) => B | plike<B>): myP<T | B> {
    // 只需要进行错误处理,注册错误处理
    return this.then(null!, fn)
  }

  private resolve(data: T | plike<T>) {
    if (this.status === STATUS_MEUN.PENDING) {
      this._value = data as T
      this.status = STATUS_MEUN.SUCCESS
      /**
       * 这里不要要异步，就两种情况
       * 1.在注册前。注册事件前调用。
       * 不影响，因为then的时候会再判断此时promise的状态，如果不是pending就会直接增加到微任务执行
       * 2.注册后，注册后所有事件都有了，直接执行即可。
       */
      // queueMicrotask(() => {
      this._fnArr.forEach((fn) => {
        fn(this._value)
      })
      // })
    }
  }

  private reject(e: any) {
    if (this.status === STATUS_MEUN.PENDING) {
      this._errValue = e
      this.status = STATUS_MEUN.FAIL
      // 注释原因： 参看 resolve
      // queueMicrotask(() => {
      this._catchFnArr.forEach((fn) => {
        fn(this._errValue)
      })
      // })
    }
  }

  static resolve(): myP<unknown>
  static resolve<T>(data: T): myP<T>
  static resolve<T>(data?: T): myP<T>  {
    if (data instanceof myP) {
      return data
    }
    return new myP((r) => r(data!))
  }

  static reject(data: any): myP<never> {
    return new myP((r, j) => j(data))
  }

  // 为什么要必须增加一个 | [unknown] 才能停止数组的扩宽
  // 猜测是因为重载也把一个的情况包含进来，相当于所有的情况都走这种重载
  static all<T extends unknown[] | [unknown]>(plist: T): myP<{
     [P in keyof T] : T[P] extends plike<infer V> ? V : T[P]
  }>
  // static all<T1, R1>(plist: [T1 | plike<T1>, R1 | plike<R1>]): myP<[T1, R1]>
  // static all<T1, R1, Y>(
  //   plist: [T1 | plike<T1>, R1 | plike<R1>, Y | plike<Y>]
  // ): myP<[T1, R1, Y]>
  // static all<T1, R1, Y, P>(
  //   plist: [T1 | plike<T1>, R1 | plike<R1>, Y | plike<Y>, P | plike<P>]
  // ): myP<[T1, R1, Y, P]>
  // static all<T1, R1, Y, P, Z>(
  //   plist: [T1 | plike<T1>, R1 | plike<R1>, Y | plike<Y>, P | plike<P>, Z | plike<Z>]
  // ): myP<[T1, R1, Y, P, Z]>
  // static all<T>(plist: (T | plike<T>)[]): myP<T[]>
  // TODO: 把 any 改变成 myP<T[]> 会报错  - - ! (重载函数的返回值有冲突，想不报错需要使用联合类型，这里在上面的重载函数后面增加 myP<T[]>)
  static all<T>(plist: (T | plike<T>)[]): myP<T[]> {
    let length = plist.length
    let resultList: T[] = []
    let nowRunNum = 0
    return new myP((r, j) => {
      for (let i = 0; i < length; i++) {
        const promiseInstance = plist[i]

        if (isMyp(promiseInstance)) {
          promiseInstance.then(
            (data) => {
              resultList.push(data)
              nowRunNum++
              if (nowRunNum === length) {
                r(resultList)
              }
            },
            (e) => {
              j(e)
            }
          )
        } else {
          resultList.push(promiseInstance as T)
          nowRunNum++
          if (nowRunNum === length) {
            r(resultList)
          }
        }
      }
    })
  }

  // T 在数组中（T[]）表示任意类型，T extends myP<infer U> ? U : T 如果是myP则取出返回值，放入联合类型
  static race<T>(list: Iterable<T>): myP<T extends myP<infer U> ? U : T> {
    return new myP((r, J) => {
      // 获取迭代器对象
      let iter = list[Symbol.iterator]()
      let result = iter.next()

      while (!result.done) {
        
        if (result.value instanceof myP) {
            result.value.then(r, J)
            // result.value.then((data: T) => {
            //   r(data)
            // }, (e) => {
            //   J(e)
            // })
          } else {
            r(result.value as T extends myP<infer U> ? U : T)
          }
          result = iter.next()
      }

    })
  }

  public finally(fn?: ()=> void): myP<T> {
    return this.then((value => {
      // 如果 onfinally 返回的是一个 thenable 也会等返回的 thenable 状态改变才会进行后续的 Promise
      return myP.resolve(
        typeof fn === 'function' ? fn() : fn
      ).then(()=>value)
    }), (value => {
      return myP.reject(
        typeof fn === 'function' ? fn() : fn
      ).catch(()=>{throw value})
    }))
  }

  /**
   * readonly 也没有解决值对应问题（扩宽问题）  通过循环数组解决
   * keyof 各种东西看是什么 
   * readonly 与数组的关系
   * 如何保证返回的数据和传入的数组一致  记录原数组的index，更新到新数组上
   * @param list 
   */
  // static allSettled<T extends unknown[]>(list: T): myP<allSettledObj<T>[]>
  static allSettled<T extends  readonly unknown[] |  readonly [unknown]>(list: T): myP<{
    [P in keyof T]: allSettledObj<T[P] extends plike<infer V> ? V : T[P]>
  }>
  static allSettled<T>(list: Iterable<T>): myP<allSettledObj<T extends plike<infer V> ? V : T>[]> {
    const resultList: allSettledObj<T extends plike<infer V> ? V : T>[] = []

    return new myP((r) => {
      const iter = list[Symbol.iterator]()
      let result = iter.next()
      let arrayLength = 0

      for (let i = 0; !result.done; i++) {
        const value = result.value
        
        if (isMyp(value)) {
          value.then((data) => {
            arrayLength++
            resultList[i] = {
              status: 'SUCCESS',
              value: data
            }
            if (arrayLength === resultList.length) {
              r(resultList)
            }
          }, (e) => {
            
            arrayLength++
            
            resultList[i] = {
              status: 'FAIL',
              reason: e
            }
            if (arrayLength === resultList.length) {
              r(resultList)
            }
          })
        } else {
          arrayLength++
          resultList[i] = {
            status: 'SUCCESS',
            value: value as (T extends plike<infer V> ? V : T)
          }
          if (arrayLength === resultList.length) {
            r(resultList)
          }
        }
        result = iter.next()
      }

      
    })

  }

  static any<T>(list: Iterable<T>): myP<T> {
    
    const resultList: allSettledObj<T>[] = []

    return new myP((r, j) => {
      const iter = list[Symbol.iterator]()
      let result = iter.next()
      let arrayLength = 0

      for (let i = 0; !result.done; i++) {
        const value = result.value
        
        if (isMyp(value)) {
          arrayLength++
          value.then((data) => {
            r(data)
          }, (e) => {
            arrayLength++
            resultList[i] = {
              status: 'FAIL',
              reason: e
            }
            if (arrayLength === resultList.length) {
              j(resultList)
            }
          })
        } else {
          arrayLength++
          r(value)
        }
        result = iter.next()
      }
    })

  }
}

// 获取到枚举的所有key的联合类型 keyof typeof STATUS_MEUN
type allSettledObj<T> = {status:keyof typeof STATUS_MEUN, value?: T, reason?: any}

myP.race([myP.resolve('1'), 2, 3, {a: '123'}]).then(data => {
  console.log('race' , data)
})


const promise1 = new Promise((resolve) => {
  resolve(1)
})

const promise2 = new Promise<number>((resolve) => {
  resolve(2)
})
const promise3 = new Promise((resolve, reject) => {
  reject(3)
})

Promise.allSettled([promise1, promise2, promise3, 'string', 6]).then((data) =>
  console.log(data)
)
myP.allSettled([ promise1, promise2, promise3,'string',6]).then((data) =>
  console.log(data)
)

console.log('test');


const pErr = new Promise((resolve, reject) => {
  reject("总是失败");
});

const pSlow = new Promise<string>((resolve, reject) => {
  setTimeout(resolve, 500, "最终完成");
  // reject("总是失败3");

});

const pFast = new Promise<string>((resolve, reject) => {
  setTimeout(resolve, 100, "很快完成");
  reject("总是失败2");
});

myP.any([pErr, pSlow, pFast]).then((value) => {
  console.log('any', value);
  // pFast fulfils first
}).catch(e => {
  console.log('any-error', e)
})


let checkType = new myP<number>((r) => r(123))
if (isMyp(checkType)) {
  checkType.then(data=>console.log(data)
  )
}

// 有一个泛型，不知道如何继续正确的泛型。这里应该不需要，因为myP是能有正确的类型的
// function isMyp<T>(data: myP<T> | unknown): data is myP<T>
function isMyp(data: any): data is myP<any> {
  if (data && data.then && typeof data.then === 'function') {
    return true
  }
  return false
}

// Promise.resolve().then((str) => {
//   console.log(str)
//   return '11'
// }).then((data) => {
//   return 66
// }).then((data) => {
//   return '66'
// }).then((data) => {
//   return '66'
// })



new myP<string>((R, J) => {
  setTimeout(() => {
    R('123')
  }, 1000)
})
  .then((data) => {
    console.log(data)
    return 666
    // return new myP((r, j) => {
    //   j('666')
    // })
  })
  .then(
    (data) => {
      console.log(data)
      return '11'
    },
    (e) => {
      console.log('xixi->', e)
    }
  )
  .catch((e) => {
    console.log(`catch->${e}`)
  })
  .then()
  .then((d) => {
    console.log('last->then', d)
  })

myP
  .reject('xixida')
  .then((e) => console.log(e))
  .catch((e) => console.log(`catch:${e}`))

myP.resolve().then(() => {
  console.log(0); // 1
  return myP.resolve(4)
}).then((res) => {
  console.log(res)
})

myP.resolve().then(() => {
  console.log(1); // 0
}).then(() => {
  console.log(2); // 2
}).then(() => {
  console.log(3); // 3
}).then(() => {
  console.log(5); // 5
}).then(() =>{
  console.log(6);  // 6
})

new Promise<number>((R, J) => {
  J('123')
}).then((data) => {
  console.log(data)
}).catch(e => {

})



console.log('begin--')
function promiseResolve<T>(
  p2: myP<T>,
  value: T | plike<T>,
  r2: resolve<T>,
  j2: reject<any>
) {
  if (p2 === value) {
    return j2(new TypeError('The promise and the return value are the same'))
  }

  if (typeof value === 'object' || typeof value === 'function') {
    if (value == null) {
      r2(value)
    }

    let then
    try {
      then = (value as plike<T>).then
    } catch (error) {
      return j2(error)
    }

    if (typeof then === 'function') {
      let isRuned: boolean = false
      try {
        then.call(
          value,
          (y) => {
            if (isRuned) return
            isRuned = true
            return promiseResolve(p2, y, r2, j2)
          },
          (r) => {
            if (isRuned) return
            isRuned = true
            return j2(r)
          }
        )
      } catch (e) {
        if (isRuned) return
        j2(e)
      }
    } else {
      r2(value)
    }
  } else {
    r2(value)
  }
}

//  promise-all  test

myP
  .all([
    myP.resolve('1'),
    myP.resolve(2),
    myP.reject('fail'),
    myP.resolve('3'),
    myP.reject('fail2'),
  ])
  .then((data) => {
    console.log('promiseAll:', data)
    let str = data[0]
  })
  .catch((e) => {
    console.log('promise->catch:', e)
  })
  

  
new myP((resolve) => {
  	resolve('')
}).then(() => {
  console.log('finally - success')
  throw new Error("");
})
.catch(() => {
  console.log('finally - error')
})
.finally(() => {
  console.log('finally - finally')
})




function a<T, P>(data: [T, P]): [T, P]
function a<T, P, v>(data: [T, P, v]): [T, P, v]
function a<T>(data: T[]): [T]
function a<T>(data: T[]): T[] { // T 可以是任意类型，不是保持唯一的T
  return [...data]
}
  
let abc = a(['1', 1, { a: 1 }])
