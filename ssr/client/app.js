

import React from 'react'
import { Route, Switch, BrowserRouter, Redirect } from 'react-router-dom'

function App({ routeList }) {
  return (
    <div>
      <p>layout</p>
      <Switch>
        {routeList.map((item) => {
          return <Route key={item.path} {...item} />
        })}
      </Switch>
    </div>
  )
}

export default App
