class NavigationIndex extends HTMLElement {
    urlBeforeChange;

    css = /*css*/ `
        navigation-index {
            
        }
    `

    html = /*html*/ `

    `

    constructor() {
        super();
        quill.addStyle(this.css);
        this.innerHTML = this.html;
    }

    connectedCallback() {
        this.listenForNavigation();
    }

    listenForNavigation() {
        let oldPushState = history.pushState;
        history.pushState = function pushState() {
            let ret = oldPushState.apply(this, arguments);
            window.dispatchEvent(new Event('pushstate'));
            window.dispatchEvent(new Event('locationchange'));
            return ret;
        };

        window.addEventListener('popstate', () => {
            window.dispatchEvent(new Event('locationchange'));
        });
        
        window.addEventListener('locationchange', this.locationChange);

        this.urlBeforeChange = window.location.href;
    }

    locationChange = async () => {
        let splitURL = window.location.pathname.split("/");
        let urlPrefix = splitURL.slice(0, -1).join('/');
        let urlEnding = splitURL[splitURL.length-1];
        if(urlEnding === '') {
            this.innerHTML = this.html;
        } else {
            let pascalizedEnding = urlEnding.replace(/(^\w|-\w)/g, (urlEnding) => urlEnding.replace(/-/, "").toUpperCase());
            import(`.${urlPrefix}/${pascalizedEnding}/${pascalizedEnding}.js`)
            let htmlTag = urlEnding.includes("-") ? urlEnding : urlEnding + "-wrapper";
            this.innerHTML = `<${htmlTag}></${htmlTag}>`
        }
        this.urlBeforeChange = window.location.href;
    }

}

customElements.define('navigation-index', NavigationIndex);
export default NavigationIndex;