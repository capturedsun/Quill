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
    let URL = window.location.pathname.split("/").filter(d => (d !== 'Web') && (!d.includes('.html'))).join("/")
    if(URL === "") URL = "/"
    let wrapper = document.querySelector("#wrapper");
    if(wrapper) {
        wrapper.replaceWith(new window.routes[URL]())
        document.body.children[0].id = "wrapper"
    } else {
        document.body.prepend(new window.routes[URL]())
        document.body.children[0].id = "wrapper"
    }
    urlBeforeChange = window.location.href;
}