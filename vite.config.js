import path from 'path'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

import {
  defineConfig,
  loadEnv
} from 'vite'

import projectConfig from './.node/project.js'
import dataSrcPlugin from './.node/vite-plugin-data-src.js'

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

        '~': path.join(__dirname, '/'),
        '@': path.join(__dirname, projectConfig.src),
      },
    },
    server: {
      open: false,
    },
    build: {
      emptyOutDir: true, // 每次打包都会清空项目目录
      assetsInlineLimit: 0, // 默认 4096,
      outDir: path.join(__dirname, projectConfig.dist)
    },
    plugins: [
      dataSrcPlugin(),
      // 不支持转换为webp 直接放oss上 调取相应格式的图片即可
      ViteImageOptimizer({
        includePublic: false, // 不处理public目录，默认值是 true
        png: { quality: 80 },
        jpg: { quality: 80 }, 
        jpeg: { quality: 80 },
        webp : { lossless : true, quality : 80 },
      }),
    ],
  }
  return config

})