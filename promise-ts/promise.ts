enum  STATUS_MEUN  {
  PENDING =  "PENDING",
  FAIL =  "FAIL",
  SUCCESS =  "SUCCESS"
}

type resolve<T> = (data: T) => void
type reject<T> = (data: T) => void
type fn<T, P = any> = (resolve: resolve<T>, reject: reject<P>)=>void

let id = 0

class myP<T> {
  id: number = id
  private status:STATUS_MEUN = STATUS_MEUN.PENDING
  private _fn!: fn<T>
  private _value!: T
  private _fnArr: ((data: T)=>void)[] = []
  private _catchFnArr: ((data: T) => void)[] = []

  constructor(fn: fn<T>) {
    this.id = id++
    this._fn = fn
    this._fn(this.resolve.bind(this), this.reject.bind(this))
  }
  then<Y>(fn: (data: T) => Y): myP<Y> {
    console.log('status:' + this.status);
    
    
     const p2 =  new myP<Y>((r2, j2) => {
      
      if (this.status === STATUS_MEUN.SUCCESS) {
        queueMicrotask(() => {
          const value = fn(this._value)
          return promiseResolve(p2, value, r2, j2)
        })
      }
      if (this.status === STATUS_MEUN.FAIL) {
        queueMicrotask(() => {
          const value = fn(this._value)
          return promiseResolve(p2, value, r2, j2)
        })
      }
      if (this.status === STATUS_MEUN.PENDING) {
        this._fnArr.push(() => {
          const value = fn(this._value)
          return promiseResolve(p2, value, r2, j2)
        })
      }
     })
    
     return p2
  }

  catch(fn: (data: any) => void) {
    this._catchFnArr.push(fn)
  }

  private resolve(data: T) {
    if (this.status === STATUS_MEUN.PENDING) {
      this._value = data
      this.status = STATUS_MEUN.SUCCESS
      queueMicrotask(() => {
        this._fnArr.forEach(fn => {
          fn(this._value)
        });
      })
    }
  }

  private reject(e: any) {
    if (this.status === STATUS_MEUN.PENDING) {
      this._value = e
      this.status = STATUS_MEUN.FAIL
      queueMicrotask(() => {
        this._catchFnArr.forEach(fn => {
          fn(this._value)
        });
      })
    }
  }


}

new myP<string>((R, J) => {
  setTimeout(() => {
    R('123')
  }, 1000);
})
  .then((data) => {
    console.log(data)
    return new myP((r) => {
      r('666')
    })
  })
//   .then((data) => {
//     console.log(data)
//     })
//   .catch(e => {
//   console.log(`catch->${e}`)
// })


// new Promise<number>((R, J) => {
//   J('123')
// }).then((data) => {
//   console.log(data)
// }).catch(e => {
  
// })

console.log('begin--');
function promiseResolve<T, P>(p2: myP<T>, value: any, r2: resolve<P>, j2: reject<any>) {
  if (p2 === value) {
    return j2(new TypeError('The promise and the return value are the same'))
  }

  if (typeof value === 'object' || typeof value === 'function') {
    if (value == null) {
      r2(value)
    }

    let then
    try {
      then = value.then
    } catch (error) {
      return j2('Car 360')
    }




  } else {
    r2(value)
  }


}

