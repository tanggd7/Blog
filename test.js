const obj = {
  test: function () {
    console.log(this)
    function a() {
      console.log(this)
    }
    a()
  }
}
obj.test()