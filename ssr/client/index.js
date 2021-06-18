import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './app.js'
import routeList from './route'
ReactDom.hydrate(
  <BrowserRouter>
    <App routeList={routeList} />
  </BrowserRouter>,
  document.getElementById('root')
)