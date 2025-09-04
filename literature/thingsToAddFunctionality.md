1::we must add a profile page so that anyone who has posted a product can click "my products" 
1.1: when they click my products they should be able to click edit, because "my products" is just a boolean, it either shows their product as usual, or it shows the entire products just as the create product form where you can change, edit and remove everything, then, once they click save, that new product is then added as a patch, I assume that is patch::
PATCH
The PATCH method applies partial modifications to a resource.

1.2:: also: whenever a user scrolls through products they should be able to click: "favourite", or the heart symbol, then it will be saved as a favourite, perhaps a snow crystal for our page 




solution 1.1:: we need to display images from an array, they need to have a cross on them so we can easily remove them, when we remove them we first only remove them from our current component state array, then whenever someones clicks "save" then the edit of the product object will be sent out globally, to the database online, then our product has been changed completely, localhost and https method globally patch, then perhaps we have a refresh of page for new product,

we must display iamges from our array that we create, like this: 
good tip on images in next.js with image optimazation, set height and width of image in advance, or::
set layout fill, then it fills parent component, presumably container div set to wanted preferences,
ALSO::: have each product image carry its own ID, can you just rewrite image array in firebase? or must you specify what image id to delete? anyhow, we have our stripe product with metadata,
ALSO:: make sure to reuse the product upload component, make it the same, just now the if condition notices that we have a productId before even starting to upload the product, therefore we are editing, or just check the param in the url ::
URL parameters (also known as “query strings”) are a way to structure additional information for a given URL. Parameters are added to the end of a URL after a ‘?’ symbol, and multiple parameters can be included when separated by the ‘&’ symbol.