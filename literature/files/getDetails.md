get details stripe api id product::

const stripe = require('stripe')('sk_test_51QGeStJr4Lyco16uVQZhQ1KbnBMMsdRKU5UB87lrUSxG5ICm964y5abBfqOIOauboqBa8xamc9V18c7zmfrnaJKf00bZYvoOIo');

const product = await stripe.products.retrieve('prod_NWjs8kKbJWmuuc');

Update a product 
Updates the specific product by setting the values of the parameters passed. Any parameters not provided will be left unchanged.

values 


get specific product products/:id
GET 
/v1/products/:id
Server-side language

Node.js
const stripe = require('stripe')('sk_test_51QGeStJr4Lyco16uVQZhQ1KbnBMMsdRKU5UB87lrUSxG5ICm964y5abBfqOIOauboqBa8xamc9V18c7zmfrnaJKf00bZYvoOIo');
const product = await stripe.products.retrieve('prod_NWjs8kKbJWmuuc');
//return product object


products/:id

