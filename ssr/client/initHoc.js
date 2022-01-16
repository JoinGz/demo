// 同步数据的高阶组件
// 作用1： 把server端传入的数据同步到此组件state
// 作用2： 注册url变更事件，获取数据

import React from 'react'

async function isRegisterFn  ()  {
  console.log('change')
  if (_thisComponent && _thisComponent.getInitialProps) {
    await _thisComponent.getInitialProps()
  }
}
let _thisComponent = null;

export default (Com) => {
  return class InitHom extends React.Component {
    constructor(s) {
      super(s)
      this.state = {
        isRegister: false,
      }
    }

    static async getInitialProps() {
      return Com.getInitialProps ? await Com.getInitialProps() : {}
    }

    async getInitialProps() {
      const res = await Com.getInitialProps()
      console.log('组件获取了请求：')
      this.setState({ ...this.state, ...res })
    }

    async componentDidMount() {
      console.log('componentDidMount')

      _thisComponent = this

      window.addEventListener('popstate', isRegisterFn)

      const canClientFetch =
        this.props.history && this.props.history.action === 'PUSH' //路由跳转的时候可以异步请求数据

      if (canClientFetch) {
        await this.getInitialProps()
      }

      if (window.__initData__) { // 把服务端数据同步到state,后面可以用context穿透优化
        this.setState( { ...this.state, ...window.__initData__ })
        window.__initData__ = null
      }
    }

    componentWillUnmount() {
      console.log('unmount')
    }

    render() {
      console.log('initHoc')
      console.log(this)

      let props = { ...this.state }
      if (__SERVER__) {
        props = { ...this.state, ...(this.props.staticContext || {}) }
      } else {
        if (window.__initData__) {
          props = { ...this.state, ...window.__initData__ }
          // window.__initData__ = null 同步数据后再删除
        }
      }

      return <Com {...this.state} {...props}></Com>
    }
  }
}
