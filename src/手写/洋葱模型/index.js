const func_1 = (next) => {
  return (...args) => {
    console.log("%c Line:4 🍣", "background:#465975", "func_1", ...args)
    next(...args)
  }
}
const func_2 = (next) => {
  return (...args) => {
    console.log("%c Line:10 🥚", "background:#e41a6a", "func_2", ...args)
    if (args.length > 0 && typeof args[0] === "function") {
      // 这里就类似 redux-thunk 的处理方式，如果 ...args 是函数，则执行 ...args 函数
      args[0](next, args.slice(1))
    } else {
      next(...args)
    }
  }
}
const func_3 = (next) => {
  return (...args) => {
    console.log("%c Line:16 🌭", "background:#7f2b82", "func_3", ...args)
    next(...args)
  }
}
const func_4 = (next) => {
  return (...args) => {
    console.log("%c Line:22 🍆", "background:#377eb8", "func_4", ...args)
    next(...args)
  }
}

/*
  原始的 dispatch 函数从最后一个开始，层层套一层 function
  每个 func_1 里面的 next 就是 func_2 套过的 dispatch
*/
const compose = (funcs) => {
  const revsersedFuncs = funcs.reverse()
  return (callback) => {
    let _ret = null
    revsersedFuncs.forEach((func, index) => {
      if (index === 0) {
        _ret = func(callback) // 最后一个 func_4 中的 next 其实就是 原始的 dispatch
      } else {
        _ret = func(_ret)
      }
    })
    return _ret
  }
}

const dispatch = (...args) => {
  console.log("%c Line:7 🌭", "background:#93c0a4", ...args)
}

const newDispatch = compose([func_1, func_2, func_3, func_4])(dispatch)

newDispatch((_dispatch) => {
  _dispatch(333)
})
