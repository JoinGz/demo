import fs from 'fs'
import path from 'path'
import url from 'url'

// 代码解析成ast
import parser from '@babel/parser'
// 遍历节点然后调用用户回调
import traverse from '@babel/traverse'
import { transformFromAst } from 'babel-core'
import ejs from 'ejs'

const __fileName = url.fileURLToPath(import.meta.url)
const __dirName = path.resolve(__fileName, '..')
let id = 0

function getDepends({ absPath, relPath }) {
  const depends = []
  // const filePath = path.resolve(__dirName, filepath)

  const indexContent = fs.readFileSync(absPath, { encoding: 'utf-8' })

  // 拿到ast就有了所有的依赖，然后babel提供了遍历ast的库并提供回调 @babel/traverse
  const ast = parser.parse(indexContent, {
    sourceType: 'module',
  })
  let asbPath = ''
  traverse.default(ast, {
    // 每次我们看到`import`声明时,我们都可以将其数值视为`依赖性`.
    // ImportDeclaration 回调
    ImportDeclaration(data) {
      asbPath = data.node.source.value
      depends.push({
        absPath: `${path.resolve(
          absPath,
          '..',
          data.node.source.value
        )}`,
        relPath: data.node.source.value,
      })
    },
  })

  const { code } = transformFromAst(ast, null, {
    // import 转为 require 语法（commonjs）
    // 需要安装  babel-preset-env
    presets: ['env'],
  })

  // console.log(code)
  return {
    depends,
    code,
    relPath,
    absPath,
    id: id++,
  }
}
let firstJSdepends = []

firstJSdepends.push(
  getDepends({
    absPath: path.resolve(__dirName, './index.js'),
    relPath: './index.js',
  })
)

for (const item of firstJSdepends) {
  console.log(item)
  item.depends.length && firstJSdepends.push(getDepends(item.depends[0]))
}
// 筛选出唯一依赖（根据相同的绝对路径）
const onlyDependsMap = {}
const onlyDepends = firstJSdepends.filter((item) => {
  if (!onlyDependsMap[item.absPath]) {
    onlyDependsMap[item.absPath] = true
    return true
  }
  return false
})

console.log(onlyDepends)

// 筛选出相对路径和绝对路径的对应关系
// const relAbsMap = firstJSdepends.reduce((result, item) => {
//   result[item.relPath] = item.absPath
//   return result
// }, {})

// console.log(relAbsMap)

// 绝对路径和Id的关系

const AbsIdMap = firstJSdepends.reduce((result, item) => {
  result[item.absPath] = item
  return result
}, {})

console.log(AbsIdMap)


const template = fs.readFileSync('./require.js', { encoding: 'utf-8' })

const code = ejs.render(template, {firstJSdepends})


// ((function (pathAndId) {
//   function getIdFromPath (path) {
//     return pathAndId[path]
//   }
//   function require (path) {
//     let module = {}
//     let exports = {}
//     const id = getIdFromPath(path)
//     exports = id.code(require, )
//     module.exports = exports
//     return module
//   }

//   require('./index.js')

// })(JSON.stringify()))

fs.writeFileSync('./dist/main.js', code, {encoding: 'utf-8', })