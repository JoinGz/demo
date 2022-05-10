export class ChangeOutPath {
  constructor() {
    
  }
  apply (hook) {
    hook.tap('ChangeOutPath', (context) => {
      console.log(`插件改变了输出文件位置`)
      context.changeOutPath('./dist/gz.js')
    })
  }
}