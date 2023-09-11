export function addStyle(cssString) {
    let container = document.querySelector("style#quillStyles");
    if(!container) {
        container = document.createElement('style');
        container.id = "quillStyles";
        document.head.appendChild(container);
    }

    let primarySelector = cssString.substring(0, cssString.indexOf("{")).trim();
    primarySelector = primarySelector.replace(/\*/g, "all");
    let stylesheet = container.querySelector(`:scope > style#${primarySelector}`)
    if(!stylesheet) {
        stylesheet = document.createElement('style');
        stylesheet.id = primarySelector;
        stylesheet.appendChild(document.createTextNode(cssString));
        container.appendChild(stylesheet);
    } else {
        stylesheet.innerText = cssString
    }
}

export function createElement(elementString) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(elementString, 'text/html');
  return doc.body.firstChild;
}

export function detectMobile() {
  const mobileDeviceRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileDeviceRegex.test(navigator.userAgent);
}

export function getSafariVersion() {
  const userAgent = navigator.userAgent;
  const isSafari = userAgent.includes("Safari") && !userAgent.includes("Chrome");
  if (isSafari) {
    const safariVersionMatch = userAgent.match(/Version\/(\d+\.\d+)/);
    const safariVersion = safariVersionMatch ? parseFloat(safariVersionMatch[1]) : null;
    return safariVersion;
  }
}