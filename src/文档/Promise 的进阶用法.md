# Promise 的进阶用法

#### 串联执行

```javascript
/** 串联执行 promise */
function sequentialFn() {
  const requestAry = [() => request(1), () => request(2), () => request(3)]
  const finallyPromise = requestAry.reduce(
    (currentPromise, nextRequest) => currentPromise.then(() => nextRequest()),
    Promise.resolve()
  )
  finallyPromise.then()
}

sequentialFn()
```

#### 在 new Promise 作用域外更改状态

```html
<!-- App.vue -->
<template>
  <!-- 以下是模态框组件 -->
  <div class="modal" v-show="visible">
    <div>用户姓名：<input v-model="info.name" /></div>
    <!-- 其他信息 -->
    <button @click="handleCancel">取消</button>
    <button @click="handleConfirm">提交</button>
  </div>

  <!-- 页面组件 -->
</template>

<script setup>
  import { provide } from "vue"

  const visible = ref(false)
  const info = reactive({
    name: "",
  })
  let resolveFn, rejectFn

  // 将信息收集函数函数传到下面
  provide("getInfoByModal", () => {
    visible.value = true
    return new Promise((resolve, reject) => {
      // 将两个函数赋值给外部，突破promise作用域
      resolveFn = resolve
      rejectFn = reject
    })
  })

  const handleConfirm = (info) => {
    resolveFn && resolveFn(info)
  }
  const handleCancel = () => {
    rejectFn && rejectFn(new Error("用户已取消"))
  }
</script>
```

```html
<template>
  <button @click="handleClick">填写信息</button>
</template>

<script setup>
  import { inject } from "vue"

  const getInfoByModal = inject("getInfoByModal")
  const handleClick = async () => {
    // 调用后将显示模态框，用户点击确认后会将promise改为fullfilled状态，从而拿到用户信息
    const info = await getInfoByModal()
    await api.submitInfo(info)
  }
</script>
```

#### async/await 的另类用法

```javascript
const fn1 = async () => 1
const fn2 = () => Promise.resolve(1)
fn1() // 也返回一个值为 1 的 promise 对象

// await在大部分情况下在后面接 promise 对象，并等待它成为 fullfilled 状态，因此下面的 fn1 函数等待也是等价的
await fn1()
const promiseInst = fn1()
await promiseInst

// await 还有一个鲜为人知的秘密，当后面跟的是非 promise 对象的值时，它会将这个值使用 promise 对象包装，因此 await 后的代码一定是异步执行的。
Promise.resolve().then(() => {
  console.log(1)
})
await 2
console.log(2)
// 打印顺序位：1  2
// 等价于
Promise.resolve().then(() => {
  console.log(1)
})
Promise.resolve().then(() => {
  console.log(2)
})
```

#### promise 实现请求共享

```javascript
request("GET", "/test-api").then((response1) => {
  // ...
})
request("GET", "/test-api").then((response2) => {
  // ...
})

// 实现请求共享需要用到 promise 的缓存功能，即一个 promise 对象可以通过多次 await 获取到数据
const pendingPromises = {}
function request(type, url, data) {
  // 使用请求信息作为唯一的请求key，缓存正在请求的promise对象
  // 相同key的请求将复用promise
  const requestKey = JSON.stringify([type, url, data])
  if (pendingPromises[requestKey]) {
    return pendingPromises[requestKey]
  }
  const fetchPromise = fetch(url, {
    method: type,
    data: JSON.stringify(data),
  })
    .then((response) => response.json())
    .finally(() => {
      delete pendingPromises[requestKey]
    })
  return (pendingPromises[requestKey] = fetchPromise)
}
```

#### 彻底理清 then/catch/finally 返回值

```javascript
// 以上三个函数都会返回一个新的 promise 包装对象，被包装的值为被执行的回调函数的返回值，回调函数抛出错误则会包装一个 rejected 状态的 promise。

// then 函数
Promise.resolve().then(() => 1); // 返回值为 new Promise(resolve => resolve(1))
Promise.resolve().then(() => Promise.resolve(2)); // 返回 new Promise(resolve => resolve(Promise.resolve(2)))
Promise.resolve().then(() => {
  throw new Error('abc')
}); // 返回 new Promise(resolve => resolve(Promise.reject(new Error('abc'))))
Promise.reject().then(() => 1, () = 2); // 返回值为 new Promise(resolve => resolve(2))

// catch 函数
Promise.reject().catch(() => 3); // 返回值为 new Promise(resolve => resolve(3))
Promise.resolve().catch(() => 4); // 返回值为 new Promise(resolve => resolve(调用 catch 的 promise 对象))

// finally 函数
// 以下返回值均为 new Promise(resolve => resolve(调用 finally 的 promise 对象))
Promise.resolve().finally(() => {});
Promise.reject().finally(() => {});
```

#### then 函数的第二个回调和 catch 回调有什么不同？

```javascript
Promise.resolve()
  .then(
    () => {
      throw new Error("来自成功回调的错误")
    },
    () => {
      // 不会被执行
    }
  )
  .catch((reason) => {
    console.log(reason.message) // 将打印出"来自成功回调的错误"
  })
```

#### promise 实现 koa2 洋葱中间件模型

```javascript
const app = new Koa()
app.use(async (ctx, next) => {
  console.log("a-start")
  await next()
  console.log("a-end")
})
app.use(async (ctx, next) => {
  console.log("b-start")
  await next()
  console.log("b-end")
})

app.listen(3000)

// a-start \-> b-start \-> b-end \-> a-end
```

```javascript
function action(koaInstance, ctx) {
  let nextMiddlewareIndex = 0
  function next() {
    const nextMiddleware = koaInstance.middleWares[nextMiddlewareIndex]
    if (nextMiddleware) {
      nextMiddlewareIndex++
      // 这边也添加了 return，让中间件函数的执行用 promise 从后到前串联执行（这个 return 建议反复理解）
      return Promise.resolve(nextMiddleware(ctx, next))
    } else {
      // 当最后一个中间件的前置逻辑执行完后，返回 fullFilled 的promise 开始执行next后的后置逻辑
      return Promise.resolve()
    }
  }
  middlewares[0](ctx, next)
}

class Koa {
  middleWares = []
  use(mid) {
    this.middleWares.push(mid)
  }
  listen(port) {
    // 伪代码模拟接收请求
    http.on("request", (ctx) => {
      action(this, ctx)
    })
  }
}
```
