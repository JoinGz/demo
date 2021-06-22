import React from 'react'
import axios from 'axios'
import initHoc from './initHoc'

 class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gz: 'xixi'
    }
  }
  static async getInitialProps() {
    const fetch1 = await axios.get('http://127.0.0.1:3003/api/a')
    const fetch2 = await axios.get('http://127.0.0.1:3003/api/b')

    return {
      res: [fetch1.data, fetch2.data],
    }
  }

  
  render () {
    console.log('detail' + this)
    console.log(this)

    return (
      <div>
        <div >Detail</div>
        <p >{this.state.gz}</p>
        {this.props.res && this.props.res.map((item, index) => {
          return <p key={index}>{item.a}</p>
        })}
      </div>
    )
  }
}


export default initHoc(Detail)
