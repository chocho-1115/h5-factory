const utils = {
	// window.onload
	whenWindowLoad(func) {
		const oldonload = window.onload
		if (typeof window.onload !== "function") {
			window.onload = func
		} else {
			window.onload = () => {
				oldonload()
				func()
			}
		}
	},
	// jq的document.ready
	whenDomReady: (() => {
		let funcs = []
		let ready = false // 当触发事件处理程序时,切换为true

		// 当文档就绪时,调用事件处理程序
		function handler(e) {
			if (ready) return // 确保事件处理程序只完整运行一次

			// 如果发生onreadystatechange事件，但其状态不是complete的话,那么文档尚未准备好
			if (
				e.type === "onreadystatechange" &&
				document.readyState !== "complete"
			) {
				return
			}

			// 运行所有注册函数
			// 注意每次都要计算funcs.length
			// 以防这些函数的调用可能会导致注册更多的函数
			for (let i = 0; i < funcs.length; i++) {
				funcs[i].call(document)
			}
			// 事件处理函数完整执行,切换ready状态, 并移除所有函数
			ready = true
			funcs = null
		}
		// 为接收到的任何事件注册处理程序
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", handler, false)
			document.addEventListener("readystatechange", handler, false) // IE9+
			window.addEventListener("load", handler, false)
		} else if (document.attachEvent) {
			document.attachEvent("onreadystatechange", handler)
			window.attachEvent("onload", handler)
		}
		// 返回whenDomReady()函数
		return (fn) => {
			if (ready) {
				fn.call(document)
			} else {
				funcs.push(fn)
			}
		}
	})(),
	// 固定宽度适配时高度不够
	setViewportMinHeight(minH, callback) {
		const metaEle = document.getElementById("viewEle")
		if (!metaEle) return
		const winW = document.documentElement.clientWidth
		const winH = document.documentElement.clientHeight
		if (minH && winH < minH) {
			const w = (minH * winW) / winH
			document
				.getElementById("viewEle")
				.setAttribute(
					"content",
					`width=${w}, user-scalable=no,target-densitydpi = device-dpi`,
				)
		}
		callback?.()
	},

	// 获取浏览器前缀
	getBrowserPrefix() {
		/*
		获取浏览器前缀：
			文档模式为 [ie8- 和 [Opera12.16- prefix 将返回null；
			(Opera12.16+ 内核改为谷歌内核 将返回 webkit 前缀；
			不过这些浏览器没有必要获取浏览器前缀了 浏览器前缀主要用于css3 而这些老古董浏览器不支持大部分的css3；
		*/
		if (window.opera || !window.getComputedStyle) return null
		const styles = window.getComputedStyle(document.documentElement, ""),
			pre = (Array.prototype.slice
				.call(styles)
				.join("")
				.match(/-(moz|webkit|ms)-/) ||
				(styles.OLink === "" && ["", "o"]))[1],
			dom = "WebKit|Moz|MS|O".match(new RegExp(`(${pre})`, "i"))[1]
		return {
			dom: dom,
			lowercase: pre,
			css: `-${pre}-`,
			js: pre[0].toUpperCase() + pre.substring(1),
		}
	},

	// 获取农历日期
	getLunarDay(solarYear, solarMonth, solarDay) {
		solarMonth = parseInt(solarMonth, 10) > 0 ? solarMonth - 1 : 11
		const madd = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
		const tgString = "甲乙丙丁戊己庚辛壬癸"
		const dzString = "子丑寅卯辰巳午未申酉戌亥"
		const numString = "一二三四五六七八九十"
		const monString = "正二三四五六七八九十冬腊"
		// let weekString = "日一二三四五六";
		const sx = "鼠牛虎兔龙蛇马羊猴鸡狗猪"
		let cYear, cMonth, cDay, TheDate
		const CalendarData = [
			0xa4b, 0x5164b, 0x6a5, 0x6d4, 0x415b5, 0x2b6, 0x957, 0x2092f, 0x497,
			0x60c96, 0xd4a, 0xea5, 0x50da9, 0x5ad, 0x2b6, 0x3126e, 0x92e, 0x7192d,
			0xc95, 0xd4a, 0x61b4a, 0xb55, 0x56a, 0x4155b, 0x25d, 0x92d, 0x2192b,
			0xa95, 0x71695, 0x6ca, 0xb55, 0x50ab5, 0x4da, 0xa5b, 0x30a57, 0x52b,
			0x8152a, 0xe95, 0x6aa, 0x615aa, 0xab5, 0x4b6, 0x414ae, 0xa57, 0x526,
			0x31d26, 0xd95, 0x70b55, 0x56a, 0x96d, 0x5095d, 0x4ad, 0xa4d, 0x41a4d,
			0xd25, 0x81aa5, 0xb54, 0xb6a, 0x612da, 0x95b, 0x49b, 0x41497, 0xa4b,
			0xa164b, 0x6a5, 0x6d4, 0x615b4, 0xab6, 0x957, 0x5092f, 0x497, 0x64b,
			0x30d4a, 0xea5, 0x80d65, 0x5ac, 0xab6, 0x5126d, 0x92e, 0xc96, 0x41a95,
			0xd4a, 0xda5, 0x20b55, 0x56a, 0x7155b, 0x25d, 0x92d, 0x5192b, 0xa95,
			0xb4a, 0x416aa, 0xad5, 0x90ab5, 0x4ba, 0xa5b, 0x60a57, 0x52b, 0xa93,
			0x40e95,
		]

		function GetBit(m, n) {
			return (m >> n) & 1
		}
		function e2c(...args) {
			TheDate =
				args.length !== 3 ? new Date() : new Date(args[0], args[1], args[2])
			let total, m, n, k
			let isEnd = false
			let tmp = TheDate.getYear()
			if (tmp < 1900) {
				tmp += 1900
			}
			total =
				(tmp - 1921) * 365 +
				Math.floor((tmp - 1921) / 4) +
				madd[TheDate.getMonth()] +
				TheDate.getDate() -
				38

			if (TheDate.getYear() % 4 === 0 && TheDate.getMonth() > 1) {
				total++
			}
			for (m = 0; ; m++) {
				k = CalendarData[m] < 0xfff ? 11 : 12
				for (n = k; n >= 0; n--) {
					if (total <= 29 + GetBit(CalendarData[m], n)) {
						isEnd = true
						break
					}
					total = total - 29 - GetBit(CalendarData[m], n)
				}
				if (isEnd) break
			}
			cYear = 1921 + m
			cMonth = k - n + 1
			cDay = total
			if (k === 12) {
				if (cMonth === Math.floor(CalendarData[m] / 0x10000) + 1) {
					cMonth = 1 - cMonth
				}
				if (cMonth > Math.floor(CalendarData[m] / 0x10000) + 1) {
					cMonth--
				}
			}
		}

		e2c(solarYear, solarMonth, solarDay)

		const res = {}
		res.year =
			tgString.charAt((cYear - 4) % 10) + dzString.charAt((cYear - 4) % 12)
		res.signs = sx.charAt((cYear - 4) % 12)
		res.month =
			cMonth < 1
				? `(闰){monString.charAt(-cMonth - 1)}`
				: monString.charAt(cMonth - 1)

		res.day = cDay < 11 ? "初" : cDay < 20 ? "十" : cDay < 30 ? "廿" : "三十"
		if (cDay % 10 !== 0 || cDay === 10) {
			res.day += numString.charAt((cDay - 1) % 10)
		}
		return res
	},

	// 这里的获取exif要将图片转ArrayBuffer对象，这里假设获取了图片的baes64
	// 步骤一
	// base64转ArrayBuffer对象

	/*
	orientation值	旋转角度
	1	0°
	3	180°
	6	顺时针90°
	8	逆时针90°

	*/
	exifOrientation(base64) {
		function base64ToArrayBuffer(base64) {
			base64 = base64.replace(/^data:([^;]+);base64,/gim, "")
			const binary = atob(base64)
			const len = binary.length
			const buffer = new ArrayBuffer(len)
			const view = new Uint8Array(buffer)
			for (let i = 0; i < len; i++) {
				view[i] = binary.charCodeAt(i)
			}
			return buffer
		}
		// 步骤二，Unicode码转字符串
		// ArrayBuffer对象 Unicode码转字符串
		function getStringFromCharCode(dataView, start, length) {
			let str = ""
			let i
			for (i = start, length += start; i < length; i++) {
				str += String.fromCharCode(dataView.getUint8(i))
			}
			return str
		}

		// 步骤三，获取jpg图片的exif的角度（在ios体现最明显）
		function getOrientation(arrayBuffer) {
			const dataView = new DataView(arrayBuffer)
			let length = dataView.byteLength
			let orientation
			let exifIDCode
			let tiffOffset
			let firstIFDOffset
			let littleEndian
			let endianness
			let app1Start
			let ifdStart
			let offset
			let i
			// Only handle JPEG image (start by 0xFFD8)
			if (dataView.getUint8(0) === 0xff && dataView.getUint8(1) === 0xd8) {
				offset = 2
				while (offset < length) {
					if (
						dataView.getUint8(offset) === 0xff &&
						dataView.getUint8(offset + 1) === 0xe1
					) {
						app1Start = offset
						break
					}
					offset++
				}
			}
			if (app1Start) {
				exifIDCode = app1Start + 4
				tiffOffset = app1Start + 10
				if (getStringFromCharCode(dataView, exifIDCode, 4) === "Exif") {
					endianness = dataView.getUint16(tiffOffset)
					littleEndian = endianness === 0x4949

					if (littleEndian || endianness === 0x4d4d /* bigEndian */) {
						if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002a) {
							firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian)

							if (firstIFDOffset >= 0x00000008) {
								ifdStart = tiffOffset + firstIFDOffset
							}
						}
					}
				}
			}
			if (ifdStart) {
				length = dataView.getUint16(ifdStart, littleEndian)

				for (i = 0; i < length; i++) {
					offset = ifdStart + i * 12 + 2
					if (
						dataView.getUint16(offset, littleEndian) ===
						0x0112 /* Orientation */
					) {
						// 8 is the offset of the current tag's value
						offset += 8

						// Get the original orientation value
						orientation = dataView.getUint16(offset, littleEndian)

						// Override the orientation with its default value for Safari (#120)
						// if (IS_SAFARI_OR_UIWEBVIEW) {
						// dataView.setUint16(offset, 1, littleEndian);
						// }
						break
					}
				}
			}
			return orientation
		}
		const data = base64ToArrayBuffer(base64)
		return getOrientation(data)
	},
}

export default utils
