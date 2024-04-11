
<p align="center">
<img src="VSCode/docs/Quill.png" alt="drawing" width="100"/> 
<h1 align="center">Quill</h1>
</p>
<br>

Usage: Install the VSCode extension "Quill".

## Rendering Elements:
```
document.body.append(
    p("Hi")
        .padding("top", 12),

    Link({href: "google.com", name: "hey"})
        .background("green")
    
    // NavigationBar()
    //     .onClick()
)
```

## Needs Support:
Ternaries within render()
Other statements within render()

## Boilerplate:
- ```*html```: Type in an HTML file and select the suggestion to create HTML boilerplate. 
- ```*element```: Type in a JS file and select the suggestion to create JS Custom Element boilerplate.

## Functions: 
Clone this repository into the top level of the project you are working on, so the HTML can find the "quill.js" functions.
Use backticks with both to get HTML and CSS syntax highlighting.
- ```css() or addStyle()```: Adds a style to a Quill style tag in the head.
- ```html()```: Creates a parsed HTML element (which is not yet in the DOM)


