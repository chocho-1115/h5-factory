# h5-factory

A single build toolchain to manage all your small web projects.

Small web projects usually end up duplicating the same build setup over and over — each one maintaining its own config, dependencies and scripts. This project solves that by providing one shared build toolchain: all your small projects live under it, so you manage them all in one place instead of maintaining a toolchain per project.

Key features:

- Manage multiple projects under a single build system, eliminating the need to maintain multiple build configurations.
- One-click scaffolding with both native and React templates, pre-packaged with commonly used foundational features, ready for secondary development.


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

### Production Build

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

## Dependencies

### Sass

The project uses the `sass` package by default to compile SCSS files into CSS. This decision is based on considerations of project size and compatibility. If you need faster compilation speed and your environment allows it, you can replace `sass` with `sass-embedded`.

```bash
npm uninstall sass
npm install sass-embedded
```

Both packages are officially maintained and share the same API. `sass-embedded` offers better performance, while `sass` provides better compatibility.

[Reference](https://sass-lang.com/install/)

### Adding Dependencies

- When you need to add non-build-related dependencies (e.g., business libraries such as `swiper`, `pixi`, etc.) for a specific project, it is recommended to install the dependency inside the project directory to achieve dependency isolation between projects.
- When installing dependencies inside a project directory, you may need to add the `--legacy-peer-deps` flag in certain cases. This resolves version conflicts caused by duplicate installations of the same package across project-level and build-level dependencies.


## Update Log

[CHANGELOG.md](https://github.com/chocho-1115/h5-factory/blob/main/CHANGELOG.md)
