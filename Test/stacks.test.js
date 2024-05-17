window.testSuites.push( class testStacks {

    NestedChildren() {
        register(class File extends Shadow {
            $name

            render = () => {
                p(this.name)

                VStack(() => {
                    p("Learn to code inside of a startup")
        
                    p("➵")
                        .position("absolute")
                        .fontSize(30)
                        .left("50%")
                        .top("50%")
                        .transformOrigin("center")
                        .transform("translate(-50%, -50%) rotate(90deg)")
                        .transition("all 1s")
                        .userSelect("none")
                        .onAppear((self) => {
                            setTimeout(() => {
                                self.style.top = "88%"
                            }, 100)
                        })
                })
            }
        
            constructor() {
                super()
            }
        }, randomName("file"))

        const file = File("asdf")
        if(file.querySelector(".VStack")?.children.length !== 2) {
            return "Incorrect amount of children inside vstack!"
        }
    }
    
})