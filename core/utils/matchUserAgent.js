// 且 `(?=.*CPU)(?=.*iPad)`
function matchUserAgent(pattern, attribute = "i") {
	const reg = new RegExp(pattern, attribute)
	return reg.test(navigator.userAgent)
}

export default matchUserAgent
