import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './app.js'
import routeList from './route'

function render() {
  try {
    window.__initData__ = JSON.parse(
      document.querySelector('#ssr_init_id').innerText
    )
  } catch (error) {
    console.error('解析错误：' + error)
    window.__initData__ = {}
  }
  ReactDom.hydrate(
    <BrowserRouter>
      <App routeList={routeList} />
    </BrowserRouter>,
    document.getElementById('root')
  )
}

render()
