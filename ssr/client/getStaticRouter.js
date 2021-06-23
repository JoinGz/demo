const staticRouteList = []

async function getStaticRouter(routeList) {
  if (staticRouteList.length) {
    return staticRouteList
  }
  for (let i = 0; i < routeList.length; i++) {
    const item = routeList[i]
    if (item.component && item.component.isAsyncCom) {
      const com = await item.component().props.load()
      staticRouteList.push({
        ...item,
        component: com ? com.default : item.component(),
      })
    } else {
      staticRouteList.push(item)
    }
  }
  return staticRouteList
}

export default getStaticRouter

