
/* 

"(" is preceding character: el, el.attr, if, switch
    el: the el is window.rendering
    el.attr: 
        find the function and attr in the string
            if there are multiple instances of being used with this el, add to a list (and if no list then make it and we are first)
    if: the el is window.rendering. rerender el
    switch: the el is window.rendering. rerender el
*/

window.testSuites.push(


class ParseRender {

    ParseRender() {
        class Sidebar extends Shadow {
            $$windowState = windowState
            $$form = Forms.observe(window.location.pathname)
            $sidebarPos = -200
        
            render = () => {
                VStack(() => {
                    ForEach(this.form.children, (form) => {
                        switch(form.constructor.name) {
                            case "File":
                                SidebarFile(form)
                                break
                            case "Space":
                                SidebarSpace(form)
                                break
                        }
                    })
                })
                .background("black")
                .positionType("absolute")
                .x(this.windowState.sidebarOut ? 0 : -200)
                .y(0)
                .width(200, "px")
                .height(100, "vh")
            }
        }
        
        let result = new Registry.parseRender(Sidebar).parse()
        console.log(result)

        let expectedOutput = "[[VStack.ForEach, form.children], [VStack.x, windowState.sidebarOut]]"

        if(JSON.stringify(result) !== JSON.stringify(expectedOutput)) {
            return "Result does not match expected array!"
        }
    }

    // only functions which return a view may be called
    // no addEventListener usage
}

)