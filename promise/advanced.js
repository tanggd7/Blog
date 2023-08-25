const request = (string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(string)
      resolve()
    }, 1000)
  })
}

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