function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_callback_${Date.now()}`
    const script = document.createElement('script')
    script.src = `${url+(url.indexOf('?')>=0?'&':'?')}callback=${callbackName}`
    script.onerror = reject
    document.body.appendChild(script)

    window[callbackName] = (data) => {
      resolve(data)
      document.body.removeChild(script)
      delete window[callbackName]
    }
  })
}

export default jsonp
