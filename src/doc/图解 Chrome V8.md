# 图解 Chrome V8

### V8 执行代码的过程

V8 先将 JavaScript 编译成字节码，然后解释执行字节码，或者将需要优化的字节码转换成二进制，并直接执行二进制
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690768336697-7f3667af-8d5c-4e7c-a41d-6102c20be434.png#averageHue=%23f8f6f3&clientId=u3c20f5dd-5a5c-4&from=paste&height=453&id=u040eea6b&originHeight=604&originWidth=1142&originalType=binary&ratio=2&rotation=0&showTitle=false&size=267400&status=done&style=shadow&taskId=ucbcff7cf-f261-496c-9442-53f46e1b9ae&title=&width=857)
解析器解析代码为 AST
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690768439698-fc32b10d-5f15-4a52-81b1-a5fd8cd9ca6b.png#averageHue=%23fcfcfa&clientId=u3c20f5dd-5a5c-4&from=paste&height=196&id=u96cd2d32&originHeight=392&originWidth=1142&originalType=binary&ratio=2&rotation=0&showTitle=false&size=94479&status=done&style=shadow&taskId=u82557cc1-4ba2-4a97-b9a6-f80722b5957&title=&width=571)

### JavaScript 对象的存储方式

基本类型存储的是“值”，对象、函数存储的是“索引”
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690768548733-fdd3b797-f4fe-4d94-a6cb-3b0c215a937b.png#averageHue=%23f4f3f1&clientId=u3c20f5dd-5a5c-4&from=paste&height=303&id=uebac89ae&originHeight=605&originWidth=1142&originalType=binary&ratio=2&rotation=0&showTitle=false&size=189826&status=done&style=shadow&taskId=uc8a82c80-1e2f-42b0-ade3-6c67a6a098c&title=&width=571)
函数有两个隐藏的属性，name 和 code，name 是属性名字，code 是函数代码，如果函数是匿名函数，那么 name 为 anonymous
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690768581278-a3a1109c-898c-4837-b14e-31d4360cb477.png#averageHue=%23f9f8f8&clientId=u3c20f5dd-5a5c-4&from=paste&height=272&id=u92dc367c&originHeight=543&originWidth=1142&originalType=binary&ratio=2&rotation=0&showTitle=false&size=217910&status=done&style=shadow&taskId=ub4fd575d-cf53-4579-b71e-23ab9dfc06f&title=&width=571)

在 v8 中，对象的 key 如果是数字类型，那么称它为“排序属性”，存在在 element 中，如果 key 是字符串，称它为“常规属性”，存放在 properties 中。
element 和 properties 都是对象的隐藏属性
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690768747924-7e751674-5b1d-41b0-8063-4005ea8ef9f1.png#averageHue=%23f7f6f5&clientId=u3c20f5dd-5a5c-4&from=paste&height=423&id=uf88df7b7&originHeight=846&originWidth=1142&originalType=binary&ratio=2&rotation=0&showTitle=false&size=153656&status=done&style=shadow&taskId=u71caeb8e-06d0-40d1-a87f-760ada9bae0&title=&width=571)

快属性：将少量的应该存于 properties 的属性，直接存储在对象本身（对象内属性），起到快速访问的作用。
但是快属性有上限，一般是 10 个
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690769077684-4a96d757-f2d1-466b-a18c-c984529f7566.png#averageHue=%23f8f8f7&clientId=u3c20f5dd-5a5c-4&from=paste&height=245&id=u68288594&originHeight=490&originWidth=1142&originalType=binary&ratio=2&rotation=0&showTitle=false&size=114369&status=done&style=shadow&taskId=u90ad4c44-0b26-400d-b4cc-78bbc5e839d&title=&width=571)

慢属性：当对象内属性过多（超过 10 个），v8 会采用字典类型来存放剩余的属性在 properties 中。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690769259542-bd12162b-485e-4cda-8ff0-0b21881bdd56.png#averageHue=%23f8eac9&clientId=u3c20f5dd-5a5c-4&from=paste&height=438&id=uc54e90d2&originHeight=876&originWidth=1142&originalType=binary&ratio=2&rotation=0&showTitle=false&size=210019&status=done&style=shadow&taskId=u6315fade-3ed5-40e4-a2af-ad4d1398751&title=&width=571)

### 函数声明和函数表达式

函数声明：function foo() {}
函数表达式：var foo = function() {}
由于变量提升的原因，函数声明整个方法会被注册到作用域中
函数表达式其实是一个赋值语句，变量 foo 会被变量提升到顶部，但没有执行赋值语句，所以不能在赋值语句前使用 foo 方法
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690769539347-f2e0471b-ce81-4112-916b-fe417751c866.png#averageHue=%23fbfaf7&clientId=u3c20f5dd-5a5c-4&from=paste&height=492&id=u0abbe6b4&originHeight=655&originWidth=1142&originalType=binary&ratio=2&rotation=0&showTitle=false&size=266453&status=done&style=shadow&taskId=u621b53e1-830a-464e-ab87-ce7ddcf7857&title=&width=857)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690769613925-6c5e5871-7935-4183-a87f-fd309f430c5e.png#averageHue=%23fcfaf8&clientId=u3c20f5dd-5a5c-4&from=paste&height=413&id=u64cdca7e&originHeight=551&originWidth=1142&originalType=binary&ratio=2&rotation=0&showTitle=false&size=199162&status=done&style=shadow&taskId=u29e7edbe-bc0e-477e-887e-87a497d297a&title=&width=857)

### 原型继承

const A = { color: '' };
const B = { color: '' };
const C = { color: '' };
C.**proto** = B
B.**proto** = A
但是不建议这么做，**proto**是隐藏属性，并不是标准定义的，且使用改属性会造成严重的性能问题
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690783054481-2067dfc5-3a13-42ab-9187-8cae590f34ff.png#averageHue=%23f8f2e0&clientId=u6b1dd3cc-1ef4-4&from=paste&height=395&id=u8714349c&originHeight=526&originWidth=1142&originalType=binary&ratio=2&rotation=0&showTitle=false&size=241852&status=done&style=shadow&taskId=uacb66ac7-2de7-4de9-8112-0efc247b9eb&title=&width=857)

const dog = new DogFactory('Dog', 'black')
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690783390560-1c3d4156-2dd8-4dcb-b7c8-4d7cc34d6c9f.png#averageHue=%23f9f6ed&clientId=u43f472ca-b853-4&from=paste&height=383&id=ub91d4722&originHeight=510&originWidth=1142&originalType=binary&ratio=2&rotation=0&showTitle=false&size=191671&status=done&style=shadow&taskId=u73eff3d7-e5ae-440e-a6c0-86e090e4b1b&title=&width=857)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690784785404-4031433e-626e-42b0-bd14-ac6736fc1ff6.png#averageHue=%23010101&clientId=u43f472ca-b853-4&from=paste&id=ub64f3550&originHeight=525&originWidth=590&originalType=binary&ratio=2&rotation=0&showTitle=false&size=41774&status=done&style=shadow&taskId=u52affd1f-5869-4964-9d94-fac18f17eab&title=)

