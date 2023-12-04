window.css = function css(cssString) {
    let container = document.querySelector("style#quillStyles");
    if(!container) {
        container = document.createElement('style');
        container.id = "quillStyles";
        document.head.appendChild(container);
    }
  
    let primarySelector = cssString.substring(0, cssString.indexOf("{")).trim();
    primarySelector = primarySelector.replace(/\*/g, "all");
    primarySelector = primarySelector.replace(/#/g, "id-");
    primarySelector = primarySelector.replace(/,/g, "");
    let stylesheet = container.querySelector(`:scope > style[id='${primarySelector}']`)
    if(!stylesheet) {
        stylesheet = document.createElement('style');
        stylesheet.id = primarySelector;
        stylesheet.appendChild(document.createTextNode(cssString));
        container.appendChild(stylesheet);
    } else {
        stylesheet.innerText = cssString
    }
}
  
window.html = function html(elementString) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(elementString, 'text/html');
    return doc.body.firstChild;
}
  
function trailingSlash(url) {
    return url.endsWith("/") ? url : url+"/";
}
function noTrailingSlash(url) {
    return url.endsWith("/") ? url.substring(0, url.length-1) : url;
}
  
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
  
window.addEventListener('locationchange', locationChange);
let urlBeforeChange = window.location.href;
  
window.navigateTo = function(url) {
    window.history.pushState({}, '', url);
}

Object.defineProperty(window, 'routes', {
    configurable: true,
    enumerable: true,
    set: function(newValue) {
      Object.defineProperty(window, 'routes', {
        value: newValue,
        writable: false,
        configurable: false,
        enumerable: true
      });
  
      locationChange();
    },
    get: function() {
      return window.routes;
    }
});
function locationChange() {
    console.log("location change")
    let URL = window.location.pathname.split("/").filter(d => (d !== 'Web') && (d !== 'index.html')).join("/")
    if(URL === "") URL = "/"
    console.log(URL)
    console.log(document.body.children[0])
    let wrapper = document.querySelector("#wrapper");
    if(wrapper) {
        wrapper.replaceWith(new window.routes[URL]())
    } else {
        document.body.prepend(new window.routes[URL]())
        document.body.children[0].id = "wrapper"
    }
    urlBeforeChange = window.location.href;
}

  
function detectMobile() {
    const mobileDeviceRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileDeviceRegex.test(navigator.userAgent);
}
  
function getSafariVersion() {
    const userAgent = navigator.userAgent;
    const isSafari = userAgent.includes("Safari") && !userAgent.includes("Chrome");
    if (isSafari) {
      const safariVersionMatch = userAgent.match(/Version\/(\d+\.\d+)/);
      const safariVersion = safariVersionMatch ? parseFloat(safariVersionMatch[1]) : null;
      return safariVersion;
    }
}