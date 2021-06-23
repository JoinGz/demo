import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './app.js'
import routeList from './route'
import { matchRoutes } from 'react-router-config'

async function render() {
  try {
    window.__initData__ = JSON.parse(
      document.querySelector('#ssr_init_id').innerText
    )
  } catch (error) {
    console.error('解析错误：' + error)
    window.__initData__ = {}
  }

  // 匹配路由

  const nowCom = matchRoutes(routeList, location.pathname)

  if (nowCom[0].route.component.isAsyncCom) {
    const Com = await nowCom[0].route.component().props.load()

    console.log('异步组件加载完成.')
    // 本来是异步包裹的组件，因为通过load直接拿到了组件，就可以直接复制给当前匹配的路由
    // 直接渲染当前组件
    nowCom[0].route.component = Com.default
  }
    console.log('开始渲染')

    ReactDom.hydrate(
      <BrowserRouter>
        <App routeList={routeList} />
      </BrowserRouter>,
      document.getElementById('root')
    )
}



render()
