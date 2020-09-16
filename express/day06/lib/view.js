const path = require('path')
const fs = require('fs')

class View {
  constructor (filename, options) {
    this.defaultEngineExt = options.defaultEngineExt;
    this.root = options.root;
    this.ext = path.extname(filename)
    this.name = filename
    if (!this.ext) {
      this.ext = this.defaultEngineExt[0] === '.' ? this.defaultEngineExt : '.' + this.defaultEngineExt;
      this.name += this.ext
    }
    this.engine = options.engines[this.name]
    this.path = this.lookPath(this.name)
  }
  lookPath(name) {
    let hasFile;
    let roots = [].concat(this.root)
    for (let i = 0; i < roots.length && !hasFile; i++) {
      const item = roots[i];
      const resolvePath = path.resolve(item, name)
      hasFile = this.hasFileCheck(resolvePath)
    }
    return hasFile
  }
  hasFileCheck(path) {
    try {
      let pathLive  =  fs.statSync(path);
      if (pathLive.isFile()) {
        return path
      }
    } catch (e) {
      return undefined;
    }
  }
  render(options, callback){
    this.engine(this.path, options, callback)
  }
}
module.exports = View