import * as utils from "~/core/utils"

const config = {
	title: "",
	desc: "",
	imgUrl: "", // document.location.hostname 不带端口
	link: "",
	success: null, // 分享成功回调 init里面注入的回调任何一次分享都会执行
	cancel: null, // 分享取消回调
}

export default {
	// 微信初始化分享
	init(options) {
		Object.assign(config, options)

		if (!utils.isWechat(true)) return
		window.jssdk
			?.init({ debug: false })
			.then(() => {})
			.catch(() => {})
	},
	set(options = {}) {
		const fxData = {
			title: options.title || config.title,
			desc: options.desc || config.desc,
			imgUrl: options.imgUrl || config.imgUrl,
			link: options.link || config.link,
			success() {
				console.log("分享成功回调")
				options.success?.()
				config.success?.()
			},
			cancel() {
				console.log("分享取消回调")
				options.cancel?.()
				config.cancel?.()
			},
		}
		// 设置默认分享文案
		if (utils.isWechat()) {
			wx.ready(() => {
				window.jssdk?.share(fxData)
			})
		}
	},
}
