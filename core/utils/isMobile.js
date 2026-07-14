// 是否为手机号码
function isMobile(str) {
    if (str === null || str === '') return false
    // let result=str.match(/^((\(\d{2,3}\))|(\d{3}\-))?((13\d{9})|(15\d{9})|(18\d{9}))$/);
    const result = str.match(/^1[3|4|5|6|7|8|9][0-9]\d{8}$/)
    if (result === null) return false
    return true
}

export default isMobile
