function createFileControl (accept, opt){
	var fileEle = document.createElement('input');
	fileEle.setAttribute('type','file');
	fileEle.setAttribute('accept',accept);
	fileEle.addEventListener('change', opt.changeHandler);
	return fileEle;
}
export default createFileControl