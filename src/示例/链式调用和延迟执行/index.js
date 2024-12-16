/*
  arrange('hello')
    .wait(5)
    .do('commit')
    .waitFirst(3)
    .execute();

    等待 3 秒
    > hello
    等待 5 秒
    > commit
*/
const arrange = (str) => {
  let firstWait = 0
  let wait = 0
  const doTaskArray = []

  const chain = {
    waitFirst: (time) => {
      firstWait = firstWait + time
      return chain
    },
    wait: (time) => {
      wait = wait + time
      return chain
    },
    do: (action) => {
      doTaskArray.push(action)
      return chain
    },
    execute: async () => {
      if (firstWait > 0) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, firstWait * 1000)
        })
      }
      console.log(str)
      if (wait > 0) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, wait * 1000)
        })
      }
      doTaskArray.forEach((action) => {
        console.log(action)
      })
    },
  }
  return chain
}

arrange("hello").wait(5).do("commit").waitFirst(3).execute()
