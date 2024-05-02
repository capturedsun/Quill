window.testSuites.push(


class ParseRender {
    // CopyTo() {
    //     let str = "render=()=>{VStack(()=>{"
    //     let ret = str.copyTo("{")

    //     if(ret !== "render=()=>") return "Copy 1 failed!"
    // }

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