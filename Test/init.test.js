window.testSuites.push( class testInit {

    ObjectAsStateField() {
        class File extends Shadow {
            $form
        
            constructor(...params) {
                super(...params)
            }
        }

        window.register(File, "file-el")
        let form = {data: "asdf"}
        const el = window.File(form)
        if(!(el.form === form)) {
            return `State field does not match object passed in!`
        }
    }

    MultiParams() {
        class File2 extends Shadow {
            $form
            $tag
        
            constructor(...params) {
                super(...params)
            }
        }

        window.register(File2, "file2-el")
        let form = {data: "asdf"}
        const el = window.File2(form, "tag")
        if(!(el.form === form)) {
            return `Form field does not match object passed in!`
        }
        if(!(el.tag === "tag")) {
            return `Tag field does not match object passed in!`
        }
    }

    onlyGetFieldsNotUsing$() {
        class File5 extends Shadow {
            $form
            $tag
        
            constructor(...params) {
                super(...params)
            }
        }

        window.register(File5, "file5-el")
        let form = {data: "asdf"}
        const el = window.File5(form, "tag")
        if(el.$tag !== undefined) {
            return "Got field the wrong way!"
        }
    }

    ChangeAttrChangesField() {
        class File3 extends Shadow {
            $form
            $tag
        
            constructor(...params) {
                super(...params)
            }
        }

        window.register(File3, "file3-el")
        let form = {data: "asdf"}
        const el = window.File3(form, "tag")
        el.setAttribute("tag", "asdf")
        if(el.tag !== "asdf") {
            return "Field did not change!"
        }
    }

    ChangeFieldChangesAttr() {
        class File4 extends Shadow {
            $form
            $tag
        
            constructor(...params) {
                super(...params)
            }
        }

        window.register(File4, "file4-el")
        let form = {data: "asdf"}
        const el = window.File4(form, "tag")
        el.tag = "asdf"
        if(el.getAttribute("tag") !== "asdf") {
            return "Attribute did not change!"
        }
    }

    ConstructorCanUseState() {
        class File7 extends Shadow {
            $form = {data: "asdf"}
            extra

            constructor() {
                super()
                this.extra = this.form
            }
        }

        window.register(File7, "file7-el")
        const el = window.File7()
        if(el.extra === undefined) {
            return `Constructor could not access state`
        }
    }

    DefaultStateFieldWorks() {
        class File6 extends Shadow {
            $form = {data: "asdf"}
        }

        window.register(File6, "file6-el")
        const el = window.File6()
        if(el.form === undefined) {
            return `Default value did not work`
        }
    }

    // this needs to be fixed
    // CannotAddUndefinedProperties() {
    //     register(class File extends Shadow {

    //         render = () => {
    //             p("boi")
    //         }
        
    //         constructor() {
    //             super()
    //             this.hey = "unallowed"
    //         }
    //     }, randomName("file"))

    //     try {
    //         const file = File()
    //         return "Did not throw error!"
    //     } catch(e) { 
    //         if(!e.message.includes("Extensible")) {
    //             throw e
    //         }
    //     }
    // }

    CannotAddUndefinedPropertiesAfterConstructor() {
        register(class File extends Shadow {

            render = () => {
                p("boi")
            }
        
            constructor() {
                super()
            }
        }, randomName("file"))

        try {
            const file = File()
            file.hey = "unallowed"
            return "Did not throw error!"
        } catch(e) { 
            if(!e.message.includes("extensible")) {
                throw e
            }
        }
    }

    NonStateFieldsGetSet() {
        register(class File extends Shadow {
            nonStateField
        
            constructor() {
                super()
            }
        }, randomName("file"))

        const file = File("asd")
        if(!(file.nonStateField === "asd")) {
            return "Did not set field!"
        }
    }

    AllFieldsMustBeSet() {
        register(class File extends Shadow {
            $field1
            $field2
        
            constructor() {
                super()
            }
        }, randomName("file"))

        try {
            const file = File("asd")
            console.log(file.field1, file.field2)
            return "No error thrown"
        } catch(e) {
            if(!e.message.includes("field2\" must be initialized")) {
                throw e
            }
        }
    }

    ErrorIfNotObservedObject() {
        window.register(class ChildSpace extends Shadow {
            $$form
            $name
        
            render = () => {
              
            }
        
            constructor() {
                super()
                this.name = this.form.path.split("/").pop()
            }
        }, randomName("space-"))

        try {
            let space = ChildSpace({path: "/asd"})
            return "no error thrown!"
        } catch(e) {
            if(e.message.includes("Observed Object")) {
            } else {
                throw e
            }
        }
    }

    FieldsInCorrectOrder() {
        window.register(class ChildSpace extends Shadow {
            $$form
            $name
        
            render = () => {
              
            }
        
            constructor() {
                super()
                this.name = this.form.path.split("/").pop()
            }
        }, randomName("space-"))

        class Form extends ObservedObject {
            $path
        }
        
        try {
            let space = ChildSpace(Form.decode({path: "/asd"}))
        } catch(e) {
            if(e.message.includes("Cannot read properties of undefined (reading 'path')")) {
                return "Form did not get initialized!"
            } else {
                throw e
            }
        }
    }
})