/* NAVIGATION */

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
    let URL = window.location.pathname.split("/").filter(d => (d !== 'Web') && (!d.includes('.html'))).join("/")
    if(URL === "") URL = "/"

    console.log("Location change: ", URL)

    if(!window.routes[URL]) {
        console.error("Quill: no URL for this route: ", URL)
        return
    }

    let page = new window.routes[URL]()
    window.rendering.push(page)
    page.render()
    window.rendering.pop(page)

    urlBeforeChange = window.location.href;
}

/* $() */

HTMLElement.prototype.$ = function(selector) {
    return window.$(selector, this)
}
DocumentFragment.prototype.$ = function(selector) {
    return window.$(selector, this)
}
window.$ = function(selector, el = document) {
    if(selector[0] === "#" || selector.includes("[name")) {
        return el.querySelector(selector)
    } else {
        return el.querySelectorAll(selector);
    }
}

/* CONSOLE */

console.red = function(message) {
    this.log(`%c${message}`, "color: rgb(254, 79, 42);");
};

console.green = function(message) {
    this.log(`%c${message}`, "color: rgb(79, 254, 42);");

}

/* STRING TRANSLATORS */

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

window.html = function html(htmlString) {
    let container = document.createElement('div');
    container.innerHTML = htmlString;

    // If there's only one child, return it directly
    if (container.children.length === 1) {
        return container.children[0];
    }

    // If there are multiple children, use a DocumentFragment
    let fragment = document.createDocumentFragment();
    while (container.firstChild) {
        fragment.appendChild(container.firstChild);
    }

    return fragment;
};

/* COMPATIBILITY */

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

/* REGISTER */
class ObservedObject {
    constructor() {
        this._observers = {}
    }

    static decode(obj) {
        let instance = new this()

        Object.keys(instance).forEach((key) => {
            if(key[0] === "$") {
                key = key.slice(1)
                instance._observers[key] = new Map()
                const backingFieldName = `_${key}`;
                Object.defineProperty(instance, key, {
                    set: function(newValue) {
                        instance[backingFieldName] = newValue;
                        for (let [observer, properties] of instance._observers[key]) {
                            for (let property of properties) {
                                observer[property] = newValue;
                            }
                        }
                    },
                    get: function() {
                        Registry.lastState.push(key)
                        Registry.lastState.push(instance[backingFieldName])
                        return instance[backingFieldName];
                    },
                    enumerable: true,
                    configurable: true
                });

                delete instance["$" + key]
            }

            if(obj[key]) {
                instance[key] = obj[key]
            } else {
                if(!instance[key]) {
                    throw new Error(`ObservedObject: Non-default value "${key}" must be initialized!`)
                }
            }
        })

        return instance
    }
}

window.Page = class Page {
    appendChild(el) {
        document.body.appendChild(el)
    }
}

window.Shadow = class Shadow extends HTMLElement {
    constructor() {
        super()
    }
}

