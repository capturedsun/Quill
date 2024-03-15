
/* Class */
// - Force initialization of all variables. Throw error if not enough params passed in

/* State (denoted by "$" in front of the name) */
// - Sync with attributes
// - Proxies to enforce type
//     w/ initializers like [] {} 0 ""

// How would one detect class object changes?
// Does object detection go all layers down?

    // Swift: Yes, if you change the inner it will rerender the outer.
    // struct ContentView: View {
    //     @State private var outerState = OuterStruct()

    //     var body: some View {
    //         Text(outerState.innerState.property)
    //             .onTapGesture {
    //                 outerState.innerState.property = "New Value"
    //             }
    //     }
    // }

    // struct OuterStruct {
    //     var innerState = InnerStruct()
    // }

    // struct InnerStruct {
    //     var property = "Initial Value"
    // }

// Reactivity:
// Parse lines which use the variables?
// Rerender whole thing?

// Lit does only parts which depend, React does whole thing then compares

// Binding
// Objects are passed by reference, str and int by value


