import fs from "node:fs"
import path from "node:path"

/**
 * 递归扫描指定目录下所有 .html 文件，返回它们的绝对路径。
 *
 * 为什么需要这个函数：
 *   插件需要在 buildStart 阶段拿到所有 HTML 文件，
 *   才能逐一扫描其中的 data-src 属性，提取图片路径 → emit 为独立 asset。
 *
 * @param {string} dir - 要扫描的目录（绝对路径）
 * @returns {string[]} 该目录下所有 .html 文件的绝对路径数组
 */
function findHtmlFiles(dir) {
	// 存放扫描结果的数组
	const files = []

	// withFileTypes: true → 让 readdirSync 返回 fs.Dirent 对象
	// 可以直接调用 .isDirectory() / .isFile() 判断类型，
	// 比后续再对每个条目调用 fs.statSync 更高效
	const entries = fs.readdirSync(dir, { withFileTypes: true })

	// 遍历当前目录下的每个条目
	for (const entry of entries) {
		// 将父目录路径与当前条目名拼接，得到完整绝对路径
		const fullPath = path.join(dir, entry.name)

		if (entry.isDirectory()) {
			// --- 当前条目是目录 → 递归深入 ---
			// 跳过隐藏目录（以 . 开头，如 .git、.svn）和 node_modules，
			// 因为这些目录里不会有项目自身的 HTML 入口文件
			if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
				// 把子目录中找到的 .html 文件合并到当前结果数组中
				files.push(...findHtmlFiles(fullPath))
			}
		} else if (entry.isFile() && entry.name.endsWith(".html")) {
			// --- 当前条目是 .html 文件 → 收集 ---
			// 只处理 .html 后缀，不处理 .htm，与项目规范保持一致
			files.push(fullPath)
		}
		// 符号链接、设备文件等其他类型直接忽略，不进入任何分支
	}

	return files
}
/**
 * 创建 Vite 插件：识别 HTML 中 data-src 属性引用的图片，
 * 将图片加入 Rollup 构建图（附带内容 hash），并在产物 HTML 中自动替换路径。
 *
 * 工作流程：
 *   ① configResolved → 获取 Vite 的根目录
 *   ② buildStart    → 递归扫描所有 HTML，提取 data-src 路径，emit 为 asset
 *   ③ generateBundle → 在 HTML bundle 中把原始 data-src 值替换为 hash 路径
 *
 * 为什么需要这个插件：
 *   data-src 是自定义属性，Vite / Rollup 默认不认识它。
 *   如果不做处理，这些图片就不会进入模块依赖图，
 *   导致构建产物里没有内容 hash、无法利用强缓存、
 *   并且图片变更时不会触发增量构建。
 *
 * @returns {import('vite').Plugin} Vite 插件对象
 */
