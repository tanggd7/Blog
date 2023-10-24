# Chrome 新版的事件队列优先级

#### 实操结果

<img width="707" alt="Snipaste_2023-09-01_11-30-41" src="https://github.com/tanggd7/Blog/assets/31497613/a2ce2b82-c371-425b-9e3b-ed857436e45c">

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>微队列、交互队列、网络队列、延时队列优先级</title>
  </head>

  <body>
    <button id="begin">开始</button>
    <button id="aaa">按钮</button>
    <script>
      function delay() {
        var now = new Date()
        while (new Date() - now < 3000) {}
      }

      // 微队列
      function promise() {
        console.log("add promise")
        Promise.resolve().then(function () {
          console.log("promise end")
          console.log(document.body.style.backgroundColor)
          // alert("promise end")
        })
      }

      // 延时队列
      function timer0() {
        console.log("add timer0")
        setTimeout(function () {
          console.log("timer0 end")
          Promise.resolve().then(function () {
            console.log("timer0 promise")
          })
          // alert("timer0 end")
        }, 0)
      }

      // 延时队列
      function timer1() {
        console.log("add timer1")
        setTimeout(function () {
          console.log("timer1 end")
          Promise.resolve().then(function () {
            console.log("timer1 promise")
          })
          // alert("timer1 end")
        }, 1)
      }

      // 延时队列
      function timer2() {
        console.log("add timer2")
        setTimeout(function () {
          console.log("timer2 end")
          // alert("timer2 end")
        }, 2900)
      }

      // 延时队列
      function timer3() {
        console.log("add timer3")
        setTimeout(function () {
          console.log("timer3 end")
          Promise.resolve().then(function () {
            console.log("timer3 promise")
          })
          // alert("timer3 end")
        }, 500)
      }

      // 交互队列
      function event() {
        console.log("add event")
        aaa.onclick = function () {
          console.log("event end")
          Promise.resolve().then(function () {
            console.log("event promise")
          })
          // alert("event end")
        }
      }

      // 网络队列
      function getFetch0() {
        console.log("add fetch0")
        fetch("./a.json").then(function (res) {
          console.log("fetch0 end")
          // alert("fetch0 end")
          Promise.resolve().then(function () {
            console.log("fetch0 promise")
          })
          setTimeout(() => {
            console.log("fetch0 timer1")
          }, 0)
          setTimeout(() => {
            console.log("fetch0 timer2")
          }, 1)
        })
      }

      // 网络队列
      function getFetch1() {
        console.log("add fetch1")
        fetch("./a.json").then(function (res) {
          console.log("fetch1 end")
          // alert("fetch1 end")
        })
      }

      begin.onclick = function () {
        document.body.style.backgroundColor = "gray"

        getFetch0()
        getFetch1()
        timer0()
        timer1()
        timer2()
        timer3()
        event()
        promise()
        console.log("===========")
        delay()
      }
    </script>
  </body>
</html>
```

队列优先级：微队列 > 交互队列 > (渲染队列) > 延迟队列/网络队列

从代码执行结果来看，当主渲染线程完成执行时:

1. 依次取出“微队列”中的所有任务并执行
2. 依次取出“交互队列”中的所有任务并执行，如果队列产生了微任务，放入“微队列”
3. 执行 1
4. 如果前面的代码改变了 UI，则渲染页面（在上面的代码中，改变了页面的背景颜色）
5. 执行延迟队列
   - 如果 seTimeout 延迟时间设置为 0，则立即执行
   - 执行 1
   - 如果“网络队列”有任务，取出一个网络任务执行，如果网络任务中，生成了微任务，放入“微队列”，如果生成了定时任务并且延时时间设置为 0，放入“延时队列”
   - 执行 1
   - 执行 “延时队列”（还有剩下的已经跑完定时的延时时间 > 0 的任务）
   - 执行 5

从反复尝试来看，浏览器对 setTimeout 设置延时为 0 时，应该是有什么特殊的处理。
正常我的理解，event 触发的延时事件 event1、2 应该要排在 timer0、1、2 的后面，但是实际只有 event2 排在了最后。

```javascript
btn.onclick = function () {
  console.log("event end")
  setTimeout(() => {
    console.log("event timer1")
  }, 0)
  setTimeout(() => {
    console.log("event timer2")
  }, 1)
}

function timer0() {
  console.log("add timer0")
  setTimeout(function () {
    console.log("timer0 end")
  }, 0)
}

function timer1() {
  console.log("add timer1")
  setTimeout(function () {
    console.log("timer1 end")
  }, 1)
}
function timer2() {
  console.log("add timer2")
  setTimeout(function () {
    console.log("timer2 end")
  }, 500)
}

begin.onclick = function () {
  timer0()
  timer1()
  timer2()
  console.log("===========")
  delay()
}

// timer0 end
// timer1 end
// event timer1
// timer2 end
// event timer2
```

#### 一些补充

在 Chrome 源码中，对 setTimeout 的任务类型是有做处理的。

```c
// https://html.spec.whatwg.org/multipage/webappapis.html#timers
// For tasks queued by setTimeout() or setInterval().
//
// Task nesting level is < 5 and timeout is zero.
kJavascriptTimerImmediate = 72,
// Task nesting level is < 5 and timeout is > 0.
kJavascriptTimerDelayedLowNesting = 73,
// Task nesting level is >= 5.
kJavascriptTimerDelayedHighNesting = 10,
// Note: The timeout is increased to be at least 4ms when the task nesting
// level is >= 5. Therefore, the timeout is necessarily > 0 for
// kJavascriptTimerDelayedHighNesting.
```
