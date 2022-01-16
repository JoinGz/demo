

import React from 'react'
import { Route, Switch, BrowserRouter, Redirect, Link } from 'react-router-dom'

function App ({ routeList , }) {
  console.log( 'app-props', routeList, )
  return (
    <div>
      <p>layout</p>
      <Link to="/detail">detail</Link>
      <br />
      <Link to="/">home</Link>

      <Switch>
        {routeList.map((item) => {
          return <Route key={item.path}  {...item} />
        })}
      </Switch>
    </div>
  )
}

export default App
