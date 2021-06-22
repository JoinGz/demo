import React from 'react'
import initHoc from './initHoc'
class Home extends React.Component {
  constructor(props) {
    super(props)
  }
  static async getInitialProps () {
    return {'home':'yes'}
  }
  render() {
    console.log(this)
    return <div>Home{ this.props.home }</div>
  }
}

export default initHoc(Home)