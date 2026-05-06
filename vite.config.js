import path from 'path'

import {
  defineConfig,
  loadEnv
} from 'vite'

import projectConfig from './config/project.js'

const debug = false
debug && console.log('=====')
debug && console.log(projectConfig)

export default defineConfig(({
  command,
  mode
}) => {
  debug && console.log(command, mode)

  const config = {
    root: projectConfig.src,
    // publicDir: path.join(__dirname, '/public'),
    resolve: {
      alias: {
        // '@': fileURLToPath(new URL('./src', import.meta.url))

        '~': path.join(__dirname, '/common'),
        '@': path.join(__dirname, projectConfig.src),
      },
    },
    server: {
      open: false,
    },
    build: {
      emptyOutDir: true,
      outDir: path.join(__dirname, projectConfig.dist)
    },
  }

  // if(command === 'serve'){

  // }

  // if(command === 'build'){
  //   config.build = {
  //     outDir: path.join(__dirname, projectConfig.dist)
  //   }
  // }

  return config
})