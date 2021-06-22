import React from 'react'

export default class AsyncCom extends React.Component {
  constructor(s) {
    super(s)
    this.state = {
      com: null,
    }
  }
  UNSAFE_componentWillMount() {
    //执行组件加载
    if (!this.state.com) {
      this.load(this.props)
    }
  }

  load(props) {
    this.setState({ com: null })
    props.load().then((com) => {
      this.setState({ com: com ? com.default : com })
    }).catch(e => {
      console.log(e)
    })
  }

  render () {
    return this.state.com ? (
      this.props.children(this.state.com)
    ) : (
      <span>Lodoing</span>
    )
  }
}
