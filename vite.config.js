import path from "node:path"
import {
	defineConfig,
	// loadEnv
} from "vite"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"

import projectConfig from "./.node/project.js"
import dataSrcPlugin from "./.node/vite-plugin-data-src.js"

export default defineConfig(({ _command, _mode }) => {
	const config = {
		root: projectConfig.src,
		// publicDir: path.join(import.meta.dirname, '/public'),
		resolve: {
			alias: {
				// '@': fileURLToPath(new URL('./src', import.meta.url))

				"~": path.join(import.meta.dirname, "/"),
				"@": path.join(import.meta.dirname, projectConfig.src),
			},
		},
		build: {
			emptyOutDir: true, // 每次打包都会清空项目目录
			assetsInlineLimit: 0, // 默认 4096,
			outDir: path.join(import.meta.dirname, projectConfig.dist),
		},
		plugins: [
			dataSrcPlugin(),
			// 不支持转换为webp 直接放oss上 调取相应格式的图片即可
			ViteImageOptimizer({
				includePublic: false, // 不处理public目录，默认值是 true
				png: { quality: 80 },
				jpg: { quality: 80 },
				jpeg: { quality: 80 },
				webp: { lossless: true, quality: 80 },
			}),
		],
		server: {
			allowedHosts: ["indent.top"],
			host: "0.0.0.0",
			port: 80,
			open: false,
			proxy: {
				"/dev-api": {
					target: `http://www.indent.top`,
					changeOrigin: true,
					headers: { Origin: "https://www.indent.top" },
					rewrite: (path) => {
						const reg = new RegExp("^" + "/dev-api")
						return path.replace(reg, "/api")
					},
				},
				"/lacal-api": {
					target: `http://127.0.0.1:10000`,
					changeOrigin: true,
					rewrite: (path) => {
						const reg = new RegExp("^" + "/lacal-api")
						return path.replace(reg, "")
					},
				},
			},
		},
	}
	return config
})
