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

/* STYLES */

window.quillStyles = document.querySelector("style#shadows");
if(!window.quillStyles) {
    window.quillStyles = document.createElement('style');
    window.quillStyles.id = "shadows";
    document.head.appendChild(window.quillStyles);
}

window.quillStyles.add = function(tag) {
    let stylesheet = this.querySelector(`:scope > style[id='${tag}']`)
    tag = tag.replace(/\*/g, "all");
    tag = tag.replace(/#/g, "id-");
    tag = tag.replace(/,/g, "");
    if(!stylesheet) {
        stylesheet = document.createElement('style');
        stylesheet.id = tag;
        this.appendChild(stylesheet);
    }
}

window.quillStyles.update = function(tag, string) {
    let sheet = this.querySelector(`:scope > style[id='${tag}']`)?.sheet
    if(!sheet) console.error('Quill: could not find stylesheet to update!')
    
    for (let i = 0; i < sheet.cssRules.length; i++) {
        let rule = sheet.cssRules[i];
        
        if (rule.selectorText === tag || rule.selectorText === `${tag.toLowerCase()}`) {
            sheet.deleteRule(i);
            break;
        }
    }
    
    sheet.insertRule(`${tag} { ${string} }`, sheet.cssRules.length);
}

/* STRING TRANSLATORS */

window.html = function html(htmlString) {
    let container = document.createElement('div');
    container.innerHTML = htmlString;

    if (container.children.length === 1) {
        return container.children[0];
    }

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
class ObservedArray extends Array {
    parent;
    name;

    constructor(arr = [], parent, name) {
        super();
        this.parent = parent
        this.name = name
        this.push(...arr);
    }

    triggerParent() {
        this.parent[this.name] = this
    }

    push(...args) {
        const result = super.push(...args);
        this.triggerParent()
        return result;
    }

    pop() {
        const result = super.pop();
        this.triggerParent()
        return result;
    }

    shift() {
        const result = super.shift();
        this.triggerParent()
        return result;
    }

    unshift(...args) {
        const result = super.unshift(...args);
        this.triggerParent()
        return result;
    }

    splice(start, deleteCount, ...items) {
        const removedItems = super.splice(start, deleteCount, ...items);
        if (items.length > 0) {
            console.log(`Inserted ${items.length} items:`, items);
        }
        if (removedItems.length > 0) {
            console.log(`Removed ${removedItems.length} items:`, removedItems);
        }
        this.triggerParent()
        return removedItems;
    }
}

class ObservedObject {
    constructor() {
        this._observers = {}
    }

    static create(obj = {}) {
        let instance = new this()

        Object.keys(instance).forEach((key) => {
            if(key[0] === "$") {
                key = key.slice(1)
                instance._observers[key] = new Map()
                const backingFieldName = `_${key}`;
                instance[backingFieldName] = instance["$" + key]
                Object.defineProperty(instance, key, {
                    set: function(newValue) {
                        if(Array.isArray(newValue) && newValue.parent === undefined) {
                            instance[backingFieldName] = new ObservedArray(newValue, this, key)
                        } else {
                            instance[backingFieldName] = newValue;
                        }
                        for (let [observer, properties] of instance._observers[key]) {
                            for (let property of properties) {
                                if(property === "children") {
                                    Registry.rerender(observer)
                                } else {
                                    if(Array.isArray(property)) {
                                        observer[property[0]][property[1]] = newValue;
                                    } else {
                                        observer[property] = newValue;
                                    }
                                }
                            }
                        }
                    },
                    get: function() {
                        if(Registry.lastState) {
                            Registry.lastState = [...Registry.lastState, key, instance[backingFieldName]]
                        }
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
                if(instance[key] === undefined || instance[key] === null) {
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

    static initReactivity(elem, name, value) {
        let parent = window.rendering.last()

        if(Registry.lastState.length === 3) {
            let [objName, objField, fieldValue] = Registry.lastState
            if(!objName) return;

            let valueCheck = parent[objName][objField]
            if(valueCheck !== undefined && valueCheck === value) {
                if(!parent[objName]._observers[objField].get(elem)) {
                    parent[objName]._observers[objField].set(elem, [])
                }
                let properties = parent[objName]._observers[objField].get(elem)
                if(!properties.includes(name)) {
                    properties.push(name)
                }
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

    static rerender = (el) => {
        if(el.parentElement) {
            window.rendering.push(el.parentElement)
        }
        window.rendering.push(el)
        el.innerHTML = ""
        el.render()
        window.rendering.pop()
        window.rendering.pop()
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

        function makeState(elem, stateNames, params) {
            elem._observers = {}

            // State -> Attributes: set each state value as getter and setter
            stateNames.forEach(name => {
                const backingFieldName = `_${name}`;
                elem._observers[name] = new Map()
            
                Object.defineProperty(elem, name, {
                    set: function(newValue) {
                        elem[backingFieldName] = newValue;
                        elem.setAttribute(name, typeof newValue === "object" ? "{..}" : newValue);
                        for (let [element, properties] of elem._observers[name]) {
                            for (let property of properties) {
                                if(Array.isArray(property)) {
                                    element[property[0]][property[1]] = newValue;
                                } else {
                                    element[property] = newValue;
                                }
                            }
                        }
                    },
                    get: function() {
                        Registry.lastState = [name, elem[backingFieldName]]
                        return elem[backingFieldName];
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

        for(let name of allNames) {
            if(name.replace(/^\$+/, '') in elem.style) {
                throw new Error(`Quill: Property name "${name.replace(/^\$+/, '')}" is not valid`)
            }
        }

        let i = -1
        for (let param of params) {
            i++
            
            if(i >= allNames.length) {
                throw new Error(`${elem.constructor.name}: ${params.length} arguments passed in where ${allNames.length} expected!`)
            }

            let bareName = allNames[i].replace(/^(\$\$|\$)/, '');

            if(elem[bareName] === undefined) {
                if(allNames[i].startsWith("$$") && !(param instanceof ObservedObject)) {
                    throw new Error(`Field ${allNames[i]} must be an Observed Object!`)
                }
                elem[bareName] = param
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
        quillStyles.add(tagname)

        // Actual Constructor
        window[el.prototype.constructor.name] = function (...params) {
            window.Registry.currentParams = params
            let elIncarnate = new el(...params)
            Registry.render(elIncarnate)
            return elIncarnate
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
    div.innerText = innerText ?? ""
    Registry.render(div)
    return div
}

window.span = function (innerText) {
    let span = document.createElement("span")
    span.innerText = innerText
    Registry.render(span)
    return span
}

/* CUSTOM */

window.ForEach = function (arr, cb) {
    Registry.initReactivity(window.rendering.last(), "children", arr)
    arr.forEach((el, i) => {
        cb(el, i)
    })
}

window.VStack = function (cb = () => {}) {
    let nowRendering = window.rendering.last()
    if(nowRendering.innerHTML === "") {
        let styles =   `
            display: flex;
            flex-direction: column;
        `
        quillStyles.update(nowRendering.tagName.toLowerCase(), styles)
        cb()
        return nowRendering
    }
}

window.HStack = function (cb = () => {}) {
    let nowRendering = window.rendering.last()
    if(nowRendering.innerHTML === "") {
        let styles =   `
            display: flex;
            flex-direction: row;
        `
        quillStyles.update(nowRendering.tagName.toLowerCase(), styles)
        cb()
        return nowRendering
    }
}

/* SHAPES */

window.Circle = function(text = "") {
    let div = document.createElement("div")
    div.innerText = text
    div.style.borderRadius = "100%"
    div.style.width = "20px"
    div.style.height = "20px"
    div.style.background = "black"
    div.style.color = "white"
    div.style.textAlign = "center"
    Registry.render(div)
    return div
}

window.Triangle = function() {
    let div = document.createElement("div")
    div.style.cssText += `
        width: 20px;
        height: 17.3px;
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        background: black;
    `
    Registry.render(div)
    return div
}

/* PROTOTYPE FUNCTIONS */

Array.prototype.last = function() {
    return this[this.length-1]
}
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

function extendHTMLElementWithStyleSetters() {
    let props = ["accentColor", "additiveSymbols", "alignContent", "alignItems", "alignSelf", "alignmentBaseline", "all", "animation", "animationComposition", "animationDelay", "animationDirection", "animationDuration", "animationFillMode", "animationIterationCount", "animationName", "animationPlayState", "animationRange", "animationRangeEnd", "animationRangeStart", "animationTimeline", "animationTimingFunction", "appRegion", "appearance", "ascentOverride", "aspectRatio", "backdropFilter", "backfaceVisibility", "background", "backgroundAttachment", "backgroundBlendMode", "backgroundClip", "backgroundColor", "backgroundImage", "backgroundOrigin", "backgroundPosition", "backgroundPositionX", "backgroundPositionY", "backgroundRepeat", "backgroundSize", "basePalette", "baselineShift", "baselineSource", "blockSize", "border", "borderBlock", "borderBlockColor", "borderBlockEnd", "borderBlockEndColor", "borderBlockEndStyle", "borderBlockEndWidth", "borderBlockStart", "borderBlockStartColor", "borderBlockStartStyle", "borderBlockStartWidth", "borderBlockStyle", "borderBlockWidth", "borderBottom", "borderBottomColor", "borderBottomLeftRadius", "borderBottomRightRadius", "borderBottomStyle", "borderBottomWidth", "borderCollapse", "borderColor", "borderEndEndRadius", "borderEndStartRadius", "borderImage", "borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth", "borderInline", "borderInlineColor", "borderInlineEnd", "borderInlineEndColor", "borderInlineEndStyle", "borderInlineEndWidth", "borderInlineStart", "borderInlineStartColor", "borderInlineStartStyle", "borderInlineStartWidth", "borderInlineStyle", "borderInlineWidth", "borderLeft", "borderLeftColor", "borderLeftStyle", "borderLeftWidth", "borderRadius", "borderRight", "borderRightColor", "borderRightStyle", "borderRightWidth", "borderSpacing", "borderStartEndRadius", "borderStartStartRadius", "borderStyle", "borderTop", "borderTopColor", "borderTopLeftRadius", "borderTopRightRadius", "borderTopStyle", "borderTopWidth", "borderWidth", "bottom", "boxShadow", "boxSizing", "breakAfter", "breakBefore", "breakInside", "bufferedRendering", "captionSide", "caretColor", "clear", "clip", "clipPath", "clipRule", "color", "colorInterpolation", "colorInterpolationFilters", "colorRendering", "colorScheme", "columnCount", "columnFill", "columnGap", "columnRule", "columnRuleColor", "columnRuleStyle", "columnRuleWidth", "columnSpan", "columnWidth", "columns", "contain", "containIntrinsicBlockSize", "containIntrinsicHeight", "containIntrinsicInlineSize", "containIntrinsicSize", "containIntrinsicWidth", "container", "containerName", "containerType", "content", "contentVisibility", "counterIncrement", "counterReset", "counterSet", "cursor", "cx", "cy", "d", "descentOverride", "direction", "display", "dominantBaseline", "emptyCells", "fallback", "fieldSizing", "fill", "fillOpacity", "fillRule", "filter", "flex", "flexBasis", "flexDirection", "flexFlow", "flexGrow", "flexShrink", "flexWrap", "float", "floodColor", "floodOpacity", "font", "fontDisplay", "fontFamily", "fontFeatureSettings", "fontKerning", "fontOpticalSizing", "fontPalette", "fontSize", "fontStretch", "fontStyle", "fontSynthesis", "fontSynthesisSmallCaps", "fontSynthesisStyle", "fontSynthesisWeight", "fontVariant", "fontVariantAlternates", "fontVariantCaps", "fontVariantEastAsian", "fontVariantLigatures", "fontVariantNumeric", "fontVariantPosition", "fontVariationSettings", "fontWeight", "forcedColorAdjust", "gap", "grid", "gridArea", "gridAutoColumns", "gridAutoFlow", "gridAutoRows", "gridColumn", "gridColumnEnd", "gridColumnGap", "gridColumnStart", "gridGap", "gridRow", "gridRowEnd", "gridRowGap", "gridRowStart", "gridTemplate", "gridTemplateAreas", "gridTemplateColumns", "gridTemplateRows", "height", "hyphenateCharacter", "hyphenateLimitChars", "hyphens", "imageOrientation", "imageRendering", "inherits", "initialLetter", "initialValue", "inlineSize", "inset", "insetBlock", "insetBlockEnd", "insetBlockStart", "insetInline", "insetInlineEnd", "insetInlineStart", "isolation", "justifyContent", "justifyItems", "justifySelf", "left", "letterSpacing", "lightingColor", "lineBreak", "lineGapOverride", "lineHeight", "listStyle", "listStyleImage", "listStylePosition", "listStyleType", "margin", "marginBlock", "marginBlockEnd", "marginBlockStart", "marginBottom", "marginInline", "marginInlineEnd", "marginInlineStart", "marginLeft", "marginRight", "marginTop", "marker", "markerEnd", "markerMid", "markerStart", "mask", "maskClip", "maskComposite", "maskImage", "maskMode", "maskOrigin", "maskPosition", "maskRepeat", "maskSize", "maskType", "mathDepth", "mathShift", "mathStyle", "maxBlockSize", "maxHeight", "maxInlineSize", "maxWidth", "minBlockSize", "minHeight", "minInlineSize", "minWidth", "mixBlendMode", "negative", "objectFit", "objectPosition", "objectViewBox", "offset", "offsetAnchor", "offsetDistance", "offsetPath", "offsetPosition", "offsetRotate", "opacity", "order", "orphans", "outline", "outlineColor", "outlineOffset", "outlineStyle", "outlineWidth", "overflow", "overflowAnchor", "overflowClipMargin", "overflowWrap", "overflowX", "overflowY", "overlay", "overrideColors", "overscrollBehavior", "overscrollBehaviorBlock", "overscrollBehaviorInline", "overscrollBehaviorX", "overscrollBehaviorY", "pad", "padding", "paddingBlock", "paddingBlockEnd", "paddingBlockStart", "paddingBottom", "paddingInline", "paddingInlineEnd", "paddingInlineStart", "paddingLeft", "paddingRight", "paddingTop", "page", "pageBreakAfter", "pageBreakBefore", "pageBreakInside", "pageOrientation", "paintOrder", "perspective", "perspectiveOrigin", "placeContent", "placeItems", "placeSelf", "pointerEvents", "position", "prefix", "quotes", "r", "range", "resize", "right", "rotate", "rowGap", "rubyPosition", "rx", "ry", "scale", "scrollBehavior", "scrollMargin", "scrollMarginBlock", "scrollMarginBlockEnd", "scrollMarginBlockStart", "scrollMarginBottom", "scrollMarginInline", "scrollMarginInlineEnd", "scrollMarginInlineStart", "scrollMarginLeft", "scrollMarginRight", "scrollMarginTop", "scrollPadding", "scrollPaddingBlock", "scrollPaddingBlockEnd", "scrollPaddingBlockStart", "scrollPaddingBottom", "scrollPaddingInline", "scrollPaddingInlineEnd", "scrollPaddingInlineStart", "scrollPaddingLeft", "scrollPaddingRight", "scrollPaddingTop", "scrollSnapAlign", "scrollSnapStop", "scrollSnapType", "scrollTimeline", "scrollTimelineAxis", "scrollTimelineName", "scrollbarColor", "scrollbarGutter", "scrollbarWidth", "shapeImageThreshold", "shapeMargin", "shapeOutside", "shapeRendering", "size", "sizeAdjust", "speak", "speakAs", "src", "stopColor", "stopOpacity", "stroke", "strokeDasharray", "strokeDashoffset", "strokeLinecap", "strokeLinejoin", "strokeMiterlimit", "strokeOpacity", "strokeWidth", "suffix", "symbols", "syntax", "system", "tabSize", "tableLayout", "textAlign", "textAlignLast", "textAnchor", "textCombineUpright", "textDecoration", "textDecorationColor", "textDecorationLine", "textDecorationSkipInk", "textDecorationStyle", "textDecorationThickness", "textEmphasis", "textEmphasisColor", "textEmphasisPosition", "textEmphasisStyle", "textIndent", "textOrientation", "textOverflow", "textRendering", "textShadow", "textSizeAdjust", "textSpacingTrim", "textTransform", "textUnderlineOffset", "textUnderlinePosition", "textWrap", "timelineScope", "top", "touchAction", "transform", "transformBox", "transformOrigin", "transformStyle", "transition", "transitionBehavior", "transitionDelay", "transitionDuration", "transitionProperty", "transitionTimingFunction", "translate", "unicodeBidi", "unicodeRange", "userSelect", "vectorEffect", "verticalAlign", "viewTimeline", "viewTimelineAxis", "viewTimelineInset", "viewTimelineName", "viewTransitionName", "visibility", "webkitAlignContent", "webkitAlignItems", "webkitAlignSelf", "webkitAnimation", "webkitAnimationDelay", "webkitAnimationDirection", "webkitAnimationDuration", "webkitAnimationFillMode", "webkitAnimationIterationCount", "webkitAnimationName", "webkitAnimationPlayState", "webkitAnimationTimingFunction", "webkitAppRegion", "webkitAppearance", "webkitBackfaceVisibility", "webkitBackgroundClip", "webkitBackgroundOrigin", "webkitBackgroundSize", "webkitBorderAfter", "webkitBorderAfterColor", "webkitBorderAfterStyle", "webkitBorderAfterWidth", "webkitBorderBefore", "webkitBorderBeforeColor", "webkitBorderBeforeStyle", "webkitBorderBeforeWidth", "webkitBorderBottomLeftRadius", "webkitBorderBottomRightRadius", "webkitBorderEnd", "webkitBorderEndColor", "webkitBorderEndStyle", "webkitBorderEndWidth", "webkitBorderHorizontalSpacing", "webkitBorderImage", "webkitBorderRadius", "webkitBorderStart", "webkitBorderStartColor", "webkitBorderStartStyle", "webkitBorderStartWidth", "webkitBorderTopLeftRadius", "webkitBorderTopRightRadius", "webkitBorderVerticalSpacing", "webkitBoxAlign", "webkitBoxDecorationBreak", "webkitBoxDirection", "webkitBoxFlex", "webkitBoxOrdinalGroup", "webkitBoxOrient", "webkitBoxPack", "webkitBoxReflect", "webkitBoxShadow", "webkitBoxSizing", "webkitClipPath", "webkitColumnBreakAfter", "webkitColumnBreakBefore", "webkitColumnBreakInside", "webkitColumnCount", "webkitColumnGap", "webkitColumnRule", "webkitColumnRuleColor", "webkitColumnRuleStyle", "webkitColumnRuleWidth", "webkitColumnSpan", "webkitColumnWidth", "webkitColumns", "webkitFilter", "webkitFlex", "webkitFlexBasis", "webkitFlexDirection", "webkitFlexFlow", "webkitFlexGrow", "webkitFlexShrink", "webkitFlexWrap", "webkitFontFeatureSettings", "webkitFontSmoothing", "webkitHyphenateCharacter", "webkitJustifyContent", "webkitLineBreak", "webkitLineClamp", "webkitLocale", "webkitLogicalHeight", "webkitLogicalWidth", "webkitMarginAfter", "webkitMarginBefore", "webkitMarginEnd", "webkitMarginStart", "webkitMask", "webkitMaskBoxImage", "webkitMaskBoxImageOutset", "webkitMaskBoxImageRepeat", "webkitMaskBoxImageSlice", "webkitMaskBoxImageSource", "webkitMaskBoxImageWidth", "webkitMaskClip", "webkitMaskComposite", "webkitMaskImage", "webkitMaskOrigin", "webkitMaskPosition", "webkitMaskPositionX", "webkitMaskPositionY", "webkitMaskRepeat", "webkitMaskSize", "webkitMaxLogicalHeight", "webkitMaxLogicalWidth", "webkitMinLogicalHeight", "webkitMinLogicalWidth", "webkitOpacity", "webkitOrder", "webkitPaddingAfter", "webkitPaddingBefore", "webkitPaddingEnd", "webkitPaddingStart", "webkitPerspective", "webkitPerspectiveOrigin", "webkitPerspectiveOriginX", "webkitPerspectiveOriginY", "webkitPrintColorAdjust", "webkitRtlOrdering", "webkitRubyPosition", "webkitShapeImageThreshold", "webkitShapeMargin", "webkitShapeOutside", "webkitTapHighlightColor", "webkitTextCombine", "webkitTextDecorationsInEffect", "webkitTextEmphasis", "webkitTextEmphasisColor", "webkitTextEmphasisPosition", "webkitTextEmphasisStyle", "webkitTextFillColor", "webkitTextOrientation", "webkitTextSecurity", "webkitTextSizeAdjust", "webkitTextStroke", "webkitTextStrokeColor", "webkitTextStrokeWidth", "webkitTransform", "webkitTransformOrigin", "webkitTransformOriginX", "webkitTransformOriginY", "webkitTransformOriginZ", "webkitTransformStyle", "webkitTransition", "webkitTransitionDelay", "webkitTransitionDuration", "webkitTransitionProperty", "webkitTransitionTimingFunction", "webkitUserDrag", "webkitUserModify", "webkitUserSelect", "webkitWritingMode", "whiteSpace", "whiteSpaceCollapse", "widows", "width", "willChange", "wordBreak", "wordSpacing", "wordWrap", "writingMode", "x", "y", "zIndex", "zoom"]

    props.forEach(prop => {
        if(prop === "translate") return
        HTMLElement.prototype[prop] = function(value) {
            this.style[prop] = value;
            Registry.initReactivity(this, ["style", prop], value);
            return this;
        };
    });
}
extendHTMLElementWithStyleSetters();

HTMLElement.prototype.padding = function(direction, value) {
    const directionName = `padding${direction.charAt(0).toUpperCase()}${direction.slice(1)}`;
    if (typeof value === 'number') {
        this.style[directionName] = `${value}px`;
    } else {
        this.style[directionName] = value;
    }
    Registry.initReactivity(this, ["style", directionName], value);
    return this
}

HTMLElement.prototype.width = function(value, unit = "px") {
    this.style.width = value + unit
    Registry.initReactivity(this, ["style", "width"], value);
    return this
}

HTMLElement.prototype.height = function(value, unit = "px") {
    this.style.height = value + unit
    Registry.initReactivity(this, ["style", "height"], value);
    return this
}

function checkStyle(el) {
    let computed = window.getComputedStyle(el).position
    if(!(computed === "absolute" || computed === "fixed")) {
        el.style.position = "absolute"
    }
}

HTMLElement.prototype.x = function(value, unit = "px") {
    checkStyle(this)
    this.style.left = value + unit
    Registry.initReactivity(this, ["style", "left"], value);
    return this
}

HTMLElement.prototype.y = function(value, unit = "px") {
    checkStyle(this)
    this.style.top = value + unit
    Registry.initReactivity(this, ["style", "top"], value);
    return this
}

HTMLElement.prototype.xRight = function(value, unit = "px") {
    checkStyle(this)
    this.style.right = value + unit
    Registry.initReactivity(this, ["style", "right"], value);
    return this
}

HTMLElement.prototype.yBottom = function(value, unit = "px") {
    checkStyle(this)
    this.style.bottom = value + unit
    Registry.initReactivity(this, ["style", "bottom"], value);
    return this
}

HTMLElement.prototype.margin = function(direction, value) {
    const directionName = `margin${direction.charAt(0).toUpperCase()}${direction.slice(1)}`;
    if (typeof value === 'number') {
        this.style[directionName] = `${value}px`;
    } else {
        this.style[directionName] = value;
    }
    Registry.initReactivity(this, ["style", directionName], value);
    return this
}

HTMLElement.prototype.positionType = function (value) {
    if(!(value === "absolute" || value === "relative" || value === "static" || value === "fixed" || value === "sticky")) {
        console.error("HTMLElement.overlflow: must have valid overflow value!")
        return;
    }
    this.style.position = value
    Registry.initReactivity(this, ["style", "position"], value);
    return this
}

/* PROTOTYPE EVENTS */

HTMLElement.prototype.onClick = function(func) {
    this.addEventListener("click", func)
    return this
}

HTMLElement.prototype.onHover = function(cb) {
    this.addEventListener("mouseover", () => cb(true))
    this.addEventListener("mouseleave", () => cb(false))
    return this
}

/* PARSE */

Registry.parseClassFields = function(classObject) {
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

Registry.parseConstructor = function(classObject) {
    let str = classObject.toString();
    const lines = str.split('\n');
    let modifiedLines = [];
    let braceDepth = 0;
    let constructorFound = false
    let superCallFound = false;
    let constructorEndFound = false;

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
            modifiedLines.push(`    window.Registry.construct(this);`);
        }

        if (constructorFound && braceDepth === 1 && superCallFound && !constructorEndFound) {
            modifiedLines.splice(modifiedLines.length - 1, 0, '    Object.preventExtensions(this);');
            modifiedLines.splice(modifiedLines.length - 1, 0, '    window.Registry.testInitialized(this);');
            constructorEndFound = true
        }
    }

    if(superCallFound) {
        let modifiedStr = modifiedLines.join('\n');
        modifiedStr = '(' + modifiedStr + ')'
        modifiedStr += `//# sourceURL=${classObject.prototype.constructor.name}.shadow`
        return eval(modifiedStr);
    }

    if(constructorFound) {
        throw new Error("Quill: Constructor must have super()! " + lines[0])
    } else {
        let constructorString = `
        constructor(...params) {
            super(...params)
            window.Registry.construct(this)
            Object.preventExtensions(this);
            window.Registry.testInitialized(this);
        }
        `
        let closingBracket = str.lastIndexOf("}");
        str = str.slice(0, closingBracket - 1) + constructorString + "\n}"
        return eval('(' + str + `) //# sourceURL=${classObject.prototype.constructor.name}.shadow`);
    }
}

Registry.getRender = function(classObject) {
    const classString = classObject.toString();

    const regular = /render\s*\(\s*\)\s*\{/;
    const arrow = /render\s*=\s*\(\s*\)\s*=>\s*\{/;
    const matches = classString.match(regular) || classString.match(arrow);

    if(matches && matches.length === 1) {
        return classString.substring(matches.index)
    } else {
        console.error("Quill: render funcion not defined properly!")
    }
}

Registry.parseRender = class ParseRender {
    str;
    i = 0;
    functionStack;
    result;

    /*
        [
            [Function scope, value used]
            ["VStack.ForEach", "form.children"],
            ["VStack.ForEach.SidebarFile", "form.color"]
            ["VStack.x", windowState.sidebarOut]
        ]
    */

    constructor(classObject) {
        this.str = Registry.getRender(classObject.toString()).replace(/\s/g, "");
        this.functionStack = ""
        this.result = []
    }

    parse() {
        this.parseFunction()
        return this.result
    }

    parseFunction() {
        console.log(this.str)
        this.copyTo("{")
        let firstEl = this.copyTo("(")
        console.log(firstEl)

        if(!firstEl) {
            console.log("Empty render function")
            return
        }
        
        if(firstEl.includes("Stack")) {
            this.parseFunction()
        } else if(firstEl.includes("ForEach")) {
            let array = this.copyTo(",")
            if(array.includes("this")) {
                console.log(this.result)
                this.result.push([this.functionStack + "ForEach", array.replace("this.", "")])
            }
            this.parseFunction()
        } else if(firstEl === "switch") {
            
        } else if(firstEl === ("if")) {
            console.log("if")
        }
    }

    copyTo = function(char) {
        this.i = this.str.indexOf(char)
        let copied = this.str.substring(0, this.str.indexOf(char));
        this.str = this.str.slice(this.i + 1); // Update the string to exclude the copied part and the character
    
        return copied
    }

    // firstParam(str, i, stack, total) {
    //     console.log(str[i])
    //     switch(str[i]) {
    //         case "(":
    //             console.log("function")
    //             break;
    //         case "\"":
    //             console.log("string")
    //             break;
    //         default:
    //             if (!isNaN(input)) {
    //                 console.log("Number");
    //             } else {
    //                 console.log("Variable");
    //             }
    //     }
    // }

}

window.register = Registry.register
window.rendering = []


// const usage = [];
// const lines = renderFunctionToClassEnd.split('\n');

// let currentFunction = null;
// let currentFunctionChain = []; // To keep track of nested function names

// for (const line of lines) {
//     const functionMatch = line.match(/^\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*\(\s*\)\s*=>\s*{/);
//     if (functionMatch) {
//         currentFunction = functionMatch[1];
//         currentFunctionChain.push(currentFunction);
//     }

//     if (line.includes('this')) {
//         if (currentFunction) {
//             const thisUsage = line.match(/this\.[a-zA-Z_$][0-9a-zA-Z_$]*(?:\.[a-zA-Z_$][0-9a-zA-Z_$]*)*/g);
//             if (thisUsage) {
//                 for (const usageItem of thisUsage) {
//                     const propertyChain = usageItem.replace('this.', '');
//                     const completeChain = [...currentFunctionChain, propertyChain];
//                     usage.push(completeChain);
//                 }
//             }
//         } else {
//             const thisUsage = line.match(/this\.[a-zA-Z_$][0-9a-zA-Z_$]*/g);
//             if (thisUsage) {
//                 for (const usageItem of thisUsage) {
//                     const propertyChain = usageItem.replace('this.', '');
//                     usage.push([propertyChain]);
//                 }
//             }
//         }
//     }
// }