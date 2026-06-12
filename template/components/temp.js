
const tempDom = document.createElement('div');

export const createIdByPath = (path) => {
  return 'id_' + path.split('?')[0].replace(/[^a-zA-Z0-9]/g, '_')
}

export async function mountTemplate(html) {
	const temp = document.createElement('div');
	temp.innerHTML = html;
	const template = temp.querySelector('template');
	if (!template) {
		throw new Error(`模板文件 ${path} 中未找到 <template> 标签`);
	}
	tempDom.appendChild(template);
	return template
}

export function cloneTemplateNode(id){
	const template = tempDom.querySelector(`#${id}`);
	if (!template) {
		throw new Error(`模板未加载，请先调用 init()`);
	}
	return template.content.cloneNode(true);
}
