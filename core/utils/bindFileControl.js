// 上传组件
// <input class="abso upimg" id="upimg" accept="image/*" type="file" style='left:100px;top:100px;width:100px;height:100px;opacity:0.5'/>
function bindFileControl(btnEle, accept, opt) {
    let fileEle = document.createElement('input')
    fileEle.setAttribute('type', 'file')
    fileEle.setAttribute('accept', accept)
    fileEle.addEventListener('change', function () {
        let file = this.files[0] // 获取file对象
        // 判断file的类型是不是图片类型。
        // if(!file || !/image\/\w+/.test(file.type)){ 
        // 	console.log("文件必须为图片！"); 
        // 	return false; 
        // } 
        if (!file) {
            if (opt.errorCallback) opt.errorCallback({})
            return
        }
        let reader = new FileReader() // 声明一个FileReader实例
        // 最后在onload事件中，获取到成功读取的文件内容，并以插入一个img节点的方式显示选中的图片
        reader.onload = function () {
            // alert(reader.readyState)
            if (opt.successCallback) opt.successCallback(this)

        }
        reader.onerror = function () {
            if (opt.errorCallback) opt.errorCallback(this)
        }
        reader.readAsDataURL(file) // 调用readAsDataURL方法来读取选中的图像文件

    })
    btnEle.onclick = function () {
        fileEle.click()
    }
    return fileEle
}

export default {
  bindFileControl,
}