```javascript
function Person() {}
var person = new Person()
console.log(person.__proto__ == Person.prototype) // true
console.log(Person.prototype.constructor == Person) // true

// 顺便学习一个 ES5 的方法，可以获得对象的原型
console.log(Object.getPrototypeOf(person) === Person.prototype) // true
console.log(Object.prototype.__proto__ === null) // true

// 获取 person.constructor 时，其实 person 中并没有constructor 属性，
// 当不能读取到constructor 属性时，会从 person 的原型也就是 Person.prototype 中读取，正好原型中有该属性
console.log(person.constructor === Person) // true
console.log(person.constructor === Person.prototype.constructor) // true

const array = Object.create(Array.prototype)
array.__proto__ == Array.prototype // true

/*
  __proto__
  其次是__proto__ ，绝大部分浏览器都支持这个非标准的方法访问原型，然而它并不存在于 Person.prototype 中，
  实际上，它是来自于Object.prototype，与其说是一个属性，不如说是一个 getter/setter，
  当使用 obj.__proto__时，可以理解成返回了 Object.getPrototypeOf(obj)。
*/
```

### 作用域链

JavaScript 是词法作用域，作用域链是按照代码的书写顺序来向上查找的
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690869607276-9427e813-9b24-48f3-abde-4899793ca438.png#averageHue=%23fcf6e5&clientId=ud6a0f88e-c7e1-4&from=paste&height=643&id=ub8f9e182&originHeight=1285&originWidth=2284&originalType=binary&ratio=2&rotation=0&showTitle=false&size=526126&status=done&style=shadow&taskId=u5a26af6e-07fb-4b60-b9d4-cc9d21db0b9&title=&width=1142)

### 执行上下文 this

```javascript
// 使用对象来调用其内部的一个方法，该方法的 this 是指向对象本身的。
var myObj = {
  name: "name",
  showThis: function () {
    console.log(this.name) // name
  },
}
myObj.showThis()

// 当讲对象内部的方法单独执行，this 又指向了 window
var myObj = {
  name: "name",
  showThis: function () {
    console.log(this.name) // undefined（window.name）
  },
}
var foo = myObj.showThis
foo()

// 使用 new 关键字生成对象实例
function CreateObj() {
  this.name = "name"
}
var myObj = new CreateObj()
// 实际的内部的实现步骤如下
var tempObj = {}
CreateObj.call(tempObj)
return tempObj

// 函数 bar 中的 this 指向的是全局 window 对象，而函数 showThis 中的 this 指向的是 myObj 对象
// 在非严格模式下，当函数被作为普通函数调用时，this 会指向全局对象；在严格模式下，则会是 undefined。
// 解决方式可以在 bar 外层用一个变量存储 this，然后在 bar 中使用这个变量。
// 或者将 bar 方法改为箭头函数，ES6 中的箭头函数并不会创建其自身的执行上下文，所以箭头函数中的 this 取决于它的外部函数。
var myObj = {
  name: "name",
  showThis: function () {
    console.log(this.name) // name
    function bar() {
      console.log(this.name) // undefined（window.name）
    }
    bar()
  },
}
myObj.showThis()
```

### 类型计算

在执行加法操作的时候，V8 会通过 ToPrimitve 方法将对象类型转换为原生类型，最后就是两个原生类型相加，如果其中一个值的类型是字符串时，则另一个值也需要强制转换为字符串，然后做字符串的连接运算。在其他情况时，所有的值都会转换为数字类型值，然后做数字的相加。
如果无法相加，会报 TypeError 错误
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690872567558-d46182a1-492c-445f-9acc-10680c63b6aa.png#averageHue=%23fbfbfb&clientId=ud6a0f88e-c7e1-4&from=paste&height=321&id=ub4e8fce7&originHeight=1285&originWidth=2284&originalType=binary&ratio=2&rotation=0&showTitle=false&size=475373&status=done&style=shadow&taskId=ub06f27b4-b079-487e-9bad-bbb7ee805e4&title=&width=571)

### V8 运行需要的条件

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1690876706059-890f75bb-d34d-4a7c-8548-2785c5fadfa3.png#averageHue=%23fcfcfc&clientId=u1b89f000-71e6-4&from=paste&height=321&id=uca7f9ddd&originHeight=1285&originWidth=2284&originalType=binary&ratio=2&rotation=0&showTitle=false&size=443860&status=done&style=shadow&taskId=ue9baac1f-8e2f-4722-8ee9-e4355afbc28&title=&width=571)

### 栈和堆，如何影响内存布局

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691459847192-c012f1d9-f8d4-4a8d-8aa2-6a04743a0f68.png#averageHue=%23f6f8f9&clientId=u47c9d30e-675e-4&from=paste&height=352&id=u36d4f5b6&originHeight=704&originWidth=446&originalType=binary&ratio=2&rotation=0&showTitle=false&size=35055&status=done&style=shadow&taskId=uc794779f-53ee-4e74-a901-f3008de37fa&title=&width=223)

esp 寄存器保存的是栈顶指针
ebp 寄存器保存的是栈帧指针，函数的起始位置

1. 在执行 add 前，ebp 保存的是 main 的栈帧指针（f91） ，**同时将 main 的栈帧指针存于栈中（f93）**，esp 保存 main 的栈顶指针 （f93）
2. 执行 add 时，先将 esp 中保存的 main 的栈顶赋予 ebp ，再将 add 的栈顶保存到 esp 中，这时，**esp 保存 add 的栈顶（f97），ebp 保存 add 的栈帧（f93）**
3. 执行 add 结束，恢复现场，先将 ebp 赋予 esp（f93），再将 ebp 指向的栈内数据取出获取其中的值（f91）赋予 ebp，这时，**esp 保存 main 的栈顶（f93），ebp 保存 main 的栈帧（f91）**

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691459916618-071a774b-620d-4ded-a3e8-29d284f8caa2.png#averageHue=%23f7e9c4&clientId=u47c9d30e-675e-4&from=paste&height=264&id=u0866734e&originHeight=1054&originWidth=2284&originalType=binary&ratio=2&rotation=0&showTitle=false&size=345581&status=done&style=shadow&taskId=u9d8f7a7f-49c7-46d4-a226-75b06770aa0&title=&width=571)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691459870451-241cf5a0-5942-4709-9db5-2a309572410d.png#averageHue=%23f5e8c3&clientId=u47c9d30e-675e-4&from=paste&height=232&id=uace0be3e&originHeight=929&originWidth=2284&originalType=binary&ratio=2&rotation=0&showTitle=false&size=453592&status=done&style=shadow&taskId=u6af456dd-7fd1-4024-994e-b382b9834de&title=&width=571)

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691460685123-02f59fe8-2adc-4826-a547-bfb666b0afeb.png#averageHue=%23f6f8f9&clientId=u47c9d30e-675e-4&from=paste&height=549&id=u27d6eb22&originHeight=1098&originWidth=634&originalType=binary&ratio=2&rotation=0&showTitle=false&size=55863&status=done&style=shadow&taskId=uc01e4f5c-9902-4f03-81dd-07dc1d15be1&title=&width=317)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691460700124-055f4b22-efc7-41d7-b67e-d4db0df5004d.png#averageHue=%23f9f9f7&clientId=u47c9d30e-675e-4&from=paste&height=355&id=u226b7957&originHeight=710&originWidth=1300&originalType=binary&ratio=2&rotation=0&showTitle=false&size=267384&status=done&style=shadow&taskId=u9f03c45b-441f-4c89-8b87-224fefff071&title=&width=650)

### V8 实现闭包

