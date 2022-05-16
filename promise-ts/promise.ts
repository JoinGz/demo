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
  static resolve(data?: any) {
    return new myP((r) => r(data))
  }

  static reject(data: any) {
    return new myP((r, j) => j(data))
  }

  // static all<T>(plist: myP<T>[]): myP<T>
  static all<T1, R1>(plist: [T1 | plike<T1>, R1 | plike<R1>]): myP<[T1, R1]>
  static all<T1, R1, Y>(
    plist: [T1 | plike<T1>, R1 | plike<R1>, Y | plike<Y>]
  ): myP<[T1, R1, Y]>
  static all<T1, R1, Y, P>(
    plist: [T1 | plike<T1>, R1 | plike<R1>, Y | plike<Y>, P | plike<P>]
  ): myP<[T1, R1, Y, P]>
  static all<T>(plist: (T | plike<T>)[]): myP<T[]>
  // TODO: 把 any 改变成 myP<T[]> 会报错  - - !
  static all<T>(plist: (T | plike<T>)[]): any {
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
}

// 有一个泛型，不知道如何继续正确的泛型
// function isMyp<T = any>(data: myP<T>): data is myP<T>
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


function a<T, P>(data: [T, P]): [T, P]
function a<T, P, v>(data: [T, P, v]): [T, P, v]
function a<T>(data: T[]): [T]
function a<T>(data: T[]): T[] {
  return [...data]
}
  
let abc = a(['1', 1, {a: 1}])