window.Registry = class Registry {

    static initReactivity(elem, name, value) {
        let parent = window.rendering[window.rendering.length-1]

        if(Registry.lastState.length === 3) {
            let [objName, objField, fieldValue] = Registry.lastState
            if(!objName) return;

            let valueCheck = parent[objName][objField]
            if(valueCheck && valueCheck === value) {
                if(!parent[objName]._observers[objField].get(elem)) {
                    parent[objName]._observers[objField].set(elem, [])
                }
                parent[objName]._observers[objField].get(elem).push(name)
            }
        } else {
            let [stateUsed, stateValue] = Registry.lastState
            if(!stateUsed) return;
            
            if(stateUsed && parent[stateUsed] === value) {
                if(!parent._observers[stateUsed].get(elem)) {
                    parent._observers[stateUsed].set(elem, [])
                }
                parent._observers[stateUsed].get(elem).push(name)
            }
        }
        Registry.lastState = []
    }

    static render = (el, parent) => {
        let renderParent = window.rendering[window.rendering.length-1]
        if(renderParent) {
            renderParent.appendChild(el)
        }
        window.rendering.push(el)
        el.render()
        window.rendering.pop(el)
    }

    static testInitialized(el) {
        let fields = Object.keys(el).filter(key => 
            typeof el[key] !== 'function' && key !== "_observers"
        )

        for(let field of fields) {
            if(el[field] === undefined) {
                throw new Error(`Quill: field "${field}" must be initialized`)
            }
        }
    }

    static construct = (elem) => { // After default params are set, but before body of constructor
        const params = window.Registry.currentParams
        const allNames = Object.keys(elem).filter(key => typeof elem[key] !== 'function')
        const stateNames = allNames.filter(field => /^[$][^$]/.test(field)).map(str => str.substring(1));
        const observedObjectNames = allNames.filter(field => /^[$][$][^$]/.test(field)).map(str => str.substring(2));

        /*
        State Reactivity [stateName].get(elem).push(attribute)
            _observers = {
                name: Map(
                    <p>: [innerText, background]
                ),
            }

        OO Reactivity: [objectName][objectField].get(elem).push(attribute)
            $$form: extends ObservedObject {
                _observers = {
                    canvasPosition: Map(
                        <p>: [position]
                    ),
                    path: Map(
                        <p>: [innerText]
                    )
                }
            }
        */

        function makeState(elem, stateNames, params) {
            elem._observers = {}

            // State -> Attributes: set each state value as getter and setter
            stateNames.forEach(name => {
                const backingFieldName = `_${name}`;
                elem._observers[name] = new Map()
            
                Object.defineProperty(elem, name, {
                    set: function(newValue) {
                        // console.log(`Setting state ${name} to `, newValue);
                        elem[backingFieldName] = newValue; // Use the backing field to store the value
                        elem.setAttribute(name, typeof newValue === "object" ? "{..}" : newValue);
                        for (let [observer, properties] of elem._observers[name]) {
                            for (let property of properties) {
                                observer[property] = newValue;
                            }
                        }
                    },
                    get: function() {
                        Registry.lastState = [name, elem[backingFieldName]]
                        // check which elements are observing the 
                        return elem[backingFieldName]; // Provide a getter to access the backing field value
                    },
                    enumerable: true,
                    configurable: true
                });

                if(elem["$" + name] !== undefined) {
                    elem[name] = elem["$" + name]
                }

                delete elem["$" + name]
            });
        }

        function makeObservedObjects(elem, objectNames, params) {
            objectNames.forEach(name => {
                const backingFieldName = `_${name}`;

                Object.defineProperty(elem, name, {
                    set: function(newValue) {
                        elem[backingFieldName] = newValue;
                    },
                    get: function() {
                        Registry.lastState = [name]
                        return elem[backingFieldName];
                    },
                    enumerable: true,
                    configurable: true
                });

                if(elem["$$" + name] !== undefined) {
                    elem[name] = elem["$$" + name]
                }

                delete elem["$$" + name]
            });
        }

        makeState(elem, stateNames, params)
        makeObservedObjects(elem, observedObjectNames, params)

        let allNamesCleaned = Object.keys(elem)
            .filter(key => typeof elem[key] !== 'function' && key !== "_observers" && key !== "_observedObjects")
            .map(key => key.replace(/^(\$\$|\$)/, ''));

        let i = -1
        for (let param of params) {
            i++
            
            if(i > allNamesCleaned.length) {
                console.error(`${el.prototype.constructor.name}: too many parameters for field!`)
                return
            }

            if(elem[allNamesCleaned[i]] === undefined) {
                elem[allNamesCleaned[i]] = param
            }
        }
    }

    static register = (el, tagname) => {
        let stateVariables = this.parseClassFields(el).filter(field => /^[$][^$]/.test(field)).map(str => str.substring(1));
        el = this.parseConstructor(el)

        // Observe attributes
        Object.defineProperty(el, 'observedAttributes', {
            get: function() {
                return stateVariables;
            }
        });

        // Attributes -> State
        Object.defineProperty(el.prototype, 'attributeChangedCallback', {
            value: function(name, oldValue, newValue) {
                const fieldName = `${name}`;
                let blacklistedValues = ["[object Object]", "{..}", this[fieldName]]
                if (stateVariables.includes(fieldName) && !blacklistedValues.includes(newValue)) {
                    this[fieldName] = newValue;
                }
            },
            writable: true,
            configurable: true
        });

        customElements.define(tagname, el)

        // Actual Constructor
        window[el.prototype.constructor.name] = function (...params) {
            window.Registry.currentParams = params
            let elIncarnate = new el(...params)
            Registry.render(elIncarnate)
            return elIncarnate
        }
    }

    static parseClassFields(classObject) {
        let str = classObject.toString();
        const lines = str.split('\n');
        const fields = [];
        let braceDepth = 0; // Tracks the depth of curly braces to identify when we're inside a function/method
    
        for (let line of lines) {
            const trimmedLine = line.trim();
    
            // Update braceDepth based on the current line
            braceDepth += (trimmedLine.match(/{/g) || []).length;
            braceDepth -= (trimmedLine.match(/}/g) || []).length;
    
            // Check if the line is outside any function/method (top-level within the class)
            if (braceDepth === 1) {
                // Attempt to match a class field declaration with or without initialization
                const fieldMatch = trimmedLine.match(/^([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(=|;|\n|$)/);
                if (fieldMatch) {
                    fields.push(fieldMatch[1]);
                }
            }
    
            // If we encounter the constructor, stop the parsing as we're only interested in fields above it
            if (trimmedLine.startsWith('constructor')) {
                break;
            }
        }
    
        return fields;
    }

    static parseConstructor(classObject) {
        let str = classObject.toString();
        const lines = str.split('\n');
        let modifiedLines = [];
        let braceDepth = 0;
        let constructorFound = false
        let superCallFound = false;
    
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const trimmedLine = line.trim();
    
            modifiedLines.push(line);
    
            braceDepth += (trimmedLine.match(/{/g) || []).length;
            braceDepth -= (trimmedLine.match(/}/g) || []).length;
    
            if (trimmedLine.startsWith('constructor(')) {
                constructorFound = true;
            }
    
            if (constructorFound && trimmedLine.startsWith('super(') && !superCallFound) {
                superCallFound = true;
                modifiedLines.push(`    window.Registry.construct(this, window.Registry.currentStateVariables, ...window.Registry.currentParams);`);
            }
    
            if (constructorFound && braceDepth === 1 && superCallFound) {
                modifiedLines.splice(modifiedLines.length - 1, 0, '    Object.preventExtensions(this);');
                modifiedLines.splice(modifiedLines.length - 1, 0, '    window.Registry.testInitialized(this);');
            }
        }

        if(superCallFound) {
            let modifiedStr = modifiedLines.join('\n');
            return eval('(' + modifiedStr + ')');
        }

        if(constructorFound) {
            throw new Error("Quill: Constructor must have super()! " + lines[0])
        } else {
            let constructorString = `
            constructor(...params) {
                super(...params)
                window.Registry.construct(this)
            }
            `
            let closingBracket = str.lastIndexOf("}");
            str = str.slice(0, closingBracket - 1) + constructorString + "\n}"
            return eval('(' + str + ')');
        }
    }
}

/* DEFAULT WRAPPERS */

window.a = function a({ href, name=href } = {}) {
    let link = document.createElement("a")
    link.setAttribute('href', href);
    link.innerText = name
    Registry.render(link)
    return link
}

window.img = function img({width="", height="", src=""}) {
    let image = new Image()
    if(width) image.style.width = width
    if(height) image.style.height = height
    if(src) image.src = src
    Registry.render(image)
    return image
}

window.p = function p(innerText) {
    let para = document.createElement("p")
    para.innerText = innerText
    Registry.initReactivity(para, "innerText", innerText)
    Registry.render(para)
    return para
}

window.div = function (innerText) {
    let div = document.createElement("div")
    div.innerText = innerText
    Registry.render(div)
    return div
}

window.span = function (innerText) {
    let span = document.createElement("span")
    span.innerText = innerText
    Registry.render(span)
    return span
}

/* PROTOTYPE FUNCTIONS */
HTMLElement.prototype.addAttribute = function(name) {
    this.setAttribute(name, "")
}

HTMLElement.prototype.ownHTML = function() {
    return this.startingTag() + this.endingTag()
}

HTMLElement.prototype.startingTag = function() {
    const tag = this.tagName.toLowerCase();
    let html = `<${tag}`;

    for (const attr of this.attributes) {
        html += ` ${attr.name}="${attr.value}"`;
    }

    html += `>`;
    return html;
}

HTMLElement.prototype.endingTag = function() {
    const tag = this.tagName.toLowerCase();
    return `</${tag}>`;
}

HTMLElement.prototype.render = function (...els) {
    if(els.length > 0) {
        this.innerHTML = ""
        els.forEach((el) => {
            this.appendChild(el)
        })
    }
    return this
}

HTMLElement.prototype.class = function(classNames) {
    this.className = classNames
    return this
}

/* PROTOTYPE STYLING */

HTMLElement.prototype.styleVar = function(name, value) {
    this.style.setProperty(name, value)
    return this
}

HTMLElement.prototype.color = function(value) {
    this.style.color = value
    return this
}

HTMLElement.prototype.background = function(value) {
    this.style.backgroundColor = value
    return this
}

HTMLElement.prototype.fontSize = function(value) {
    this.style.fontSize = value
    return this
}

HTMLElement.prototype.borderRadius = function(value) {
    this.style.borderRadius = value
    return this
}

HTMLElement.prototype.padding = function(direction, amount) {
    const directionName = `padding${direction.charAt(0).toUpperCase()}${direction.slice(1)}`;
    if (typeof amount === 'number') {
        this.style[directionName] = `${amount}px`;
    } else {
        this.style[directionName] = amount;
    }
    return this
}

HTMLElement.prototype.outline = function(value) {
    this.style.outline = value
    return this
}

HTMLElement.prototype.maxWidth = function(value) {
    this.style.maxWidth = value
    return this
}

HTMLElement.prototype.margin = function(direction, amount) {
    const directionName = `margin${direction.charAt(0).toUpperCase()}${direction.slice(1)}`;
    if (typeof amount === 'number') {
        this.style[directionName] = `${amount}px`;
    } else {
        this.style[directionName] = amount;
    }
    return this
}

HTMLElement.prototype.transform = function(value) {
    this.style.transform = value
    return this
}

HTMLElement.prototype.positionType = function (value) {
    if(!(value === "absolute" || value === "relative" || value === "static" || value === "fixed" || value === "sticky")) {
        console.error("HTMLElement.overlflow: must have valid overflow value!")
        return;
    }
    this.style.position = value
    return this
}

HTMLElement.prototype.position = function({x, y} = {}) {
    if(!x || !y) {
        console.error("HTMLElement.position: must have valid x and y values: {x: 12, y: 23} where x and y are percentages")
        return;
    }
    let computed = window.getComputedStyle(this).position
    if(!(computed === "absolute" || computed === "fixed")) {
        this.style.position = "absolute"
    }
    this.style.left = `${x}%`
    this.style.top = `${y}%`
    return this
}

HTMLElement.prototype.overflow = function(value) {
    if(!(value === "visible" || value === "hidden" || value === "clip" || value === "scroll" || value === "auto")) {
        console.error("HTMLElement.overlflow: must have valid overflow value!")
        return;
    }
    this.style.overflow = value;
    return this
}


/* PROTOTYPE EVENTS */

HTMLElement.prototype.onClick = function(func) {
    this.addEventListener("click", func)
    return this
}

window.register = Registry.register
window.rendering = []