在定义函数后，V8 并不会编译解析内部的代码，所以内部的代码并不会抽象成 AST，这就是**惰性解析**
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691463642810-5b5e270c-b6ad-4f17-876d-f74eb2ce8ef0.png#averageHue=%23f9f9f9&clientId=u47c9d30e-675e-4&from=paste&height=268&id=u7f9374cc&originHeight=1073&originWidth=2284&originalType=binary&ratio=2&rotation=0&showTitle=false&size=447250&status=done&style=shadow&taskId=u48d88143-95e8-467c-9ceb-ee714f2beee&title=&width=571)
闭包有 3 个特性

1. JavaScript 语言允许在函数内部定义新的函数
2. 可以在内部函数中访问父函数的变量
3. 函数是一等公民，所以函数可以是返回值

这样的话，闭包会给惰性解析带来一定的问题
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691472273376-844cc396-1aa0-4a9e-b313-c520f06f8a84.png#averageHue=%23f6f8f9&clientId=u47c9d30e-675e-4&from=paste&height=174&id=ud2f935c2&originHeight=348&originWidth=552&originalType=binary&ratio=2&rotation=0&showTitle=false&size=25651&status=done&style=shadow&taskId=u6ffc134f-4ba0-4ece-9bfb-460e40ec2c7&title=&width=276)
当 foo() 函数调用结束后，d 应该被销毁了，但是 inner 中又使用了 d，这种情况，V8 做了特殊处理。
V8 使用了预解析器，比如当解析顶层代码的时候，遇到一个函数，那么预解析器并不会直接跳过这个函数，而是对该函数进行一次快速的预解析
主要是目的是两个：
判断函数是不是存在语法错误，如果存在语法错误会抛出异常。

```javascript
function test () {
  **
}
console.log(111) // 这里不会打印 111，因为 test 函数存在错误，会抛出异常，虽然 test 函数并没有被执行
```

检查函数内部是否使用了外部变量，如果引用了，会将栈中的值，复制到堆中，下次执行到该函数的时候，会从堆中获取值。

### V8 执行字节码

早期的 V8 也使用了两个编译器：

1. 第一个是基线编译器，它负责将 JavaScript 代码编译为没有优化过的机器代码。
2. 第二个是优化编译器，它负责将一些热点代码（执行频繁的代码）优化为执行效率更高 的机器代码。

执行：

1. 先将代码转换成 AST
2. 基线编译器将 AST 编译为未优化的机器代码
3. 在执行二进制代码的过程中，发现部分代码的重复率较高，V8 会把它标记成 Hot，Hot 代码会被优化编译器优化成执行效率高的二进制代码，然后执行
4. 当优化过的二进制代码不能满足当前的代码执行时，意味着优化失败，V8 会执行反编译操作

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691477708323-805c5cae-41f2-469f-ad8d-d92ce3f0f524.png#averageHue=%23fbfbfb&clientId=u6f6a3ea2-4a7a-4&from=paste&height=501&id=ud4d45680&originHeight=1002&originWidth=1490&originalType=binary&ratio=2&rotation=0&showTitle=false&size=285935&status=done&style=shadow&taskId=uef20d234-c028-4125-8b52-550a1cf9877&title=&width=745)
由于编译和执行的时间差不多，当出现重复代码的时候，需要反复编译，就浪费了 CPU 资源。
然后通过 JavaScript 源文件的字符串在内存中查找对应的编译后的二进制代码。这样当再次执行 到这段代码时，V8 就可以直接去内存中查找是否编译过这段代码。如果内存缓存中存在 这段代码所对应的二进制代码，那么就直接执行编译好的二进制代码。
V8 还会将代码缓存在硬盘中，那么即时关闭了电脑，下次再打开的时候，也不用重新去编译。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691478356581-ee486261-0166-4b20-88d3-2abfc3bd564c.png#averageHue=%23f7f7f7&clientId=u6f6a3ea2-4a7a-4&from=paste&height=281&id=u56800119&originHeight=1124&originWidth=1660&originalType=binary&ratio=2&rotation=0&showTitle=false&size=237097&status=done&style=shadow&taskId=u6694101c-2bc8-4b4e-b317-6dd5f3ec907&title=&width=415)
但是早期的 V8 在编译的时候，只编译顶层的代码，函数内部会在第一次执行的时候编译，所以没有办法适应多种不同情况，V8 团队引入了字节码。
字节码比源代码要大很多，但是却远小于二进制代码，有了字节码，无论是解释执行，还是编译执行，都可以直接针对字节码来进行操作。
并且由于字节码远小于二进制代码，所以可以将字节码全部存储在内存中。
虽然采用字节码在执行速度上稍慢于机器代码，但是整体上权衡利弊，采用字节码也许是最优解。之所以说是最优解，是因为采用字节码除了降低内存之外，还提升了代码的启动速度，并降低了代码的复杂度，而牺牲的仅仅是一点执行效率。
V8 的解释器叫 Ignition，(就原始字节码执行速度而言)是所有引擎中最快的解释器。
V8 的优化编译器名为 TurboFan，最终由它生成高度优化的机器码。
早期的 V8 将源码转换为二进制代码时，需要针对不同体系的 CPU 做处理，会增加代码量。
而现在的 V8 引入了字节码，在转换二进制代码时，只需要编译字节码就行了，这样对不同体系的 CPU 做的处理就会减少很多.
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691480261069-2e3ac97c-0e85-4c8d-a278-69778d91ec2c.png#averageHue=%23fbfbfa&clientId=udc3cfff3-89f1-4&from=paste&height=245&id=ueeccac99&originHeight=980&originWidth=1560&originalType=binary&ratio=2&rotation=0&showTitle=false&size=475704&status=done&style=shadow&taskId=u81ed1caa-da1b-4060-9989-1f7b0503aed&title=&width=390)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691480246347-380e3357-561c-4a1a-8c3d-65394d63fca0.png#averageHue=%23f8f7f6&clientId=udc3cfff3-89f1-4&from=paste&height=213&id=u438677b4&originHeight=850&originWidth=1296&originalType=binary&ratio=2&rotation=0&showTitle=false&size=130590&status=done&style=shadow&taskId=u2cea4943-9d55-4572-acf0-a52035842af&title=&width=324)

