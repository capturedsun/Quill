export function addStyle(cssString) {
    let stylesheet = new CSSStyleSheet();
    stylesheet.replaceSync(cssString)
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesheet];
  }
  
export function create(elementString) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(elementString, 'text/html');
    return doc.body.firstChild;
}