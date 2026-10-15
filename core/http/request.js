import { ERROR_CODE, HttpError } from "./error.js"

// 默认配置
export const defaultsConfig = {
	data: null,
	params: null,
	baseURL: "",
	async: true,
	method: "get",
	timeout: 5000,
	// 不设 responseType，对齐 axios 默认行为：
	// 不设时浏览器处于文本模式，body 能完整读到 responseText，JSON 解析交给我们自己做。
	// 不能用 'json'：浏览器遇非 JSON（如后端 http.Error 返回的纯文本）会把 response 置为 null，错误信息就丢了
	// responseType: "json",
	headers: {
		"content-type": "application/x-www-form-urlencoded", // 简单请求 application/x-www-form-urlencoded、multipart/form-data 或 text/plain
		// "content-type": "application/json",
		// "If-Modified-Since": "0" //// HTTP的If-Modified-Since头标签与客户端缓存相互配合，可节约网络流量。
	},
}

// 配置合并
export function mergeConfig(config1, config2) {
	config1 = config1 || {}
	config2 = config2 || {}
	const headers = Object.assign({}, config1.headers, config2.headers)
	const config = Object.assign({}, config1, config2)
	config.headers = headers
	return config
}

export function dispatchRequest(config) {
	// 合并默认配置和传入的配置
	config = mergeConfig(this.defaults, config)
	const headers = config.headers
	let params = config.params
	let url = config.url

	config.method = config.method ? config.method.toUpperCase() : "GET"

	const promise = new Promise((resolve, reject) => {
		let isSettled = false

		const onLoadendHandler = () => {
			if (client.readyState !== 4) return
			if (isSettled) return
			isSettled = true

			// 对齐 axios 的 XHR 适配器：
			// 未设(none)/text/json 用 responseText 读文本；blob/arraybuffer 等才读 response
			const responseType = config.responseType
			let data =
				!responseType || responseType === "text" || responseType === "json"
					? client.responseText
					: client.response

			// 对齐 axios 的 transformResponse：
			// 仅当“未设 responseType”或“声明为 json”时才尝试解析；失败保留原字符串
			// 这样正常 JSON 得到对象，后端返回的纯文本也能原样保留在 data 里
			if (
				data &&
				typeof data === "string" &&
				(!responseType || responseType === "json")
			) {
				try {
					data = JSON.parse(data)
				} catch (_e) {
					// body 不是 JSON（如 "id不能为空."），保留纯文本
				}
			}

			const response = {
				data,
				status: client.status,
				statusText: client.statusText,
				config,
				request: client,
				// headers,
			}

			// 已知边界：load 时 status 为 0 表示“非 HTTP 成功”（如 file://、data:），axios 会判成功，此处判为失败。
			// 本 http 只用于 http(s)，本地文件请改用 fetch；
			// status 为 0 的网络类失败已由 error/timeout/abort 事件覆盖。
			if (client.status >= 200 && client.status < 300) {
				resolve(response)
			} else {
				reject(HttpError.fromResponse(client.status, config, client, response))
			}
		}
		// 请求发生之后 错误事件发生时
		const onErrorHandler = (e) => {
			if (isSettled) return
			isSettled = true
			reject(HttpError.fromRequestEvent(e.type, config, client))
		}

		const client = new XMLHttpRequest()
		// 所有请求都可以通过url传递数据；只有post、put和patch请求可以发送body
		if (params) {
			const info = url.split("?")
			url = info[0]

			const urlParams = {}
			info[1]?.replace(/([^=]+)=(\w+)/g, (_, key, value) => {
				urlParams[key] = value
			})

			params = Object.assign(urlParams, params)

			let str = ""
			for (const name in params) {
				str += `${name}=${params[name]}&`
			}
			if (str.length > 0) str = str.substring(0, str.length - 1)
			url += url.indexOf("?") > -1 ? str : `?${str}`
		}
		// 始终会调用 loadend 无论成功还是失败
		// readystatechange会触发多次，优先使用loadend
		client.addEventListener(
			"onloadend" in client ? "loadend" : "readystatechange",
			onLoadendHandler,
		)

		// 下面是三个互斥事件
		// 超过 timeout 时间
		client.addEventListener("timeout", onErrorHandler)
		// 网络层错误
		client.addEventListener("error", onErrorHandler)
		// 调用 abort()
		client.addEventListener("abort", onErrorHandler)

		try {
			if (!url) {
				throw new Error(ERROR_CODE.ERR_INVALID_URL) // 后面的代码不执行
			}
			client.timeout = Math.max(2000, config.timeout)
			client.open(
				config.method,
				url.substring(0, 4) === "http" ? url : config.baseURL + url,
				config.async,
			)
			// 对齐 axios：只有非空且不是 'json' 时才真正设给 xhr
			// 'json' 交给自己解析，避免解析失败时 response 变 null；
			// 另外设了非文本类型后访问 responseText 会抛 InvalidStateError，所以 'json' 不能设
			if (config.responseType && config.responseType !== "json") {
				client.responseType = config.responseType
			}

			for (const name in headers) {
				client.setRequestHeader(name, headers[name])
			}

			client.send(config.data ? JSON.stringify(config.data) : null)
		} catch (err) {
			reject(HttpError.beforeRequest(err, config))
		}
	})
	return promise
}
