current goal::
we have our postProduct upload product component, we want to add so that whenever we are just editing, we do a patch method instead of post method when we save the product changes


aall we had to do was change the endpoint 


remember:: start simple small, basic truth, we know http method requires different endpoint
we know we still have a product object it is convenient to send over






























add cart functionality, check the cart that was included in previous norland mvp










about context react:: send data through the component tree without having to send data manually at every level

data at every level, flawlessly















add a product that is linked to a firebase user firebase stripe 


add a product stripe api doc::

link::
https://docs.stripe.com/api/products/create
https://docs.stripe.com/api/products/create




product object::
{
  "id": "prod_NWjs8kKbJWmuuc",
  "object": "product",
  "active": true,
  "created": 1678833149,
  "default_price": null,
  "description": null,
  "images": [],
  "marketing_features": [],
  "livemode": false,
  "metadata": {},
  "name": "Gold Plan",
  "package_dimensions": null,
  "shippable": null,
  "statement_descriptor": null,
  "tax_code": null,
  "unit_label": null,
  "updated": 1678833149,
  "url": null
}
----we have the id 


product id, create custom id, include firebase reference before special sign, to grab only part of id for firebase reference::

Product IDs
Each product has a unique ID. Unlike most Stripe resources, you can choose the ID of the product yourself. We recommend choosing an ID that makes it easy to integrate Stripe with other systems you use. For example, if you’re selling physical goods, you can use the internal ID from your own systems.

strip3e connect



stripe connect, onboarding collecting payument, payment sellecrs lines of revenue enabling in-person payment

stripe dedicate extra resources tax risk


https://docs.stripe.com/payments/checkout
checkout form hosted stripe embedded into website



elements react stripe.js 

wrapper around stripe elements react app

checkout stripe checkout holds information stripe 

stripe checkoput:: 




1:: make it so next.js uses https on load

2:: connect firebase to next.js so you can sign up a user with a tailwind form
























solutions::

1:: make it so next.js sites uses https locally::
1 solution:: first, install mkcert, create ca and ssl certificate
https://dev.to/nakib/using-https-on-next-js-local-development-server-bcd

2:: connect firebase to next.js so you can sign up a user with a tailwind form
use link:: 
https://dev.to/wadizaatour/integrating-nextjs-with-firebase-a-practical-walkthrough-4j30
then write:: npm install firebase





npm install firebase








