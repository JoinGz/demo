//ctx、ctx.request都具备相同的query、querystring
//query：返回的是格式化好的参数对象
//querystring：返回的是请求字符串
console.log(process.cwd())
const Koa = require('koa')
const React = require('react')
import { renderToString } from 'react-dom/server'

const app = new Koa()
import { matchRoutes } from 'react-router-config'
import routeList from '../client/route'

//组件
class Index extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <h1>{this.props.data.title}</h1>
  }
}

//模拟数据的获取
const fetch = function () {
  return {
    title: 'en',
    data: [],
  }
}

app.use(async (ctx) => {
  const url = ctx.url
  console.log('得到的url: ' + url)
  const branch = matchRoutes(routeList, url)
  let html
  if (branch && branch[0]) {
    //得到要渲染的组件
    const Component = branch[0].route.component
    const data = fetch()
    html = renderToString(<Component data={data} />)
  } else {
    html = '404'
  }

  ctx.body = `
    <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
            </head>
            <body>
                <div id="root">${html}</div>
            </body>
            <script src="http://127.0.0.1:9000/client.js"></script>
        </html>
    `
})

const port = 3003
app.listen(port, () => {
  console.log(`[demo] server is starting at port ${port}`)
})
