
import * as utils from '~/core/utils';


const clickCall = {

	// 复制userAgent
	copyText() {
		utils.copyText(navigator.userAgent, () => {
			weui.toast('复制成功', 3000);
		});
	},
	createFileControl(e) {
		const accept = e.target.getAttribute('data-accept')
		const fileEle = utils.createFileControl(accept, { successCallback(_reader) { }, errorCallback(_res) { } })
		fileEle.click()
	},

};
export const event = () => {

	document.querySelector('.list').onclick = (e) => {
		var ele = e.target;
		if (ele.className !== 'btn') return;
		var key = ele.getAttribute('data-key');
		if (!key) return;
		clickCall[key]?.(e);
	}

}