let a = 1
let add = () => {
  a++
  return 'a was added'
}
let logA = () => {
  console.log(a)
}
let obj = {
  a:1
}
let changeA = (num) => {
  a = num
}
export {a, add ,logA, obj, changeA}
