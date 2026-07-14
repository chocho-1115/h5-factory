// AxiosError.ERR_BAD_OPTION_VALUE = 'ERR_BAD_OPTION_VALUE';
// AxiosError.ERR_BAD_OPTION = 'ERR_BAD_OPTION';
// AxiosError.ECONNABORTED = 'ECONNABORTED';
// AxiosError.ETIMEDOUT = 'ETIMEDOUT';
// AxiosError.ECONNREFUSED = 'ECONNREFUSED';
// AxiosError.ERR_NETWORK = 'ERR_NETWORK';
// AxiosError.ERR_FR_TOO_MANY_REDIRECTS = 'ERR_FR_TOO_MANY_REDIRECTS';
// AxiosError.ERR_DEPRECATED = 'ERR_DEPRECATED';
// AxiosError.ERR_BAD_RESPONSE = 'ERR_BAD_RESPONSE';
// AxiosError.ERR_BAD_REQUEST = 'ERR_BAD_REQUEST';
// AxiosError.ERR_CANCELED = 'ERR_CANCELED';
// AxiosError.ERR_NOT_SUPPORT = 'ERR_NOT_SUPPORT';
// AxiosError.ERR_INVALID_URL = 'ERR_INVALID_URL';
// AxiosError.ERR_FORM_DATA_DEPTH_EXCEEDED = 'ERR_FORM_DATA_DEPTH_EXCEEDED';

const ERROR_INFO = {
	// 请求事件错误
	"REQUEST-EVENT-TIMEOUT":
		"Request Timeout: The request exceeded the timeout limit",
	"REQUEST-EVENT-ERROR": "Network Error: Failed to establish a connection",
	"REQUEST-EVENT-ABORT": "Request Aborted: The request was manually cancelled",
	// 请求前的代码验证错误/或程序错误
	"INVALID-URL": "Invalid URL: Expected a non-empty string",
}

// 默认配置
export const defaultsConfig = {
	data: null,
	params: null,
	baseURL: "",
	async: true,
	method: "get",
	timeout: 5000,
	responseType: "json",
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
		// 请求发送之前出错了
		const sendBeforeError = (code, message = "") => {
			reject({
				code,
				message: ERROR_INFO[code] || message,
				status: client.status,
				config,
			})
		}
		// 请求发生之后
		const onLoadendHandler = () => {
			if (this.readyState !== 4) return
			if (isSettled) return
			isSettled = true
			const response = {
				data: client.response,
				status: client.status,
				statusText: client.statusText,
				config,
				request: client,
				// headers,
			}
			if (client.status >= 200 && client.status < 300) {
				resolve(response)
			} else {
				const res = {
					code: client.status,
					message: client.statusText,
					status: client.status,
					config,
					request: client,
				}
				if (client.response) res.response = response
				reject(res)
			}
		}
		// 请求发生之后 错误事件发生时
		const onErrorHandler = (e) => {
			if (isSettled) return
			isSettled = true
			const code = `REQUEST-EVENT-${e.type.toUpperCase()}`
			const res = {
				code,
				message: ERROR_INFO[code],
				status: client.status,
				config,
				request: client,
			}
			reject(res)
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
				throw new Error("INVALID-URL") // 后面的代码不执行
			}
			client.timeout = Math.max(2000, config.timeout)
			client.open(
				config.method,
				url.substring(0, 4) === "http" ? url : config.baseURL + url,
				config.async,
			)
			client.responseType = config.responseType

			for (const name in headers) {
				client.setRequestHeader(name, headers[name])
			}

			client.send(config.data ? JSON.stringify(config.data) : null)
		} catch (err) {
			if (ERROR_INFO[err.message]) {
				sendBeforeError(err.message)
			} else {
				sendBeforeError(err.name, err.message)
			}
		}
	})
	return promise
}
