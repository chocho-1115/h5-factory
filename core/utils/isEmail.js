// 是否为邮箱
function isEmail(str) {
    if (str === null || str === '') return false
    const result = /^([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
    if (result.test(str)) {
        return true
    } else {
        return false
    }
}

export default isEmail
