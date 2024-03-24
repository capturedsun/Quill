window.testSuites.push( class testRender {

    SimpleParagraphWithState() {
        class File extends Shadow {
            $form

            render = () => {
                console.log("render", window.rendering)
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
                console.log("render", window.rendering)
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
                console.log("render", window.rendering)
                p(this.name)
                p("asd")
            }
        
            constructor() {
                super()
            }
        }, randomName("file"))


        const file = File()
        file.name = "hey123"

        let childs = Array.from(file.children)
        childs.forEach((el) => {
            console.log(el.innerText)
        })

        if(file.children[1].innerText === "hey123") {
            return "Paragraph innertext falsely changed"
        }
    }
    
})