[V8 的解释器是基于寄存器的，运行方式类似 CPU。](https://alist.shenzjd.com/%E7%99%BE%E5%BA%A6%E7%BD%91%E7%9B%981/%E8%87%AA%E5%AD%A6%E6%95%99%E7%A8%8B/124%20%E5%9B%BE%E8%A7%A3%20Google%20V8%E3%80%90%E5%AE%8C%E7%BB%93%E3%80%91/14%EF%BD%9C%E5%AD%97%E8%8A%82%E7%A0%81%EF%BC%88%E4%BA%8C%EF%BC%89%EF%BC%9A%E8%A7%A3%E9%87%8A%E5%99%A8%E6%98%AF%E5%A6%82%E4%BD%95%E8%A7%A3%E9%87%8A%E6%89%A7%E8%A1%8C%E5%AD%97%E8%8A%82%E7%A0%81%E7%9A%84%EF%BC%9F.html)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691480731443-26cd17ce-4a99-43ee-bad5-c1c31fa367e3.png#averageHue=%23f4f7f8&clientId=udc3cfff3-89f1-4&from=paste&height=125&id=u85133c6f&originHeight=250&originWidth=394&originalType=binary&ratio=2&rotation=0&showTitle=false&size=32381&status=done&style=shadow&taskId=u75c429e2-b54e-462a-bbbe-f0fc35fcc85&title=&width=197)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691480763401-7f150499-8ab8-4d89-aba7-757a70cb2550.png#averageHue=%23faf8f7&clientId=udc3cfff3-89f1-4&from=paste&height=302&id=uac56bf11&originHeight=604&originWidth=1356&originalType=binary&ratio=2&rotation=0&showTitle=false&size=230195&status=done&style=shadow&taskId=u049cf3bf-6e45-4103-8f52-10fe84aac1e&title=&width=678)

### 在内存中快速查找对象属性

隐藏类和内联缓存都是用于，函数的参数是对象的情况，如果是一般类型的参数，并不会设计隐藏类和内联缓存机制。
**强调一点，虽然我们分析的隐藏类和 IC 能提升代码的执行速度，但是在实际的项目中，影响执行性能的因素非常多，找出那些影响性能瓶颈才是至关重要，你不需要过度关注微优化，你也不需要过度担忧你的代码是否破坏了隐藏类或者 IC 的机制**

#### 隐藏类

JS 是动态语言，对象的属性是可以增加和删除的，当 JS 需要获取对象的属性的时候，它并不知道对象中是否存在属性。所以去获取属性值的时候需要一步一步来查询，很耗时。
但是像 java 一样的静态语言编译后，对象一旦确定，属性是不能增减的。所以静态语言在获取对象属性的时候，因为属性的形状是确定的，cpu 可以直接从内存中读取。
JS 为了实现类似的特性，引入了隐藏类。**隐藏类有个前提：对象创建好了以后不会新增和删除属性**
V8 为每个对象创建了一个隐藏类，包括所有的属性，每种类型的偏移量。当 V8 访问某个属性的时候，就会去隐藏类中查找该属性相对于它的对象的偏移量，就可以直接从内存中取出属性值，而不需要经历一系列的查找过程，提高了效率。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691484044129-391bb7ec-b10b-46b2-b70a-1f67bcd99830.png#averageHue=%23f2efec&clientId=uc564a592-79be-4&from=paste&height=186&id=ub1db6485&originHeight=742&originWidth=1138&originalType=binary&ratio=2&rotation=0&showTitle=false&size=149530&status=done&style=shadow&taskId=u966cca75-d851-41b8-b8c0-a5c28220eb5&title=&width=285)
隐藏类是可以被共用的，当两个对象存在相同属性名、相同属性个数是时候，并且定义式属性顺序也相同，那么 V8 会共用隐藏类。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691484262298-e74d44cb-5412-4345-b9c4-eadcd593e85f.png#averageHue=%23faf9f8&clientId=uc564a592-79be-4&from=paste&height=410&id=ue8687feb&originHeight=820&originWidth=886&originalType=binary&ratio=2&rotation=0&showTitle=false&size=75710&status=done&style=shadow&taskId=u0b42ceda-3b23-48fa-884b-baed364fb15&title=&width=443)
因为 JS 是动态语言，对象属性是可以新增删除的，当新增或删除属性时，V8 就会重新构建隐藏类，如果经常改变，那么会消耗部分性能用于频繁的重构隐藏类。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691484397248-2b6d45cd-ef67-45a6-9629-22e43dae2b1d.png#averageHue=%23fae8cf&clientId=uc564a592-79be-4&from=paste&height=267&id=ud10dd3dc&originHeight=534&originWidth=1308&originalType=binary&ratio=2&rotation=0&showTitle=false&size=130985&status=done&style=shadow&taskId=ub88760d7-216f-4f65-aa9c-c432d1c6a77&title=&width=654)

#### 内联缓存 IC

隐藏类可以快速定位对象属性在内存中的位置，但是如果一个函数被频繁调用时，还是会出现，不停的查询隐藏类的问题。
V8 采用了内联缓存，内联缓存就是记录函数调用时，维护每个操作的调用点到一张**反馈向量表**中，后面再次调用函数时，直接从向量表中的对应位置取出偏移量。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691545920955-ebf741ec-fb63-4dc6-be69-1c3cefb9a586.png#averageHue=%23f5f7f8&clientId=ud041bcc1-ebed-4&from=paste&height=277&id=ua25fc6a2&originHeight=324&originWidth=330&originalType=binary&ratio=2&rotation=0&showTitle=false&size=40848&status=done&style=shadow&taskId=ue75e0baf-ff0d-4e7a-94eb-1eaf719d164&title=&width=282)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691545936822-abbc80be-badf-43da-8af0-fb1808447747.png#averageHue=%23f3dcbd&clientId=ud041bcc1-ebed-4&from=paste&height=409&id=uedce29b2&originHeight=818&originWidth=1298&originalType=binary&ratio=2&rotation=0&showTitle=false&size=319348&status=done&style=shadow&taskId=u0bf6a9ab-9c17-4fdc-991c-bcd20391856&title=&width=649)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691545998432-c357f9f9-8bd1-4833-b79b-41b138b12276.png#averageHue=%23e3e8ed&clientId=ud041bcc1-ebed-4&from=paste&height=247&id=uf219c942&originHeight=494&originWidth=1204&originalType=binary&ratio=2&rotation=0&showTitle=false&size=199617&status=done&style=shadow&taskId=uf2035352-8da4-4fe7-845c-7533dcf4800&title=&width=602)
但是，当函数参数对象的形状不固定的时候，例如：{x: 1, y: 2} {x: 2, y: 3}，函数再次被调用的事后，V8 会将新的隐藏类也存入向量表中，这个时候插槽里面一行就会有两个记录
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691546376242-4eb7de1d-49e9-49eb-8492-65bb6a6316a3.png#averageHue=%23e3e8ed&clientId=ud041bcc1-ebed-4&from=paste&height=255&id=u91adc10f&originHeight=510&originWidth=1300&originalType=binary&ratio=2&rotation=0&showTitle=false&size=163357&status=done&style=shadow&taskId=u7615d1b3-7db4-49d6-85be-e157c03474d&title=&width=650)
如果插槽包含 1 个隐藏类就是**单态**，2~4 个**多态**，超过 4 个**超态**。
多态时，隐藏类是按线性存储的，超态时，V8 就会用 hash 表来存储，这无疑减缓了执行的速度，效率更低，所以尽量使用单态的情况。

### 回调函数

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691571532584-bcde2585-1f04-4a7a-85a9-147e7abc8a59.png#averageHue=%23fafaf9&clientId=u3fcee6a0-f0c0-4&from=paste&height=326&id=u1499ed3e&originHeight=892&originWidth=1378&originalType=binary&ratio=2&rotation=0&showTitle=false&size=245763&status=done&style=shadow&taskId=u585c8b3e-1e4f-4882-9fb8-e6bbebd25d4&title=&width=504)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691571554213-8799db41-5473-4141-a596-e5a704d50ad2.png#averageHue=%23fbfafa&clientId=u3fcee6a0-f0c0-4&from=paste&height=328&id=u711f5838&originHeight=884&originWidth=1232&originalType=binary&ratio=2&rotation=0&showTitle=false&size=182285&status=done&style=shadow&taskId=uf40ff0a3-91be-47c9-82af-8c715e10a84&title=&width=457)

### 微任务，宏任务，Vue.nextTick()

#### 简介

宏任务（Macrotask）通常是由事件队列中的事件触发的任务，比如点击事件、定时器事件、网络请求等。常见的宏任务包括 setImmediate(NodeJs)、MessageChannel、setTimeout、setInterval、DOM 事件等。当一个宏任务执行时，会一直执行直到完成，期间不会被其他任务打断。
微任务（Microtask）是在当前任务执行结束后立即执行的任务。微任务通常是由 Promise、MutationObserver 等异步操作创建的。常见的微任务包括 Promise 的 then、catch、finally 回调函数和 MutationObserver 的回调函数等。微任务一般会在当前宏任务执行结束之后、渲染之前执行。

setImmediate 是 Nodejs 中的方法，他的优先级比 setTimeout、setInterval 要高，与 setTimeout 类似，setImmediate 也可用于延迟执行代码。但与 setTimeout 不同，setImmediate 在下一个事件循环迭代之前执行，而不是在指定的延迟时间之后执行。
MutationObserver 是一个用于监听 DOM 变化的 Web API。它提供了一种机制，可以在元素的属性或子节点发生变化时触发回调函数。

#### 事件循环流程

[事件循环](https://alist.shenzjd.com/%E7%99%BE%E5%BA%A6%E7%BD%91%E7%9B%981/%E8%87%AA%E5%AD%A6%E6%95%99%E7%A8%8B/124%20%E5%9B%BE%E8%A7%A3%20Google%20V8%E3%80%90%E5%AE%8C%E7%BB%93%E3%80%91/18%E4%B8%A8%E5%BC%82%E6%AD%A5%E7%BC%96%E7%A8%8B%EF%BC%88%E4%B8%80%EF%BC%89%EF%BC%9AV8%E6%98%AF%E5%A6%82%E4%BD%95%E5%AE%9E%E7%8E%B0%E5%BE%AE%E4%BB%BB%E5%8A%A1%E7%9A%84%EF%BC%9F.html)
[浏览器与 Node 的事件循环(Event Loop)有何区别?](https://juejin.cn/post/6844903761949753352#heading-26)
[一次弄懂 Event Loop（彻底解决此类面试问题）](https://juejin.cn/post/6844903764202094606)
[深入事件环(In The Loop)Jake Archibald@JSconf 2018](https://www.bilibili.com/video/BV1a4411F7t7/?spm_id_from=333.999.0.0&vd_source=fe6dc2a4a3c1497cc11e459048f7adac)

- 首先会先执行<script>内容，它也是一个宏任务
- 主线程执行栈中就会新增一个微任务队列
- 遇到微任务就放进微任务队列，遇到宏任务就放进宏任务队列
- 当主线成将同步代码执行完以后，会去微任务队列中按顺序执行所有的微任务，如果微任务中又生成了微任务，那么该微任务会放入当前的微任务队列
- 但微任务队列的任务都执行完成，主线程会结束这次 task 任务，并触发 UI 渲染
- 接着主线程会从宏任务队列中取出优先级最高的宏任务执行，再重复上述的步骤

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691653074310-e2c1e7a2-be1d-45e1-b922-d5b0e9291b15.png#averageHue=%23f4f6f8&clientId=ufcd17fc9-6bd8-4&from=paste&height=400&id=ud70aca5d&originHeight=980&originWidth=796&originalType=binary&ratio=2&rotation=0&showTitle=false&size=125152&status=done&style=shadow&taskId=u20f526ad-2feb-4f0f-8161-c26e68ea95d&title=&width=325)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691653225611-5e90458a-363f-4cc1-abf9-ef4192242136.png#averageHue=%23f5f7f8&clientId=ufcd17fc9-6bd8-4&from=paste&height=400&id=u2e412351&originHeight=398&originWidth=250&originalType=binary&ratio=2&rotation=0&showTitle=false&size=23595&status=done&style=shadow&taskId=u41739d89-5676-481c-a223-0fe495a5afb&title=&width=251)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691653112728-2e7c3e43-73ce-4ebb-bcc3-943ed473e98a.png#averageHue=%23f9f7f5&clientId=ufcd17fc9-6bd8-4&from=paste&height=300&id=u89b81ead&originHeight=710&originWidth=1284&originalType=binary&ratio=2&rotation=0&showTitle=false&size=254277&status=done&style=shadow&taskId=u3be78e80-a6da-4ee6-9b95-f57b307d652&title=&width=543)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691653129858-74ada395-d886-4931-90f4-d8cc6454c45c.png#averageHue=%23f4ebe0&clientId=ufcd17fc9-6bd8-4&from=paste&height=300&id=u1c100bc9&originHeight=764&originWidth=1274&originalType=binary&ratio=2&rotation=0&showTitle=false&size=367983&status=done&style=shadow&taskId=u6a62e197-d9b4-4bd3-8704-ab1da97392b&title=&width=500)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691653183435-5a26e0ea-8fb4-4220-9409-cb68d0a6bc56.png#averageHue=%23f3ebde&clientId=ufcd17fc9-6bd8-4&from=paste&height=300&id=u33f80d04&originHeight=750&originWidth=1288&originalType=binary&ratio=2&rotation=0&showTitle=false&size=452927&status=done&style=shadow&taskId=uaa89fc26-2a3b-440f-8b4a-e9a8592d9b1&title=&width=515)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691653199202-d97d1d22-2d90-44d6-9294-259a49aa95bd.png#averageHue=%23f5eee1&clientId=ufcd17fc9-6bd8-4&from=paste&height=300&id=ud98d5241&originHeight=724&originWidth=1262&originalType=binary&ratio=2&rotation=0&showTitle=false&size=336599&status=done&style=shadow&taskId=u7b7659cf-15da-4357-a4dd-eb25bd54dda&title=&width=523)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691653262519-3a13bd65-4955-43f7-9e2d-e93dd1e75372.png#averageHue=%23f7f2f0&clientId=ufcd17fc9-6bd8-4&from=paste&height=300&id=ud4eca4b2&originHeight=718&originWidth=1250&originalType=binary&ratio=2&rotation=0&showTitle=false&size=271900&status=done&style=shadow&taskId=u142724e8-4ffb-48f6-ba53-3e87623b991&title=&width=522)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691653290992-018e4e9f-ada7-4b01-a9fc-4169529b53c5.png#averageHue=%23f3ede3&clientId=ufcd17fc9-6bd8-4&from=paste&height=300&id=udcbc9480&originHeight=744&originWidth=1262&originalType=binary&ratio=2&rotation=0&showTitle=false&size=390656&status=done&style=shadow&taskId=u58715c43-3df3-49f0-9b86-65bd85c7f49&title=&width=509)

#### Vue.nextTick()

[浏览器事件循环（结合 vue nextTick）](https://juejin.cn/post/6844903825355046919)
在主线程及 microTask 执行过程中，每一次 dom 或 css 更新，浏览器都会进行计算，而计算的结果并不会被立刻渲染，而是在当所有的 microTask 队列中任务都执行完毕后，统一进行渲染（这也是浏览器为了提高渲染性能和体验做的优化）所以，这个时候通过 js 访问更新后的 dom 节点或者 css 是可以拿到的，因为浏览器已经完成计算，仅仅是它们还没被渲染而已。

```vue
<template>
  <div>
    <div class="title" ref="test">{{ title }}</div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Index extends Vue {
// 和vue data()是一样的，我们这里是ts写法
title: string = 'nothing'

mounted () {
  // 模拟接口获取数据
  setTimeout(() => {
    this.title = '测试标题'

    this.$nextTick(() => {
      console.log('debug:', this.title, this.$refs.test['innerHTML'])
      alert('渲染完了么?')
    })
  }, 0)
}
</script>
<style lang="scss">
.title {
  font-size: pxToRem(158px);
  text-align: center;
}
</style>
```

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691654621248-f48e5a63-da28-4206-a81a-4927d4f1973f.png#averageHue=%23f8f6f5&clientId=ufcd17fc9-6bd8-4&from=paste&height=350&id=u1503e505&originHeight=700&originWidth=1388&originalType=binary&ratio=2&rotation=0&showTitle=false&size=146995&status=done&style=shadow&taskId=u334d5b19-4e57-447c-89b3-a6e8c91f24b&title=&width=694)

### 回调地狱

#### Generator

协程是比线程更轻量级的存在，可以把他看成跑在线程上的任务，一个线程可以有多个协程，但是一次只能执行一个。
如果从 A 协程启动 B 协程，我们就把 A 协程称为 B 协程的父协程。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691660883651-1649e81a-f335-431f-ad14-863ae095df05.png#averageHue=%23f5f7f8&clientId=u608898ec-7910-4&from=paste&height=327&id=uaaafab06&originHeight=654&originWidth=522&originalType=binary&ratio=2&rotation=0&showTitle=false&size=55678&status=done&style=shadow&taskId=u0407070b-7e50-4265-bb1e-c0e86ff6ca4&title=&width=261)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691660900396-830337e4-144b-4ed7-bbd4-888f7c0d8e3f.png#averageHue=%23fcfbfa&clientId=u608898ec-7910-4&from=paste&height=327&id=u83de239c&originHeight=670&originWidth=1390&originalType=binary&ratio=2&rotation=0&showTitle=false&size=226459&status=done&style=shadow&taskId=uad30174e-8ceb-435a-80a3-2415a7f8db7&title=&width=678)

#### async/await

如果 await 等待的是一个非 Promise 对象，那 V8 会把他包装成一个 Promise.resolve。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691661185569-d3af8173-2e38-422d-8d19-66c58e8bffaf.png#averageHue=%23f4f7f8&clientId=u608898ec-7910-4&from=paste&height=351&id=ubb437452&originHeight=702&originWidth=730&originalType=binary&ratio=2&rotation=0&showTitle=false&size=78698&status=done&style=shadow&taskId=uf0945bea-f5d1-4f81-a332-85c45232dc6&title=&width=365)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691661194678-36074e4e-d951-49d8-b953-d14a5c5ae893.png#averageHue=%23fbfaf9&clientId=u608898ec-7910-4&from=paste&height=289&id=u7de049b4&originHeight=578&originWidth=1422&originalType=binary&ratio=2&rotation=0&showTitle=false&size=158337&status=done&style=shadow&taskId=u03f12f42-d9e7-4478-884d-9f1a4282407&title=&width=711)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691661273000-247d567b-4e25-4e9e-b712-ecf98b83e338.png#averageHue=%23fcfcfc&clientId=u608898ec-7910-4&from=paste&height=427&id=u5aaea2ae&originHeight=854&originWidth=1434&originalType=binary&ratio=2&rotation=0&showTitle=false&size=142016&status=done&style=shadow&taskId=u62f869d8-9e41-42d2-af54-51a6a43ff70&title=&width=717)

### 垃圾回收

#### 产生

```javascript
window.test = new Object()
window.test.a = new Uint16Array(100)

// test 中的 a 属性指向改变了，那么此时堆中的成为了垃圾数据，因为我们无法从一个根对象遍历到这个 Array 对象
window.test.a = new Object()
```

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691732329237-e4de7952-1e3f-4dba-8d80-02314b3d437c.png#averageHue=%23f8f8f8&clientId=u948f5fda-1378-4&from=paste&height=211&id=u953cba67&originHeight=524&originWidth=1368&originalType=binary&ratio=2&rotation=0&showTitle=false&size=100997&status=done&style=shadow&taskId=uaccdec98-a856-4fcd-b259-b735b2d257b&title=&width=550)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691732335287-6c1e6bcd-26a8-45e0-b05a-50016d1c4c2e.png#averageHue=%23faf6f6&clientId=u948f5fda-1378-4&from=paste&height=212&id=ufcd1dd97&originHeight=524&originWidth=1358&originalType=binary&ratio=2&rotation=0&showTitle=false&size=106106&status=done&style=shadow&taskId=uc4fe11ee-8090-4966-b347-3afc285ea78&title=&width=550)

#### 垃圾回收算法

第一步，通过 GC Root 标记空间中的**活动对象**和**非活动对象**
目前 V8 采用可访问性（reachability）算法来判断堆中的对象是活动对象。这个算法将一些 GC Root 作为初始存在的对象的集合，从 GC Roots 对象触发，遍历 GC Root 中的所有对象。
能遍历到的对象，认为就是可访问的，需要保留。没有遍历到的则是不可访问的，需要被回收。
GC Root 可以是以下几种类型：

1. 栈帧中的本地变量和参数：栈帧是方法调用时创建的，包含了方法的局部变量和参数等信息。如果一个对象被栈帧中的本地变量或参数引用，它就被认为是一个 GC Root。
2. 静态变量：静态变量属于类而不是实例，它们被存储在方法区中。如果一个对象被任何静态变量引用，它也被视为 GC Root。
3. 活动线程：正在运行的线程的堆栈中的对象也被视为 GC Root。

第二步，回收占据的内存
第三步，内存整理。频繁回收对象后，内存中会存在大量不连续的空间，成为**内存碎片**。

V8 采用了两个垃圾回收器，**主垃圾回收器-Major GC 和副垃圾回收器-Minor GC**，之所以使用两个，主要是受到了**代际假说**的影响。

- 第一个就是大部分对象都是存在时间很短的，比如局部变量。这类对象一经分配，很快就变的不可访问了。
- 第二个是不死的对象，活的很久，比如全局的 window，DOM，Web API。

V8 会把堆分为新生代和老生代两个区域，新生代存放生存时间较短的，老生代存放生存时间久的

- **副垃圾回收器-Mino GC (Scavenger)，主要负责新生代的垃圾回收**
- **主垃圾回收器-Major GC，主要负责老生代的垃圾回收**

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691733184018-ec04cf38-02c9-4e41-96d2-58cca9495e75.png#averageHue=%23fcebd7&clientId=u948f5fda-1378-4&from=paste&height=423&id=ue6ee0879&originHeight=846&originWidth=1368&originalType=binary&ratio=2&rotation=0&showTitle=false&size=220971&status=done&style=shadow&taskId=uaedd0858-e549-4e92-ad74-8218d71f3d5&title=&width=684)

##### 副垃圾回收器

新生代的垃圾数据用 Scavenge 算法来处理
新加入的对象会放入对象区，当对象区放满时，就需要执行一次垃圾清理操作。
在垃圾回收的过程中，首先要对对象区域的垃圾做标记，标记完成后就进入垃圾清理阶段。副垃圾回收器会把这些存货的对象复制到空闲区，同时让他们变得有序，这样就没有内存碎片了。
完成复制后，对象区和空闲区的**角色反转**，这种操作能让新生代的这两块区域无限重复使用下去。
不过每次回收清理都要复制对象到空闲区，需要时间成本，如果新生区设置的太大，那么每次清理的时间就会很久，所以一般**新生区的空间被设置的很小**。
副垃圾回收器还会采用**对象晋升策略**，移动那些经过两次垃圾回收依然还存货的对象到老生代中。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691733252521-8d520db6-344f-4dbd-a99a-2b132d14ec78.png#averageHue=%23faf5f4&clientId=u948f5fda-1378-4&from=paste&height=347&id=ue45624cd&originHeight=822&originWidth=1302&originalType=binary&ratio=2&rotation=0&showTitle=false&size=61836&status=done&style=shadow&taskId=ueae06331-1a4c-4ebd-bb98-de3c09c5172&title=&width=550)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691733268388-ac5aa1d5-bdb7-4634-bdc0-7d3ca8f4f58f.png#averageHue=%23faf5f4&clientId=u948f5fda-1378-4&from=paste&height=338&id=u9e7ab1d2&originHeight=818&originWidth=1330&originalType=binary&ratio=2&rotation=0&showTitle=false&size=77288&status=done&style=shadow&taskId=uecabb1b0-d9a8-4fdb-8843-c6b48345195&title=&width=550)

##### 主垃圾回收器

除了新生代晋升的对象，一些打的对象会直接被分配到老生代里。因为老生代的对象一个是对象占用空间大，一个是对象存活时间长。
因为老生代的对象大，所以就不能像新生代一样复制对象，执行效率不高，同时还会浪费空间。所以主垃圾回收器采用**标记-清除**算法进行垃圾回收。

- 标记过程，递归遍历根元素，把没有到达的元素判断为垃圾数据。
- 清除，主垃圾回收器会直接将标记为垃圾的数据清理掉。

不过这样会产生大量不连续的内存碎片，于是又引入了另一种算法**标记-整理**

- 标记可回收的对象
- 让所有存活的对象都向一端移动，然后直接清理掉这一端之外的内存

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691733680177-6d5b4db6-6e00-462b-b116-e14de1ddfb0c.png#averageHue=%23faf3f2&clientId=u948f5fda-1378-4&from=paste&height=304&id=u61edaa35&originHeight=724&originWidth=1308&originalType=binary&ratio=2&rotation=0&showTitle=false&size=45285&status=done&style=shadow&taskId=ufc7be9c8-8309-4183-a92c-0df03f46bf7&title=&width=550)![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691733696853-8bec7ee3-f8a5-4d6c-9e0e-86403a79ff72.png#averageHue=%23fafafa&clientId=u948f5fda-1378-4&from=paste&height=257&id=uced71c49&originHeight=644&originWidth=1380&originalType=binary&ratio=2&rotation=0&showTitle=false&size=35723&status=done&style=shadow&taskId=ucaff72c0-0e7a-4773-88ca-bda72221c9d&title=&width=550)

#### 优化垃圾回收效率

垃圾回收和 JavaScript 都是运行在主线程上的，一旦执行垃圾回收，js 脚本就要停下来，等回收完毕再回复脚本运行，这种行为叫**全停顿**。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691734322422-0a28e6e3-5483-4132-893b-41d7e6c9ffdf.png#averageHue=%23f5bf76&clientId=u8c197092-d345-4&from=paste&height=213&id=ud14b2b08&originHeight=426&originWidth=1300&originalType=binary&ratio=2&rotation=0&showTitle=false&size=147844&status=done&style=shadow&taskId=ua41aaefc-589d-4d34-9e11-eaf914b8b59&title=&width=650)

##### 并行回收

垃圾回收再主线程执行的过程中，开启多个辅助线程，同时执行回收工作。
V8 的副垃圾回收器所采用的就是并行策略，回收的时候启动多个线程在负责新生代的垃圾清理操作，这些操作同时将对象空间的数据复制到空闲空间中。由于地址发生了改变，所以还需要同步更新引用这些对象的指针。
虽然优化了回收器，但是仍然是一种全停顿的垃圾回收方式。对老生代的大对象，事件依然会很久。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691734419390-7bfe2e28-39c0-4a75-810f-8351efeccc6f.png#averageHue=%23f6c288&clientId=u8c197092-d345-4&from=paste&height=226&id=u98ee14da&originHeight=452&originWidth=1306&originalType=binary&ratio=2&rotation=0&showTitle=false&size=180617&status=done&style=shadow&taskId=uef607904-0304-4964-b764-1df37f7b9a3&title=&width=653)

##### 增量回收

垃圾收集器将标记工作分解成更小的块，并且穿插在主线程不同的任务之间执行。采用增量垃圾回收时，垃圾回收器没有必要一次性执行完整的垃圾回收过程，每次只是整个过程的一小部分。
增量回收要比全停顿的复杂一些，因为它是并发的，要实现执行，需要满足两点要求：

- 垃圾回收可以随时暂停和重启，暂停时保存扫描结果，等下一波垃圾回收来了才继续启动。
- 在暂停期间，被标记好的垃圾数据如果被 JavaScript 代码修改了，那么垃圾回收器需要能够正确地处理。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691735394248-4ec5b7b9-a91a-418d-9cfd-af90ba7cef4c.png#averageHue=%23f7d3ab&clientId=u8c197092-d345-4&from=paste&height=218&id=uc07ef6da&originHeight=436&originWidth=1272&originalType=binary&ratio=2&rotation=0&showTitle=false&size=139534&status=done&style=shadow&taskId=u8f4e1254-f515-4470-bbc4-b5bd0c45473&title=&width=636)
这里我们需要知道，在没有采用增量算法之前，V8 使用黑色和白色来标记数据。在执行一次完整的垃圾回收之前，垃圾回收器会将所有的数据设置为白色，用来表示这些数据还没有被标记，然后垃圾回收器在会从 GC Roots 出发，将所有能访问到的数据标记为黑色。遍历结束之后，被标记为黑色的数据就是活动数据，那些白色数据就是垃圾数据。如下图所示：
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691735725164-b8985a4b-05fc-45ed-9c26-a886881fe429.png#averageHue=%23e8e8e8&clientId=u8c197092-d345-4&from=paste&height=400&id=ud62c927e&originHeight=800&originWidth=1278&originalType=binary&ratio=2&rotation=0&showTitle=false&size=143845&status=done&style=shadow&taskId=u2b471ace-2f2c-4ad5-9fdc-51c2bcc115b&title=&width=639)
如果内存中的数据只有两种状态，非黑即白，那么当你暂停了当前的垃圾回收器之后，再次恢复垃圾回收器，那么垃圾回收器就不知道从哪个位置继续开始执行了。
比如垃圾回收器执行了一小段增量回收后，被 V8 暂停了，然后主线程执行了一段 JavaScript 代码，然后垃圾回收器又被恢复了，那么恢复时内存状态就如下图所示。
那么，当垃圾回收器再次被启动的时候，它到底是从 A 节点开始标记，还是从 B 节点开始执行标注过程呢？因为没有其他额外的信息，所以垃圾回收器也不知道该如何处理了。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691735913286-ade9193f-ac86-4d10-905e-746d68283f4c.png#averageHue=%23e6e6e6&clientId=u8c197092-d345-4&from=paste&height=394&id=u34892d40&originHeight=822&originWidth=1364&originalType=binary&ratio=2&rotation=0&showTitle=false&size=134036&status=done&style=shadow&taskId=ueb329a7b-78b5-486b-9096-b19529de89c&title=&width=653)
为了解决这个问题，V8 采用了**三色标记法**，除了黑色，白色，还引入了灰色。

- 黑色表示这个节点被 GC Root 引用到了，而且该节点的子节点都已经标记完成了 ;
- 灰色表示这个节点被 GC Root 引用到，但子节点还没被垃圾回收器标记处理，也表明目前正在处理这个节点；
- 白色表示这个节点没有被访问到，如果在本轮遍历结束时还是白色，那么这块数据就会被收回。

引入灰色标记之后，垃圾回收器就可以依据当前内存中有没有灰色节点，来判断整个标记是否完成，如果没有灰色节点了，就可以进行清理工作了。如果还有灰色标记，当下次恢复垃圾回收器时，便从灰色的节点开始继续执行。

接下来，我们再来分析下，标记好的垃圾数据被 JavaScript 修改了，V8 是如何处理的。我们看下面这样的一个例子：

```javascript
window.a = new Object()
window.a.b = new Object()
window.a.b.c = new Object()

window.a.b = new Object()
```

![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691736427134-39bf4a48-ca7c-416e-9990-8f277fda2b37.png#averageHue=%23e3e3e3&clientId=u8c197092-d345-4&from=paste&height=198&id=u833cbca8&originHeight=396&originWidth=1394&originalType=binary&ratio=2&rotation=0&showTitle=false&size=45712&status=done&style=shadow&taskId=u5f2082da-eaba-4300-b28e-b719e0cd7c0&title=&width=697)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691736432717-3b60189b-6793-4e45-a615-eb3792d0438a.png#averageHue=%23e7e7e7&clientId=u8c197092-d345-4&from=paste&height=227&id=uacacd5bc&originHeight=454&originWidth=1420&originalType=binary&ratio=2&rotation=0&showTitle=false&size=62725&status=done&style=shadow&taskId=ua8704b6b-1917-4fa0-9366-42ff45d8de1&title=&width=710)
这就说明一个问题，当垃圾回收器将某个节点标记成了黑色，然后这个黑色的节点被续上了一个白色节点，那么垃圾回收器不会再次将这个白色节点标记为黑色节点了，因为它已经走过这个路径了。
但是这个新的白色节点的确被引用了，所以我们还是需要想办法将其标记为黑色。
为了解决这个问题，增量垃圾回收器添加了一个约束条件：**不能让黑色节点指向白色节点**。
通常我们使用写屏障机制实现这个学术条件，当发生黑色的节点引用了白色的节点，写屏障机制会强制将引用的白色节点编程灰色的，这样就保证了黑色节点不能指向白色节点的约束条件。这个方法也被称为**强三色不变形**，它保证了垃圾回收器能够正确地回收数据，因为在标记结束时的所有白色对象，对于垃圾回收器来说，都是不可到达的，可以安全释放。

##### 并发回收（concurrent）

三色标记法和写屏障还是在主线程上进行的，如果主线程忙的时候，增量回收操作依然会印象主线程处理任务的吞吐量。
**并发回收，是指在主线程执行 JavaScript 的过程中，辅助线程能够在后台完成执行垃圾回收的操作。**
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691736864485-5e9eafe9-0a31-4918-ab4d-851ed68579b8.png#averageHue=%23fab86c&clientId=u8c197092-d345-4&from=paste&height=323&id=u86cc7fba&originHeight=722&originWidth=1342&originalType=binary&ratio=2&rotation=0&showTitle=false&size=201622&status=done&style=shadow&taskId=u3c6d2aed-7e41-4ef0-9176-620e3e5081b&title=&width=600)
并发回收的优势非常明显，主线程不会被挂起，JavaScript 可以自由地执行 ，在执行的同时，辅助线程可以执行垃圾回收操作。
但是并发回收却是这三种技术中最难的一种，这主要由以下两个原因导致的：

- 第一，当主线程执行 JavaScript 时，堆中的内容随时都有可能发生变化，从而使得辅助线程之前做的工作完全无效；
- 第二，主线程和辅助线程极有可能在同一时间去更改同一个对象，这就需要额外实现读写锁的一些功能了。

尽管并行回收要额外解决以上两个问题，但是权衡利弊，并行回收这种方式的效率还是远高于其他方式的。
不过，这三种技术在实际使用中，并不是单独的存在，通常会将其融合在一起使用，V8 的主垃圾回收器就融合了这三种机制，来实现垃圾回收，那它具体是怎么工作的呢？你可以先看下图：
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691737024904-5b592d86-cd22-4fe9-a47a-57ea900d08d2.png#averageHue=%23f5e0c8&clientId=u8c197092-d345-4&from=paste&height=310&id=u4165bd09&originHeight=696&originWidth=1346&originalType=binary&ratio=2&rotation=0&showTitle=false&size=153524&status=done&style=shadow&taskId=u0c97b646-4928-49aa-bb8e-bb7f73a7ac5&title=&width=600)
可以看出来，主垃圾回收器同时采用了这三种策略：

- 首先主垃圾回收器主要使用并发标记，我们可以看到，在主线程执行 JavaScript，辅助线程就开始执行标记操作了，所以说标记是在辅助线程中完成的。
- 标记完成之后，再执行并行清理操作。主线程在执行清理操作时，多个辅助线程也在执行清理操作。
- 另外，主垃圾回收器还采用了增量标记的方式，清理的任务会穿插在各种 JavaScript 任务之间执行。

### 常见的内存问题

#### 内存泄露 Memory Leak

我们先看内存泄漏。本质上，内存泄漏可以定义为：当进程不再需要某些内存的时候，这些不再被需要的内存依然没有被进程回收。
在 JavaScript 中，造成内存泄漏 (Memory leak) 的主要原因是不再需要 (没有作用) 的内存数据依然被其他对象引用着。

```javascript
function test() {
  // 这里的 tempArray 会被隐式的改写为 this.tempArray，而 this 是指向 window 的
  // window 对象是常驻内存的，所有 tempArray 也会被常驻内存
  tempArray = new Array(100000)
}




function foo() {
  // bad
  var tempObj = new Object()
  tempObj.x = 1
  tempObj.y = 2
  tempObj.array = new Array(2000000)

  return function () {
    // 这个匿名函数的只使用了 x 属性，但是 V8 会在内存中保留 tempObj 一整个对象
    console.log(tempObj.x)
  }

  // good
  let x = tempObj.x
  return function () {
    console.log(x)
  }
}


// 当删除掉 Dom 树的时候，因为 detachedTree 还保留了 Dom 元素，所以也不会被销毁
let detachedTree;
function create() {
    var ul = document.createElement('ul');
    for (var 1 = 0; 1 < 100; i++) {
        var li = document.createElement('i');
        ul.appendChild(11);
    }
    detachedTree = ul;
}
create()
```

#### 内存膨胀

内存膨胀和内存泄漏有一些差异，内存膨胀主要表现在程序员对内存管理的不科学，比如只需要 50M 内存就可以搞定的，有些程序员却花费了 500M 内存。
额外使用过多的内存有可能是没有充分地利用好缓存，也有可能加载了一些不必要的资源。通常表现为内存在某一段时间内快速增长，然后达到一个平稳的峰值继续运行。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/165570/1691843100010-b2bbf028-b016-44e2-97b5-aa56c644e60b.png#averageHue=%23fcfcfc&clientId=u4b72cc77-b89a-4&from=paste&height=299&id=uc00f0dc7&originHeight=299&originWidth=718&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25970&status=done&style=shadow&taskId=u9950132a-c368-495c-911f-bfac7a70816&title=&width=718)

#### 频繁的垃圾回收

除了内存泄漏和内存膨胀，还有另外一类内存问题，那就是频繁使用大的临时变量，导致了新生代空间很快被装满，从而频繁触发垃圾回收。频繁的垃圾回收操作会让你感觉到页面卡顿。

```javascript
function strToArray(str) {
    let i = 0
    const len = str.length
    let arr = new Uint16Array(str.length)
    for (; i < len; ++i) {
        arr[i] = str.charCodeAt(i)
    }
    return arr;
}

function foo() {
    Let i = 0
    Let str = 'test V8 GC'
    while (i++ < 1e5) {
        strToArray(str);
    }
}

foo()
```
