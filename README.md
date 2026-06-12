# h5-factory

scss文件编译成css，默认依赖sass包，这是出于项目体量与兼容性考虑的。如果你想获得更快的编译速度，并且环境允许，你可以更换成sass-embedded。
``` js
npm uninstall sass
npm install sass-embedded
```

https://sass-lang.com/install/
他们都是官方维护的包， api一致， sass-embedded 有更极致的性能， sass 有更好的兼容性。

### 更新记录

[CHANGELOG.md](https://github.com/chocho-1115/h5-factory/blob/main/CHANGELOG.md)

### 业务场景

营销类H5的开发，他们通常有以下特点：

* 开发周期短、上线时间短
* 项目数量多
* 项目体量小

总结起来就有“短频快”的特点。基于这些特点，体现在对开发的要求上就是要快速响应并产出，于是就有了这个项目。它主要解决了以下问题：

* 支持一套构建工程管理多个项目，避免需要维护多套构建工程的麻烦；
* 支持一键生成基础模板，提供原生与react两种模板类型满足不同项目需求，模板封装了一些常用基础功能，在模板下进行二次开发，提升开发效率；


## Basic Usage

### Creating a New Project

To create a new project, run the following command:

```bash
name=projectName npm run create
```

Executing the above command will copy the template directory `./template` to `src` and rename it to `projectName`.

If you prefer to develop your project using React, use the following command instead:

```bash
name=projectName npm run create -react
```

This will copy the template directory `./template-react` to `src` and rename it to `projectName`.

### Development Environment

To start the development server, run:

```bash
name=projectName npm run dev
```

### Production Build (Demo Project Packaging)

To build the demo project for production, execute:

```bash
name=projectName npm run build
```

### Running Templates in Development Environment

To run the default template in the development environment:

```bash
name=template npm run dev
```

To run the React-based template in the development environment:

```bash
name=template-react npm run dev
```
