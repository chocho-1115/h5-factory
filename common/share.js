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
	init(options = {}) {
		Object.keys(config).forEach(key => {
			if (Object.hasOwn(options, key)) {
				config[key] = options[key]
			}
		})
		if (!utils.isWechat(true)) return
		window.jssdk
			?.init({ debug: options.debug, appId: options.appId })
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
				// 微信下 success 和 callback都是设置分享成功
				// callback 先执行 success后执行 因为 wx.updateAppMessageShareData wx.updateTimelineShareData 内部是一个异步函数 
				// callback放在后面更符合设置分享的逻辑
				wx.updateAppMessageShareData(fxData); // 分享给朋友
        wx.updateTimelineShareData(fxData); // 分享到朋友圈
				callback && callback();
			})
		}
	},
}
