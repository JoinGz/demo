import Detail from './detail'
import Home from './home'
// import AsyncCom from './asyncCom'
// import React from 'react'

// const asyncHome = function (props) {
//   console.log('AsyncHome')

//   console.log(props)
//   return (
//     <AsyncCom
//       load={() => {
//         return import('./home')
//       }}
//     >
//       {(Com) => <Com {...props}></Com>}
//     </AsyncCom>
//   )
// }

const routes = [
  {
    path: '/',
    exact: true,
    component: Home,
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
