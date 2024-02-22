Attribute/State Cases:

Dual Instantiation
- HTML-first instantiation from attributes (when first loaded and parsed)
    observedAttributes will pick this up
- JS-first instantiation where attributes are set from constructor (or) from init function (or)
  press puts attributes on from state before saving
    init function can set attributes and variables - perhaps state is always required to be passed in

Usage Flexibility
- attributes can have default values
    $url = "hey"
- attributes can be named or unnamed when passed in to constructor functions

Attribute / State Reflexivity
- when attribute is changed, state value is changed
    modify prototype at runtime? Add overrides for setattr and remove? ||
        use observedAttributes + attributeChanged (not good) - Forms parent element?
- when state is changed, attribute value is changed
    modify prototype at runtime to add a setter for the state such that when it is set it sets the attribute

Bindings
- should be able to have a child variable be bound to that of a parent

Binding is denoted by  prior to variable
State is denoted by "$" prior to variable