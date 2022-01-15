((function (pathAndId) {
  function getIdFromPath (path) {
    return pathAndId[path]
  }
  function require (path) {
    let module = {}
    let exports = {}
    const id = getIdFromPath(path)
    exports = id.code(require, )
    module.exports = exports
    return module
  }

  require('./index.js')

})({
  
}))