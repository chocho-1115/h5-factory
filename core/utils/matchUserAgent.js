// 且 `(?=.*CPU)(?=.*iPad)`
function matchUserAgent(str) {
    const reg = new RegExp(str)
    return reg.test(navigator.userAgent)
}

export default matchUserAgent
