//ctx、ctx.request都具备相同的query、querystring
//query：返回的是格式化好的参数对象
//querystring：返回的是请求字符串
console.log(process.cwd())
const Koa = require('koa')
const React = require('react')
import { renderToString } from 'react-dom/server'
import { StaticRouter, Route, matchPath } from 'react-router'

const app = new Koa()
import { matchRoutes } from 'react-router-config'
import routeList from '../client/route'
import ClentApp from '../client/app.js'
import getStaticRouter from '../client/getStaticRouter'
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

app.use(async (ctx, next) => {
  if (ctx.url.startsWith('/api/')) {
    if (ctx.url === '/api/a') {
      ctx.body = { a: '1' }
    } else {
      ctx.body = { b: '2' }
    }
  } else {
    await next()
  }
})

app.use(async (ctx) => {
  const url = ctx.url
  console.log('得到的url: ' + url)
  const staticRouter = await getStaticRouter(routeList)
  const branch = matchRoutes(staticRouter, url)
  let html, ssrData = {};

  if (branch && branch[0]) {
    //得到要渲染的组件
    let Component = branch[0].route.component
    if (Component.getInitialProps) {
      ssrData = await Component.getInitialProps()
      console.log(`ssrData: ${JSON.stringify(ssrData)}`)
    }
    html = renderToString(
      <StaticRouter location={ctx.url} context={ssrData}>
        <ClentApp routeList={staticRouter}></ClentApp>
      </StaticRouter>
    )
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
                <div style="display:none" id="ssr_init_id">${JSON.stringify(ssrData || {})}</div>
            </body>
            <script src="http://127.0.0.1:9000/client.js"></script>

        </html>
    `
})

const port = 3003
app.listen(port, () => {
  console.log(`[demo] server is starting at port ${port}`)
})
