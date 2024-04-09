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