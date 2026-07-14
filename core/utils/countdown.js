/*
 * @desc 倒计时
 * @param {number} endTime 结束时的时间戳
 * @param {object} opt
 */
function countdown(endTime, opt) {
	opt.framerate = opt.framerate || 1
	opt.nowTime = opt.nowTime || Date.now()
	const res = {
		death: false,
		day: 0,
		hour: 0,
		minute: 0,
		second: 0,
		millisecond: 0,
	}
	let sys_millisecond = endTime - opt.nowTime
	const sys_millisecond_speed = 1000 / opt.framerate
	function anim() {
		if (sys_millisecond < sys_millisecond_speed) {
			clearInterval(timer)
			res.death = true //
			res.day = 0 // 计算天
			res.hour = 0 // 计算小时
			res.minute = 0 // 计算分钟
			res.second = 0 // 计算秒杀
			res.millisecond = 0
			if (opt.onUpdate) opt.onUpdate(res)
			if (opt.onComplete) opt.onComplete(res)
		} else {
			res.day = Math.floor(sys_millisecond / 1000 / 3600 / 24)
			res.hour = Math.floor((sys_millisecond / 1000 / 3600) % 24)
			res.minute = Math.floor((sys_millisecond / 1000 / 60) % 60)
			res.second = Math.floor((sys_millisecond / 1000) % 60)
			res.millisecond = Math.floor(sys_millisecond % 1000)
			sys_millisecond -= sys_millisecond_speed
			if (opt.onUpdate) opt.onUpdate(res)
		}
	}
	const timer = setInterval(anim, sys_millisecond_speed)
	anim()
	return timer
}

export default countdown
