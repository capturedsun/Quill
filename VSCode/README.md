# Quill
For syntax highlighting Quill functions, as well as html and css strings.
Forked from this repository:
> [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html)

## Boilerplate:
- ```*html```: Type in an HTML file and select the suggestion to create HTML boilerplate. 
- ```*element```: Type in a JS file and select the suggestion to create JS Custom Element boilerplate.

## Functions: 
Clone this repository into the top level of the project you are working on, so the HTML can find the "quill.js" functions.
Use backticks with both to get HTML and CSS syntax highlighting.
- ```css() or addStyle()```: Adds a style to a Quill style tag in the head.
- ```html()```: Creates a parsed HTML element (which is not yet in the DOM)