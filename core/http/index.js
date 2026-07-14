import { defaultsConfig, mergeConfig, dispatchRequest } from "./request"

// 拦截器构造函数
function InterceptorManager() {
	this.handlers = []
}
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
	this.handlers.push({
		fulfilled: fulfilled,
		rejected: rejected,
		synchronous: options ? options.synchronous : false,
		runWhen: options ? options.runWhen : null,
	})
	return this.handlers.length - 1
}

// 直接设置为null即可 无需剪切数组 这样每一项ID保持为项的数组索引不变，也避免了重新剪切拼接数组的性能损失。
InterceptorManager.prototype.eject = function eject(id) {
	if (this.handlers[id]) {
		this.handlers[id] = null
	}
}

function Http(config = {}) {
	// 强制使用new
	if (!(this instanceof Http)) {
		return new Http(config)
	}
	// 配置
	this.defaults = config
	// 拦截器
	this.interceptors = {
		request: new InterceptorManager(),
		response: new InterceptorManager(),
	}
}
Http.prototype.request = function (config = {}) {
	// 拦截器和请求组装队列
	const chain = [dispatchRequest.bind(this), undefined] // 必须成对出现的

	// 请求拦截
	this.interceptors.request.handlers.forEach((interceptor) => {
		chain.unshift(interceptor.fulfilled, interceptor.rejected)
	})

	// 响应拦截
	this.interceptors.response.handlers.forEach((interceptor) => {
		chain.push(interceptor.fulfilled, interceptor.rejected)
	})

	let promise = Promise.resolve(config)
	while (chain.length > 0) {
		promise = promise.then(chain.shift(), chain.shift())
	}
	return promise
}
// 添加请求方法
Array.prototype.forEach.call(["delete", "get", "head", "options"], (ele) => {
	Http.prototype[ele] = function (url, config) {
		return this.request(
			Object.assign(config || {}, {
				method: ele,
				url,
			}),
		)
	}
})
// 添加请求方法
Array.prototype.forEach.call(["post", "put", "patch"], (ele) => {
	Http.prototype[ele] = function (url, data, config) {
		return this.request(
			Object.assign(config || {}, {
				method: ele,
				url,
				data,
			}),
		)
	}
})

// /////// 生成导出对象
function createInstance(config) {
	// 实例化一个对象
	const context = new Http(config) // context.get（） context.post(), 但是不能当作函数使用 context() X
	// 创建请求函数
	const instance = Http.prototype.request.bind(context) // 等价 context.request(), 但是不能当作对象使用 属性和方法
	// 把Http.prototype对象的方法添加到instance函数对象上
	Object.keys(Http.prototype).forEach((key) => {
		instance[key] = Http.prototype[key].bind(context)
	})
	// 把Http实例属性添加到instance函数对象上
	Object.keys(context).forEach((key) => {
		instance[key] = context[key]
	})
	return instance
}

const http = createInstance(defaultsConfig)

// 构建新实例 这里只需要绑定在导出的http上 不需要绑定在用户创建的每个实例上
http.create = (config = {}) => {
	return createInstance(mergeConfig(http.defaults, config)) // http.defaults 是全局的默认配置
}

export default http
