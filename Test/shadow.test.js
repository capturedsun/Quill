window.testSuites.push( class testShadow {

    testObjectAsStateField() {
        class File extends Shadow {
            $form
        
            constructor(...params) {
                super(...params)
            }
        }

        window.register(File, "file-el")
        let form = {data: "asdf"}
        const el = window.File(form)
        console.log(el, el.$form, el._form)
        if(!(el.form === form)) {
            return `State field does not match object passed in!`
        }
    }

    testRegisterThrowsIfNoConstructorParams() {
        class File2 extends Shadow {
            $form
        
            constructor() {
                super()
            }
        }

        try {
            window.register(File2, "file2-el")
        } catch(e) {}
        
        return "Error not thrown!"
    }
    
})