import name from './name.js'
import jsonTest from '../package.json'

function sayHello() {
  console.log(jsonTest)
  console.log(`hello, ${name}`)
}

export default sayHello