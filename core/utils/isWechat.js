// 是否为微信环境
function isWechat(includePc) {
    let isWechat = navigator.userAgent.match(/MicroMessenger/i)
    if (!includePc && navigator.userAgent.match(/(WindowsWechat|MacWechat)/i)) isWechat = false
    return !!isWechat
}

export default isWechat
