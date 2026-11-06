function createFileControl (accept, opt){
	const fileEle = document.createElement('input');
	fileEle.setAttribute('type','file');
	fileEle.setAttribute('accept',accept);
	fileEle.addEventListener('change', opt.changeHandler);
	fileEle.addEventListener('error', opt.errorHandler);
	return fileEle;
}
export default createFileControl