export function isAndroid () {
    return navigator.userAgent.match(/(Android)/i)
}

export default {
  isAndroid,
}
