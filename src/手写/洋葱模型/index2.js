const func_1 = (ctx, next) => {
  console.log("%c Line:4 🍣", "background:#465975", "func_1", ...ctx)
  next(...ctx)
}
const func_2 = (ctx, next) => {
  console.log("%c Line:10 🥚", "background:#e41a6a", "func_2", ...ctx)
  if (ctx && ctx.length > 0 && typeof ctx[0] === "function") {
    ctx[0](next, ...ctx.slice(1))
  } else {
    next(...ctx)
  }
}
const func_3 = (ctx, next) => {
  console.log("%c Line:16 🌭", "background:#7f2b82", "func_3", ...ctx)
  next(...ctx)
}
const func_4 = (ctx, next) => {
  console.log("%c Line:22 🍆", "background:#377eb8", "func_4", ...ctx)
  next(...ctx)
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
        // 最后一个 func_4 中的 next 其实就是 原始的 dispatch
        _ret = (...args) => {
          func(args, callback)
        }
      } else {
        const prevRet = _ret
        _ret = (...args) => {
          func(args, prevRet)
        }
      }
    })
    return _ret
  }
}

const dispatch = (...args) => {
  console.log("%c Line:7 🌭", "background:#93c0a4", ...args)
}

const newDispatch = compose([func_1, func_2, func_3, func_4])(dispatch)

newDispatch((_dispatch, params) => {
  console.log("%c Line:54 🧀 params", "background:#6ec1c2", params)
  _dispatch(333)
}, 1)
