import Detail from './detail'

import AsyncCom from './asyncCom'
import React from 'react'

// 按需加载函数
const asyncHome = function (props) {
  console.log('AsyncHome')

  console.log(props)
  return (
    <AsyncCom
      a = {1}
      load={() => {
        return import(/* webpackChunkName: "group-home" */  './home')
      }}
    >
      {(Com) => <Com {...props}></Com>}
    </AsyncCom>
  )
}

asyncHome.isAsyncCom = true

const routes = [
  {
    path: '/',
    exact: true,
    component: asyncHome,
  },
  {
    path: '/detail',
    exact: true,
    component: Detail,
  },
  {
    path: '/detail/:a/:b',
    exact: true,
    component: Detail,
  },
]

export default routes
