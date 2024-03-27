window.testSuites.push( class testRender {

    SimpleParagraphWithState() {
        class File extends Shadow {
            $form

            render = () => {
                p(this.form.data)
            }
        
            constructor() {
                super()
            }
        }

        window.register(File, randomName("file"))
        let form = {data: "asdf"}
        const el = window.File(form)

        if(!(el.firstChild?.matches("p"))) {
            return `Child paragraph not rendered`
        }
        if(!(el.firstChild.innerText === "asdf")) {
            return "Child para does not have inner text"
        }
    }

    ParagraphConstructorChangeState() {
        register(class File extends Shadow {
            $name

            render = () => {
                p(this.name)
            }
        
            constructor() {
                super()
            }
        }, randomName("file"))


        let name = "asdf"
        const file = File(name)
        file.name = "hey123"

        if(file.firstChild.innerText !== "hey123") {
            return "Paragraph did not react to change!"
        }
    }

    LiteralDoesNotCreateFalseReactivity() {
        register(class File extends Shadow {
            $name = "asd"

            render = () => {
                p(this.name)
                p("asd")
            }
        
            constructor() {
                super()
            }
        }, randomName("file"))


        const file = File()
        file.name = "hey123"

        if(file.children[1].innerText === "hey123") {
            return "Paragraph innertext falsely changed"
        }
    }

    DefaultObservedObject() {
        window.Form = class Form extends ObservedObject {
            id
            path
            $canvasPosition
        }

        class File extends Shadow {
            $$form = Form.decode({id: "123", path: "/", canvasPosition: "25|25"})

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
            $children
            $canvasPosition
        }

        let object = Form.decode({id: "123", path: "/", children: [], canvasPosition: "25|25"});

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

    // ObservedObjectWithArray() {
    //     let Form = class Form extends ObservedObject {
    //         id
    //         $path
    //         $children
    //         $canvasPosition
    //     }

    //     let object = Form.decode({id: "123", path: "/", children: [], canvasPosition: "25|25"});

    //     register(class File extends Shadow {
    //         $$form
        
    //         render = () => {
    //             p(this.form.path)
    //         }
    //     }, randomName("file"))

    //     let file = File(object)

    //     if(file.firstChild?.innerText !== "/") {
    //         return "Path is not inside of paragraph tag"
    //     }

    //     file.form.children.push("hello")

    //     object.path = "/asd"
    //     if(file.form.path !== "/asd") {
    //         return "Path did not change when changing original object"
    //     }
    //     if(file.firstChild?.innerText !== "/asd") {
    //         return "Observed Object did not cause a reactive change"
    //     }
    // }
    
})