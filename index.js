import * as dom from './dom.js';
window.dom = {};
Object.entries(dom).forEach(([name, exported]) => window.dom[name] = exported);

class Index extends HTMLElement {

    css = /*css*/ `

    `

    html = /*html*/ `

    `

    constructor() {
        super();
        
        dom.addStyle(this.css);
        this.innerHTML = this.html;
    }

    connectedCallback() {

    }

}

customElements.define('index-el', Index);
export default Index;

