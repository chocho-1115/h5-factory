export function isIos () {
    return navigator.userAgent.match(/(iOS|iPhone|iPad)/i)
}

export default {
  isIos,
}
