### 学习思考

* react与vue的更新粒度
* 函数式编程思想 Immutable
* 函数组件与类组件
* 展示组件(Presentational component)和容器组件(Container component)

### link
* [sass](https://sass-lang.com/install/)

### fileURLToPath 方案 与  import.meta.dirname 方案 对比

import { fileURLToPath, URL } from 'node:url'
'@': fileURLToPath(new URL('./src', import.meta.url))

import path from 'node:path'
'@': path.join(import.meta.dirname, "./src")

前者（fileURLToPath 方案）：这是为了在 ES Module（ESM） 模式下“模拟”出 CommonJS 的 __dirname。因为 ESM 中没有 __dirname 变量，所以需要先通过 import.meta.url 拿到文件路径字符串（file:///...），再用 Node.js 的 url 模块把它解析成系统路径。

后者（import.meta.dirname 方案）：这是 Node.js 20.11.0 及以上版本正式引入的原生 ESM 语法。它直接返回当前模块所在的目录路径，无需任何转换。

所以前者是一个过渡方案 后者是标准的ESM方案
