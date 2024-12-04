Function.prototype.myBind = function (context, ...args1) {
  // 这个条件语句用来检查方法被调用时，当前对象是否是一个函数。如果不是函数，则抛出一个 TypeError 错误。这是为了避免非函数对象调用方法的错误情况。
  if (typeof this !== "function") {
    throw new TypeError(
      "Function.prototype.bind - what is trying to be bound is not callable"
    )
  }
  // 在这里，我们将 this（即调用 myBind 方法的函数对象）保存。这样做是为了确保在后续的闭包函数中能够访问到原始的函数对象。
  let _this = this
  function boundFn(...args2) {
    return _this.apply(
      // 如果 boundFn 函数被当成构造函数使用（即通过 new 关键字调用），那么 this 将指向新创建的对象；否则，就使用之前传入的 context 作为上下文。
      this instanceof boundFn ? this : context,
      args1.concat(args2)
    )
  }
  // 这部分代码用来处理原始函数的原型链。我们定义了一个临时的构造函数 Empty，并将原始函数的原型链赋值给它。然后将 boundFn.prototype 设置为 Empty 的实例，这样做的目的是为了确保新函数的原型链正确继承自原始函数。
  function Empty() {}
  Empty.prototype = this.prototype
  boundFn.prototype = new Empty()
  return boundFn
}
