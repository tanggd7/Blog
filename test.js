const objA = {}
let objB = {}

const a = new WeakMap()
a.set(objA, 'key1')
a.set(objB, 'key2')

console.log(a.get(objA))
console.log(a.get(objB))

objB = null

console.log(a.get(objA))