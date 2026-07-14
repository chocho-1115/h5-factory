// 是否有上一页
function isPreviousPage() {
	if (window.history.length === 1) return false
	const state = window.history.state
	if (state && state.back === null && state.position === 0) {
		return false
	}
	return true
}

export default isPreviousPage
