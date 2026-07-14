function browserDetect() {
    const obj = {
        agent: window.navigator.userAgent
    }
    obj.isWindowPhone = (obj.agent.indexOf('IEMobile') > -1) || (obj.agent.indexOf('Windows Phone') > -1)
    obj.isFirefox = (obj.agent.indexOf('Firefox') > -1)
    obj.isOpera = (window.opera != null)
    obj.isChrome = (obj.agent.indexOf('Chrome') > -1)  // NOTE that Chrome on Android returns true but is a completely different browser with different abilities
    obj.isIOS = (obj.agent.indexOf('iPod') > -1 || obj.agent.indexOf('iPhone') > -1 || obj.agent.indexOf('iPad') > -1) && !obj.isWindowPhone
    obj.isAndroid = (obj.agent.indexOf('Android') > -1) && !obj.isWindowPhone
    obj.isBlackberry = (obj.agent.indexOf('Blackberry') > -1)
    obj.isPc = /(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent) ? false : true
    obj.isPad = obj.agent.toLowerCase().indexOf('pad') > -1// 安卓pad 和 ios pad
    return obj
}

export default browserDetect
