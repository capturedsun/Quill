window.testSuites.push( class testState {

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

    /*
        State itself should check if the reactivity is based on an element or a standalone expression
            If standalone, handle it
            If element, push the info for initReactivity to handle it
    */

    TernaryInState() {
        register(class File extends Shadow {
            $name

            render = () => {
                p(this.name)
                    .fontSize(this.name === "asdf" ? 16 : 32)
            }
        
            constructor() {
                super()
            }
        }, randomName("file"))

        let name = "asdf"
        const file = File(name)

        if(file.style.fontSize !== "16px") {
            return "fail"
        }
    }
    
})