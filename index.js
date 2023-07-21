class Index extends HTMLElement {

    css = /*css*/ `

    `

    html = /*html*/ `

    `

    constructor() {
        super();
        
        addStyle(this.css);
        this.innerHTML = this.html;
    }

    connectedCallback() {

    }

}

customElements.define('index-el', Index);
export default Index;

