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

/* REGISTER */

window.Registry = class Registry {

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

    static registerElement = (el, tagname) => {
        console.log(this.parseClassFields(el))
        let stateVariables = this.parseClassFields(el).filter(field => field.startsWith('$'));
        let stateVariablesWithout$ = stateVariables.map(str => str.substring(1));

        console.log(stateVariables)
        
        // Observe attributes
        Object.defineProperty(el, 'observedAttributes', {
            get: function() {
                return stateVariablesWithout$;
            }
        });

        // Attributes -> State
        Object.defineProperty(el.prototype, 'attributeChangedCallback', {
            value: function(name, oldValue, newValue) {
                const fieldName = `$${name}`;
                if (fieldName in this && this[fieldName] !== newValue) {
                    this[fieldName] = newValue;
                }
            },
            writable: true,
            configurable: true
        });

        customElements.define(tagname, el)

        // Actual Constructor
        window[el.prototype.constructor.name] = function (...params) {
            // console.log(params, stateVariables)
            let elem = new el()

            // State -> Attributes
            // set each state value as getter and setter
            stateVariables.forEach(property => {
                const attrName = property.substring(1); // Assuming 'property' starts with a symbol like '$'
                const backingFieldName = `_${property}`; // Construct the backing field name
            
                Object.defineProperty(elem, property, {
                    set: function(newValue) {
                        console.log(`Setting attribute ${attrName} to ${newValue}`);
                        this[backingFieldName] = newValue; // Use the backing field to store the value
                        this.setAttribute(attrName, newValue); // Synchronize with the attribute
                    },
                    get: function() {
                        return this[backingFieldName]; // Provide a getter to access the backing field value
                    },
                    enumerable: true,
                    configurable: true
                });
            });

            // if there are more than one, expect them to be named
            if(stateVariables.length > 1) {
                if(typeof params[0] !== "object") {
                    console.error(`Quill: elements with multiple state initializers must structure them like {color: "blue", type: 2}`)
                    return
                }
                let i = -1
                for (let param in params[0]) {
                    i++
                    let paramName = "$" + param
                    if(stateVariables[i] !== paramName) {
                        if(!stateVariables[i]) {
                            console.error(`${el.prototype.constructor.name}: state ${state} must be initialized`)
                        } else {
                            continue
                        }
                        console.error(`${el.prototype.constructor.name}: state initializer ${i} ${paramName} should be ${stateVariables[0]}`)
                        return
                    } else {
                        elem[paramName] = params[0][param]
                    }
                }
            } else {
                if(!params[0] && stateVariables[0]) {
                    console.log(params, stateVariables)
                    console.error(`${el.prototype.constructor.name}: state initializer $${params[0]} should be ${stateVariables[0]}`)
                    return
                }
                elem[stateVariables[0]] = params[0]
            }

            // Check if all state variables are set
            for(let state of stateVariables) {
                console.log(elem[state])
                if(!elem[state]) {
                    console.error(`Quill: state ${state} must be initialized`)
                }
            }
            
            return elem
        }
    }
}
window.registerElement = Registry.registerElement

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
    this.innerHTML = ""
    if(els) {
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

/* DEFAULT WRAPPERS */

window.a = function a({ href, name=href } = {}) {
    let link = document.createElement("a")
    link.setAttribute('href', href);
    link.innerText = name
    return link
}

window.img = function img({width="", height="", src=""}) {
    let image = new Image()
    if(width) image.style.width = width
    if(height) image.style.height = height
    if(src) image.src = src
    return image
}

window.p = function p(innerText) {
    let para = document.createElement("p")
    para.innerText = innerText
    return para
}

window.div = function (innerText) {
    let div = document.createElement("div")
    div.innerText = innerText
    return div
}

window.span = function (innerText) {
    let span = document.createElement("span")
    span.innerText = innerText
    return span
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

/* CONSOLE */

console.red = function(message) {
    this.log(`%c${message}`, "color: rgb(254, 79, 42);");
};

console.green = function(message) {
    this.log(`%c${message}`, "color: rgb(79, 254, 42);");

}