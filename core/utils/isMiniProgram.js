function isMiniProgram() {
	const ua = navigator.userAgent
	// 微信小程序webview（含桌面端） || 头条小程序webview
	return (/miniProgram/i.test(ua) && /micromessenger/i.test(ua)) || /toutiaomicroapp/i.test(ua)
}

export default isMiniProgram
