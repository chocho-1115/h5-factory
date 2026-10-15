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

// 只管理「非网络返回错误」：传输层错误 + 请求前的程序/配置错误
const ERROR_INFO = {
  // 请求事件错误
	ECONNABORTED: "Request Timeout: The request exceeded the timeout limit",
	ERR_NETWORK: "Network Error: Failed to establish a connection",
	ERR_CANCELED: "Request Aborted: The request was manually cancelled",
  // 请求前的代码验证错误/或程序错误
	ERR_INVALID_URL: "Invalid URL: Expected a non-empty string",
}

export const ERROR_CODE = Object.freeze({
  
	ECONNABORTED: "ECONNABORTED",
	ERR_NETWORK: "ERR_NETWORK",
	ERR_CANCELED: "ERR_CANCELED",

	ERR_INVALID_URL: "ERR_INVALID_URL",

	ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
	ERR_BAD_RESPONSE: "ERR_BAD_RESPONSE",
})

// XHR 事件名 错误码
const EVENT_ERROR_CODE = {
	timeout: ERROR_CODE.ECONNABORTED,
	error: ERROR_CODE.ERR_NETWORK,
	abort: ERROR_CODE.ERR_CANCELED,
}


export class HttpError extends Error {

  // 对齐 axios：有才挂 错误拦截时 可如下注释代码来判断请求状况
  // if (error.response) {
  //     // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
  // } else if (error.request) {
  //     // 请求已经成功发起，但没有收到响应
  // } else {
  //     // 发送请求前出了点问题
  // }
  
	constructor(message, code, config, request, response) {

		super(message)
		
    // 普通类的实例没有 name
    // 但 Error 这个内置类特例：它在原型上定义了 name（默认 "Error"，不可枚举），所以：
    // new Error("x").name  // "Error"（继承自 Error.prototype）
    // HttpError extends Error 就继承了这个 name。你在构造函数里写 this.name = "HttpError"，是做覆盖，让实例显示成 HttpError。
		this.name = "HttpError" 

    this.code = code
		this.config = config
    // this.isHttpError = true // 预留
		if (request) this.request = request
		if (response) {
			this.response = response
			// this.status = response.status
		}
	}

	// 场景一：请求发出前的错误（空 url / 配置 / setRequestHeader 等同步抛错）
	// 结果：只有 config，无 request、无 response
  static beforeRequest(error, config) {
		const code = ERROR_INFO[error.message] ? error.message : error.name
		const message = ERROR_INFO[code] || error.message
		return new HttpError(message, code, config)
	}

	// 场景二：已发出但没收到响应（超时 / 网络中断 / 主动取消）
	// 结果：有 request，无 response（eventType 即 XHR 事件名 timeout|error|abort）
	static fromRequestEvent(eventType, config, request) {
		const code = EVENT_ERROR_CODE[eventType] || eventType.toUpperCase()
		const message = ERROR_INFO[code] || eventType
		return new HttpError(message, code, config, request)
	}

	// 场景三：服务器返回非 2xx（4xx/5xx）
	// 结果：有 request + response + （status暂时注释掉了）；code 按 axios 规则现算，不查 ERROR_INFO
	static fromResponse(status, config, request, response) {
		// 对齐 axios 源码：status/100 取百位再减 4，4xx→ERR_BAD_REQUEST，5xx→ERR_BAD_RESPONSE
		const code = [ERROR_CODE.ERR_BAD_REQUEST, ERROR_CODE.ERR_BAD_RESPONSE][
			Math.floor(status / 100) - 4
		]
		return new HttpError(
			`Request failed with status code ${status}`,
			code,
			config,
			request,
			response,
		)
	}
}