const dataSrcImagesPlugin = () => {
	// --- 闭包变量，在插件各钩子之间共享 ---

	// Vite 项目根目录（由 configResolved 从 resolved config 中获取）
	let root = process.cwd()

	// 记录每个 HTML 文件中引用了哪些 data-src 图片，
	// 以便 generateBundle 阶段能逐一替换路径。
	// 结构：Map<html绝对路径, { raw, query, refId }[]>
	const htmlImageRefs = new Map()

	return {
		// ---------- 插件元信息 ----------

		// 插件名称，用于调试和错误堆栈
		name: "vite-plugin-data-src-images",

		apply: "build",

		// enforce: 'post' 表示该插件在其他所有插件之后执行，
		// 确保 Vite 内置的 HTML / asset 处理先完成，我们再接手
		enforce: "post",

		// ---------- configResolved 钩子 ----------

		// 在 Vite 配置完全解析后调用，
		// 此时可以获取到最终合并后的配置对象（含默认值）
		configResolved(config) {
			// config.root 是 Vite 最终确定的项目根目录，
			// 可能不同于 process.cwd()（因为配置中可以通过 root 选项修改）
			root = config.root
		},

		// ---------- buildStart 钩子 ----------

		// 构建开始时调用。
		// 此时模块图尚未建立，适合做文件扫描和预发射 asset 的操作。
		buildStart() {
			// 绝对路径 → Rollup asset 引用 ID
			// 用于去重：同一张图片被多个 HTML（或同一 HTML 多次）引用时，
			// 只调用一次 emitFile，所有引用指向同一个 refId
			const absPathToRef = new Map()

			// 递归扫描 root 下所有 .html 文件
			const htmlFiles = findHtmlFiles(root)

			// 逐个处理每个 HTML 文件
			for (const htmlFile of htmlFiles) {
				// 读取 HTML 源码
				const content = fs.readFileSync(htmlFile, "utf-8")
				// HTML 文件所在目录，用于后续解析相对路径为绝对路径
				const htmlDir = path.dirname(htmlFile)

				// 正则匹配所有 data-src="xxx" 或 data-src='xxx'
				// 捕获组 ([^"']+?) 非贪婪匹配属性值，不跨引号
				const regex = /data-src=["']([^"']+?)["']/g

				let match = regex.exec(content)
				// 当前 HTML 文件中所有 data-src 引用的信息列表
				const refs = []

				// 存入 Map，供 generateBundle 阶段使用
				htmlImageRefs.set(htmlFile, refs)

				// 循环匹配当前 HTML 中所有 data-src 属性
				while (match !== null) {
					// match[0] = 完整匹配字符串
					// match[1] = 捕获组：data-src 的属性值
					const raw = match[1].trim()
					if (!raw) continue // 空属性值跳过

					// --- 处理路径中的额外参数 ---
					// 实际项目中 data-src 可能带有查询参数，如：
					//   data-src="image/bg.jpg?as=webp"
					// 这里的 ?as=webp 是运行时使用的格式协商参数，
					// 构建时应该忽略它来定位文件，但替换时需要保留。
					const [pathPart, queryString] = raw.split("?")

					// 同时去除 hash 片段（虽然 HTML 中很少出现）
					// 如 data-src="image/bg.jpg#fragment"
					const cleanPath = pathPart.split("#")[0]
					if (!cleanPath) continue // 去除参数后路径为空则跳过

					// 将 data-src 中的相对路径解析为绝对路径
					// 基准目录是 HTML 文件所在目录，而非当前工作目录
					// 例如：HTML 在 /root/p1/index.html，
					//       data-src="image/bg.jpg"
					//       → resolved = /root/p1/image/bg.jpg
					const resolved = path.resolve(htmlDir, cleanPath)

					// 检查文件是否真实存在于磁盘
					// 不存在时跳过（可能是外部 URL 或后续补充的文件）
					if (!fs.existsSync(resolved)) continue

					// --- 发射 asset ---
					// 检查该图片是否已被其他 HTML 发射过
					let refId = absPathToRef.get(resolved)
					if (!refId) {
						// emitFile 将图片数据注册到 Rollup 的 asset 列表中，
						// Rollup 会为其自动生成带内容 hash 的文件名。
						// 不指定 fileName，让 Rollup 自动生成 assets/xxx-[hash].[ext]
						refId = this.emitFile({
							type: "asset", // 声明为静态资源（非 JS chunk）
							name: path.basename(cleanPath), // 保留原始文件名，仅供 Rollup 参考
							source: fs.readFileSync(resolved), // 图片二进制数据
						})
						absPathToRef.set(resolved, refId)
					}

					// 记录该 data-src 引用信息，用于后续替换
					refs.push({
						raw, // 原始 data-src 值（如 "image/bg.jpg?as=webp"）
						query: queryString ? `?${queryString}` : "", // 保留查询参数
						refId, // Rollup asset 引用 ID，用于获取 hash 后路径
					})

					match = regex.exec(content)
				}
			}
		},

		// ---------- generateBundle 钩子 ----------

		// 在 Rollup 生成完所有 bundle 但尚未写入磁盘时调用。
		// 此时 bundle 对象包含了所有即将输出的 chunk 和 asset，
		// 我们可以在这里直接修改 bundle 内容。
		generateBundle(_options, bundle) {
			// 遍历之前记录的所有 HTML 文件
			for (const [htmlFile, refs] of htmlImageRefs) {
				// 将 HTML 绝对路径转为相对于 root 的路径
				// 因为 bundle 中的 key 是相对于 root 的路径
				const htmlRelPath = path.relative(root, htmlFile)

				// 从 bundle 中取出对应的 HTML chunk
				const chunk = bundle[htmlRelPath]
				if (!chunk || chunk.type !== "asset") continue
				// chunk.type !== 'asset' 的情况理论上不会出现，
				// 因为 HTML 是作为 asset 处理的，但做防御性检查

				// 读取 chunk 源码。
				// chunk.source 可能是字符串或 Buffer/Uint8Array，
				// 取决于文件大小和 Vite 内部处理方式。
				let source =
					typeof chunk.source === "string"
						? chunk.source
						: new TextDecoder().decode(chunk.source)

				// --- 替换 data-src 值为 hash 路径 ---
				for (const { raw, query, refId } of refs) {
					// getFileName(refId) 返回 Rollup 自动生成的 hash 后路径
					// 例如：assets/bg-a1b2c3d4.jpg
					const hashPath = this.getFileName(refId)

					// 替换 HTML 中所有出现该原始 data-src 值的位置
					// 拼接上保留的查询参数，如 ?as=webp
					// 替换后效果：
					//   data-src="image/bg.jpg?as=webp"
					//   → data-src="assets/bg-a1b2c3d4.jpg?as=webp"
					source = source.replaceAll(raw, hashPath + query)
				}

				// 将修改后的源码写回 chunk
				chunk.source = source
			}
		},
	}
}
export default dataSrcImagesPlugin
