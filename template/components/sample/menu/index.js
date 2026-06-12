import templateHtml from './index.html?raw';
import { mountTemplate, createIdByPath, cloneTemplateNode } from "../../temp";
import { event } from "./event";

function mountData(_element, _data) {
    console.log('做点啥')
    // console.log(element, data)
}

export class sampleRenderer {
  static #id = null; // 私有字段存储ID

  static async init() {
    const template = await mountTemplate(templateHtml)
	  // path = path.split('?')[0].replace(/\.js$/, '.html?raw');
    const id = createIdByPath(import.meta.url);
	  template.id = id
    this.#id = id
  }
  
  static render(container, data) {
    const clone = cloneTemplateNode(this.#id)

    // data.forEach(item => {
    //     const clone = template.content.cloneNode(true);
    //     mountData(clone, item);
    //     container.appendChild(clone);
    // });

    mountData(clone, data);
    container.innerHTML = '';
    container.appendChild(clone);
    event()
  }
}