import Detail from './detail'
import Home from './home'

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