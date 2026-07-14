// 函数防抖 多次触发只执行最后一次  此函数不执行第一次触发
function debounce (method, delay){
    let timeout
    return function (...args) {
        const context = this // 保存this指向
        clearTimeout(timeout)
        timeout = setTimeout(()=>{
            method.apply(context, args)
        }, delay)
    }
}

export default debounce
