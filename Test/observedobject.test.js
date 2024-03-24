window.testSuites.push( class testObservedObject {

    FromJSONFailsWithoutAllFields() {
        class Form extends ObservedObject {
            id
            path
            $canvasPosition
        }

        try {
            let obj = Form.decode({id: "123"})
            return "Not implemented"
        } catch {}
    }

    FromJSONInitsAllFields() {
        class Form extends ObservedObject {
            id
            path
            $canvasPosition
        }

        let obj = Form.decode({id: "123", path: "/", canvasPosition: "25|25"})
        if(!(obj && obj["id"] === "123" && obj["path"] === "/" && obj["canvasPosition"] === "25|25")) {
            return "Not all fields initialized!"
        }
    }

    // WorksWithShadow() {
    //     window.Form = class Form extends ObservedObject {
    //         id
    //         path
    //         $canvasPosition
    //     }

    //     class File extends Shadow {
    //         $$form = Form.decode({id: "123", path: "/", canvasPosition: "25|25"})
    //     }

    //     window.register(File, "file-1")
    //     let file = window.File()
    //     console.log(file, p())

    //     return "Not yet"
    // }

    // ChangingObjChangesInstance() {
    //     class Form extends ObservedObject {
    //         id
    //         path
    //         $canvasPosition
    //     }

    //     let json = {id: "123", path: "/", canvasPosition: "25|25"}
    //     let obj = Form.decode({id: "123", path: "/", canvasPosition: "25|25"})
    //     json.id = "456"
    //     if(!(obj["id"] === "456")) {
    //         return "Change to original object was not reflected!"
    //     }
    // }
    
})