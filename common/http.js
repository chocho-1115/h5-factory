// 默认配置
let defaultsConfig = {
    data: null,
    params: null,
    baseURL: '',
    async: true,
    method: 'get',
    timeout: 5000,
    responseType: 'json',
    headers: {
        'content-type': 'application/x-www-form-urlencoded', // 简单请求 application/x-www-form-urlencoded、multipart/form-data 或 text/plain
        // "content-type": "application/json",
        // "If-Modified-Since": "0" //// HTTP的If-Modified-Since头标签与客户端缓存相互配合，可节约网络流量。
    }
}

const ERROR_INFO = {
    // 请求事件错误
    "REQUEST-EVENT-TIMEOUT": "Request Timeout: The request exceeded the timeout limit",
    "REQUEST-EVENT-ERROR": "Network Error: Failed to establish a connection",
    "REQUEST-EVENT-ABORT": "Request Aborted: The request was manually cancelled",
    // 请求前的代码验证错误/或程序错误
    "INVALID-URL": "Invalid URL: Expected a non-empty string",
}

// 配置合并
function mergeConfig(config1, config2){
    config1 = config1 || {}
    config2 = config2 || {}
    const headers = Object.assign({}, config1.headers, config2.headers)
    let config = Object.assign({}, config1, config2)
    config.headers = headers
    return config
}

function dispatchRequest(config){
    // 合并默认配置和传入的配置
    config = mergeConfig(this.defaults, config)
    const headers = config.headers
    let params = config.params
    let url = config.url

    config.method = config.method ? config.method.toUpperCase() : 'GET'

    const promise = new Promise(function (resolve, reject) {

        let isSettled = false
        // 请求发送之前出错了
        const sendBeforeError = function (code, message = ''){
            reject({
                code,
                message: ERROR_INFO[code] || message,
                status: client.status,
                config,
            })
        }
        // 请求发生之后 
        const onLoadendHandler = function () {
            if (this.readyState !== 4) return
            if(isSettled) return
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
                    request: client
                }
                if (client.response) res.response = response
                reject(res)
            }
        }
        // 请求发生之后 错误事件发生时
        const onErrorHandler = function (e) {    
            if(isSettled) return
            isSettled = true
            const code = `REQUEST-EVENT-${e.type.toUpperCase()}`
            const res = {
                code,
                message: ERROR_INFO[code],
                status: client.status,
                config,
                request: client
            }
            reject(res)
        }

        const client = new XMLHttpRequest()
        // 所有请求都可以通过url传递数据；只有post、put和patch请求可以发送body
        if (params) {
            let info = url.split('?')
            url = info[0]

            let urlParams = {}
            info[1] && info[1].replace(/([^=]+)=(\w+)/g, function(_, key, value) {
                urlParams[key] = value
            })

            params = Object.assign(urlParams, params)

            let str = ''
            for (let name in params) {
                str += name + '=' + params[name] + '&'
            }
            if(str.length > 0) str = str.substring(0, str.length - 1)
            url += url.indexOf('?')>-1 ? str : '?' + str
        }
        // 始终会调用 loadend 无论成功还是失败
        // readystatechange会触发多次，优先使用loadend
        client.addEventListener('onloadend' in client ? 'loadend' : 'readystatechange', onLoadendHandler)
        
        // 下面是三个互斥事件 
        // 超过 timeout 时间
        client.addEventListener('timeout', onErrorHandler)
        // 网络层错误
        client.addEventListener('error', onErrorHandler)
        // 调用 abort()
        client.addEventListener('abort', onErrorHandler)

        try {
            if (!url) {
                throw new Error("INVALID-URL"); // 后面的代码不执行
            }
            client.timeout = Math.max(2000, config.timeout)
            client.open(config.method, url.substring(0,4) == 'http' ? url : config.baseURL + url, config.async)
            client.responseType = config.responseType
            
            for (let name in headers) {
                client.setRequestHeader(name, headers[name])
            }

            client.send(config.data ? JSON.stringify(config.data) : null)

        } catch (err) {
            if(ERROR_INFO[err.message]) {
                sendBeforeError(err.message)
            }else{
                sendBeforeError(err.name, err.message)
            }
        }

    })
    return promise
}

// 拦截器构造函数
function InterceptorManager() {
    this.handlers = []
}
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
    this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
    })
    return this.handlers.length - 1
}

// 直接设置为null即可 无需剪切数组 这样每一项ID保持为项的数组索引不变，也避免了重新剪切拼接数组的性能损失。
InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
        this.handlers[id] = null
    }
}

function Http(config = {}){
    // 强制使用new
    if(!(this instanceof Http)){
        return new Http(config)
    }
    // 配置
    this.defaults = config
    // 拦截器
    this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    }
}
Http.prototype.request = function(config = {}){
    // 拦截器和请求组装队列
    let chain = [dispatchRequest.bind(this), undefined] // 必须成对出现的

    // 请求拦截
    this.interceptors.request.handlers.forEach(interceptor => {
        chain.unshift(interceptor.fulfilled, interceptor.rejected)
    })

    // 响应拦截
    this.interceptors.response.handlers.forEach(interceptor => {
        chain.push(interceptor.fulfilled, interceptor.rejected)
    })

    let promise = Promise.resolve(config)
    while(chain.length > 0) {
        promise = promise.then(chain.shift(), chain.shift())
    }
    return promise
}
// 添加请求方法
Array.prototype.forEach.call([
    'delete', 'get', 'head', 'options'
], ele => {
    Http.prototype[ele] = function(url, config) {
        return this.request(Object.assign(config || {}, {
            method: ele,
            url,
        }))
    }
})
// 添加请求方法
Array.prototype.forEach.call([
    'post', 'put', 'patch'
], ele => {
    Http.prototype[ele] = function(url, data, config) {
        return this.request(Object.assign(config || {}, {
            method: ele,
            url,
            data
        }))
    }
})

// /////// 生成导出对象
function createInstance(config) {
    // 实例化一个对象
    let context = new Http(config) // context.get（） context.post(), 但是不能当作函数使用 context() X
    // 创建请求函数
    let instance = Http.prototype.request.bind(context)// 等价 context.request(), 但是不能当作对象使用 属性和方法
    // 把Http.prototype对象的方法添加到instance函数对象上
    Object.keys(Http.prototype).forEach(key => {
        instance[key] = Http.prototype[key].bind(context)
    })
    // 把Http实例属性添加到instance函数对象上
    Object.keys(context).forEach(key => {
        instance[key] = context[key]
    })
    return instance
}

let http = createInstance(defaultsConfig)

// 构建新实例 这里只需要绑定在导出的http上 不需要绑定在用户创建的每个实例上
http.create = function(config = {}){
    return createInstance(mergeConfig(http.defaults, config)) // http.defaults 是全局的默认配置
}

export default http