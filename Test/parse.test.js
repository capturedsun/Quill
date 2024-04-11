window.testSuites.push( class testParse {

    testParseConstructor() {
        class Space extends Shadow {
            form
            contents = []
        
            constructor(...params) {
                super(...params)
            }
        }

        let newClass = window.Registry.parseConstructor(Space)
        if(!newClass.prototype.constructor.toString().includes("window.Registry.construct(")) {
            return "'window.Registry.construct(' not detected!"
        }
    }

    testParseConstructorIfNoneProvided() {
        class Space extends Shadow {
            $form
        }

        let newClass = window.Registry.parseConstructor(Space)
        if(!newClass.prototype.constructor.toString().includes("window.Registry.construct(")) {
            return "'window.Registry.construct(' not detected!"
        }
    }

    testParseConstructorFailsIfNoSuper() {
        class Space extends Shadow {
            form
            contents = []
        
            constructor() {
            }
        }

        try {
            let newClass = window.Registry.parseConstructor(Space)
            return "No error thrown!"
        } catch(e) {

        }    
    }

    testParseClassFieldsWithNoDefault() {
        class Space extends Shadow {
            form
            contents = []
        
            constructor(...params) {
                super(...params)
            }
        }

        const fields = window.Registry.parseClassFields(Space);
        if(!(JSON.stringify(fields) === JSON.stringify(["form", "contents"]))) {
            return `Fields don't match`
        }
    }

    testParseClassFieldsWithEqualityCheck() {
        class Space extends Shadow {
            form = Forms.observe(window.location.pathname, this)
        
            contents = [
                ...this.form.children.map(form => {
                    switch(form.type) {
                        case "file" === "file":
                            return File(form)
                        case "space":
                            return ChildSpace(form)
                        case "link":
                            return Link()
                    }
                })
            ]
        
            constructor(...params) {
                super(...params)
            }
        }

        const fields = window.Registry.parseClassFields(Space);
        if(!(JSON.stringify(fields) === JSON.stringify(["form", "contents"]))) {
            return `Fields don't match`
        }
    }

    testParseClassFieldsWithInnerFunctionVariable() {
        class Space extends Shadow {
            form = Forms.observe(window.location.pathname, this)
        
            contents = [
                ...this.form.children.map(form => {
                    let file;
                    file = "hey"
                    switch(form.type) {
                        case "file" === "file":
                            return File(form)
                        case "space":
                            return ChildSpace(form)
                        case "link":
                            return Link()
                    }
                })
            ]
        
            constructor(...params) {
                super(...params)
            }
        }

        const fields = window.Registry.parseClassFields(Space);
        if(!(JSON.stringify(fields) === JSON.stringify(["form", "contents"]))) {
            return `Fields don't match`
        }
    }

    ParseConstructorWithFunctionsBelow() {
        class Space extends Shadow {
            $$form = Forms.observe(window.location.pathname, this)
        
            render = () => {
                ForEach(this.form.children, (form) => {
                    switch(form.type) {
                        case "file":
                            File(form)
                            break
                        case "space":
                            ChildSpace(form)
                            break
                        case "link":
                            Link()
                            break
                    }
                })
            }
        
            constructor() {
                super()
            }
        
            connectedCallback() {
            }
        }
        
        window.Registry.parseConstructor(Space)
    }

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

})