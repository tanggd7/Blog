/**
 * 创建一个构造函数，new 一个对象生成一个并发任务控制器
 * 有一个 add 方法，可以往生成器里面添加任务，任务最多可以同时执行 n 个，满载时，其他任务等待
 * 每个任务返回一个结果
 */
class SuperTask {

  constructor(max) {
    this.max = max
    this.running = 0
    this.tasks = []
  }

  add(task) {
    return new Promise((resolve) => {
      this.tasks.push(() => {
        return task().then((res) => {
          resolve(res)
        })
      })
      this.run()
    })
  }

  run() {
    while (this.running < this.max && this.tasks.length > 0) {
      this.running++
      const task = this.tasks.shift()
      task().then(() => {
        this.running--


        if (this.running < this.max) {
          this.run()
        }
      })
    }
  }
}

function timer(number) {
  return function () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("%c Line:35 🥓", "font-size:16px;background:#2eafb0", `任务被执行了${number}`);
        resolve(number)
      }, number)
    })
  }
}

const superTask = new SuperTask(2);


document.getElementById('add').addEventListener('click', () => {
  superTask.add(timer((2000)))
})


superTask.add(timer((1000)))
superTask.add(timer((10000)))
superTask.add(timer((2000)))
superTask.add(timer((5000)))
