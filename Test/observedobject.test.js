window.testSuites.push( class testObservedObject {

    FromJSONFailsWithoutAllFields() {
        class Form extends ObservedObject {
            id
            path
            $canvasPosition
        }

        try {
            let obj = Form.create({id: "123"})
            return "Not implemented"
        } catch {}
    }

    FromJSONInitsAllFields() {
        class Form extends ObservedObject {
            id
            path
            $canvasPosition
        }

        let obj = Form.create({id: "123", path: "/", canvasPosition: "25|25"})
        if(!(obj && obj["id"] === "123" && obj["path"] === "/" && obj["canvasPosition"] === "25|25")) {
            return "Not all fields initialized!"
        }
    }

    DefaultValueWorks() {
        class WindowState extends ObservedObject {
            $sidebarOut = false
        }

        let obj = WindowState.create()
        console.log(obj)

        if(obj.sidebarOut !== false) {
            return "Default field not set"
        }
    }

    // throw some sort of warning if a global OO is accessed without "this"

    DefaultObservedObject() {
        window.Form = class Form extends ObservedObject {
            id
            path
            $canvasPosition
        }

        class File extends Shadow {
            $$form = Form.create({id: "123", path: "/", canvasPosition: "25|25"})

            render = () => {
                p(this.form.path)
            }
        }

        window.register(File, "file-1")
        let file = window.File()

        if(file.firstChild?.innerText !== "/") {
            return "Path is not inside of paragraph tag"
        }
    }

    ObservedObject() {
        let Form = class Form extends ObservedObject {
            id
            $path
            $canvasPosition
        }

        let object = Form.create({id: "123", path: "/", canvasPosition: "25|25"});

        register(class File extends Shadow {
            $$form
        
            render = () => {
                p(this.form.path)
            }
        }, randomName("file"))

        let file = File(object)

        if(file.firstChild?.innerText !== "/") {
            return "Path is not inside of paragraph tag"
        }

        object.path = "/asd"
        if(file.form.path !== "/asd") {
            return "Path did not change when changing original object"
        }
        if(file.firstChild?.innerText !== "/asd") {
            return "Observed Object did not cause a reactive change"
        }
    }

    ObservedObjectWithArray() {
        let Form = class Form extends ObservedObject {
            id
            $children
        }

        let object = Form.create({id: "123", children: [{path: "berry"}, {path: "blue"}]});

        register(class File extends Shadow {
            $$form
        
            render = () => {
                ForEach(this.form.children, (child) => {
                    p(child.path)
                })
            }
        }, randomName("file"))

        let file = File(object)

        if(file.firstChild?.innerText !== "berry" || file.children[1].innerText !== "blue") {
            return "Paths did not render correctly in children"
        }

        file.form.children.push({path: "hello"})
        if(file.children.length !== 3) {
            return "No reactivity for adding children"
        }
    }

    NotExtensible() {
        return "not done"
    }


    // MustInitAllFields() {
    //     class Form extends ObservedObject {
    //         id
    //         path
    //         $canvasPosition
    //     }

    //     let obj = Form.create({id: "123", path: "/", canvasPosition: "25|25"})
    //     if(!(obj && obj["id"] === "123" && obj["path"] === "/" && obj["canvasPosition"] === "25|25")) {
    //         return "Not all fields initialized!"
    //     }
    // }

    // ChangingObjChangesInstance() {
    //     class Form extends ObservedObject {
    //         id
    //         path
    //         $canvasPosition
    //     }

    //     let json = {id: "123", path: "/", canvasPosition: "25|25"}
    //     let obj = Form.create({id: "123", path: "/", canvasPosition: "25|25"})
    //     json.id = "456"
    //     if(!(obj["id"] === "456")) {
    //         return "Change to original object was not reflected!"
    //     }
    // }
    
})