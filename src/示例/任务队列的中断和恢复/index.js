/**
 * 一次执行一系列任务
 * 所有任务全部完成后可以得到每个任务的执行结果
 * 需要返回两个方法，start 用于启动任务，pause 用于暂停任务
 * 每个任务具有原子性，及不可中断，只能在两个任务之间中断
 * @param {...Function} tasks 任务列表，每个任务无参、异步
 */
function processTasks(...tasks) {
  const taskResult = []
  let taskArray = tasks
  let isStop = false

  function isOver() {
    if (tasks.length === taskResult.length) {
      console.log("%c Line:28 🍌", "font-size:16px;background:#ffdd4d", "任务执行结束了");
      isStop = true
      return true
    }
    return false
  }

  return {
    start: () => {
      return new Promise(async (resolve) => {
        isStop = false
        for (const [index, task] of taskArray.entries()) {
          if (isStop) {
            taskArray = taskArray.slice(index)
            break
          } else {
            taskResult.push(await task())
          }
        }
        if (isOver()) {
          isStop = false
          taskArray = []
          resolve(taskResult)
        }
      })
    },
    pause: () => {
      if (!isOver()) {
        isStop = true
      }
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

const testTasks = [
  timer(1000),
  timer(2000),
  timer(3000),
  timer(2000),
  timer(1000),
  timer(4000),
  timer(5000),
  timer(2000),
  timer(3000),
  timer(4000),
  timer(6000),
  timer(3000),
  timer(2000),
]

var { start, pause } = processTasks(...testTasks)
