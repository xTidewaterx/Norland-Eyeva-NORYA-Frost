


How to create favourite products for users in firebase:


Frontend::
-have a favorite button on each item, a heart symbol perhaps
-when pressed this calls a firebase function that adds the clicked product's respective id to a users subcollection in firebase, like this  collection setup: "username/favorites (inside this subcollection you add product id's as documents)"
-basically you now have product ids (meaning favorite products) as documents in the users subcollection titles favorites


backend::
next js api routes, can for example be a file titled request.js in the folder structure: pages/api/request.js





-in this scenario we could use a route  (that responds to the frontend POST request*) to to have the functionality of contacting firebase using the firebase SDK, and then return that response to the frontend, confirming data added successfully  through firebase using the api/request.js next.js route like this:: 


```
import type { NextApiRequest, NextApiResponse } from 'next' type ResponseData = { message: string} 

export default function handler( req: NextApiRequest, res: NextApiResponse<ResponseData>) { res.status(200).json({ message: 'Favourite item product id added successfully as a document into a Firebase users subcollection titled 'favourites ' '' })}
```



In Next.js, a POST request is utilized when a client needs to send data to the server, typically for creating new resources or submitting form data.




































database connected, collections, linked collections, node tree


removed     <PostProduct />, we are creating best landing page



fix implementation cometchat fix  components, send away any uneccessary components, 

check imports , what version react next.js 

use this guide>> 
https://www.cometchat.com/docs/ui-kit/react/v5/integration/next-js

we have cometchat component we have returns this we import dynamic 

import dynamic

we have 


useEffect with const ukisettings new ui kit settings builder, then cometchatui kit. init, then if user , then set our user  if no user  login if no user 

then when set loggedin user,, we return our comet chat component if ther is a user, we have cometchat ocnversations  that component is 


import React, { useEffect, useState } from "react";
import {
  CometChatUIKit,
  UIKitSettingsBuilder,
  CometChatConversations,
} from "@cometchat/chat-uikit-react";

fix cometchat login use cometchat ui, implement cometchat
integrate cometchat into any app

we must add our config and then our UI, we must feetch our comet key from our backend, await response.json

getg our authKey from our config files

we have a profile unique identifier in database



always add current task here before closing project
currentTask::

fix landing page::



















## FIX THIS::
fix auth, add error handling and add so that http requests are prevented to api server if
component: auth signIn.js and reigster.js create user prevent if intel is worng like make them ifx object properties of confirm password, have saved safe locations, fix tailwind, exmaples big scaled buisnesse4s with good proven professional solutions, we request when data is confirmed on client side first, then server long distance resources


An API server is a specialized type of server that handles requests from client applications and returns appropriate responses, acting as an intermediary between the client and backend services or databases. It exposes a set of endpoints (URLs) that clients can interact with, often organized into routes corresponding to specific resources or functionalities. 

we have a curren user, we must stop requests to create a user if there is wrong confirm password or
if there is an email problem

fix the error and prevent requests when necessary on the sign in and create user components
## FIX THIS



















check vimeo, do so that you sign in, but you can click link and then you create account instead

fix the checkout session so it got the latest data on line items
make it so that 

also perhaps make it into popups only

solution::


































To create prices through the API, use create price.

Togethere wants to charge 10 USD per month for their “starter” service level.

The unit_amount parameter uses the lowest unit of the currency specified for the price. In the case of Togethere, the lowest unit is cents: 10 USD is 1,000 cents, which means their price unit_amount is 1000.

To create the price and assign it to the product, pass the product ID, unit amount, currency, and interval:

server.js



// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = require('stripe')('sk_test_4S68v29DeKcE4RxJcrJnUn5s');

const price = await stripe.prices.create({
  product: '{{PRODUCT_ID}}',
  unit_amount: 1000,
  currency: 'usd',
  recurring: {
    interval: 'month',
  },
});




















//this is our upload new product code, on our postProduct new product, this is the code on our next.js post endpoint route
export async function POST(req) {
    try {
        const { name, description, price, images } = await req.json(); // Parse JSON body
        
        if (!name || !price) {
            return NextResponse.json({ error: "Product name and price are required" }, { status: 400 });
        }

        // Step 1: Create the product in Stripe
        const product = await stripe.products.create({
            name,
            description: description || "", // Default empty description if none provided
            images: images || [],
        });

        // Step 2: Create the price associated with the product
        const priceData = await stripe.prices.create({
            unit_amount: price, // Amount in smallest currency unit (e.g., cents)
            currency: 'usd',
            product: product.id, // Link the price to the product
        });

        // Return product and price info
        return NextResponse.json({ product, price: priceData });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

default_price_data
object
Data used to generate a new Price object. This Price will be set as the default price for this product.

Show child parameters







        const product = await stripe.products.create({
            name,
            description: description || "", // Default empty description if none provided
          images: images,
            default_price_data: {
                unit_amount: price,
                currency: 'usd',
        
              },

        });
        console.log("uploaded a new Stripe productttt:", NextResponse.json(product))

          console.log("uploaded a new Stripe product id:", NextResponse.json(product.id))

















To create prices through the API, use create price.

Togethere wants to charge 10 USD per month for their “starter” service level.

The unit_amount parameter uses the lowest unit of the currency specified for the price. In the case of Togethere, the lowest unit is cents: 10 USD is 1,000 cents, which means their price unit_amount is 1000.

To create the price and assign it to the product, pass the product ID, unit amount, currency, and interval:

server.js



// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = require('stripe')('sk_test_4S68v29DeKcE4RxJcrJnUn5s');

const price = await stripe.prices.create({
  product: '{{PRODUCT_ID}}',
  unit_amount: 1000,
  currency: 'usd',
  recurring: {
    interval: 'month',
  },
});

await stripe prices create


const price create, then product, product id

unit amount

currency 
usd 

































create products and prices::


https://docs.stripe.com/products-prices/manage-prices?dashboard-or-api=api




















products and prices

products



Multiple prices
Because a product can have multiple prices associated with it, you need to specify which price to use when creating Checkout Sessions, Payment Links, Invoices, Quotes, or Subscriptions.
















add a price id to each product together with its price, which component makes our products?? ::



how to get specific stripe product by id:: curl https://api.stripe.com/v1/products/prod_ABC123 \
-u "sk_test_YOUR_SECRET_KEY:"


we do a stripe api with products and our product id








This approach:
- Reduces API calls: You get only the product you need, avoiding unnecessary data retrieval.








const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY');

async function getPriceId(productId) {
    const prices = await stripe.prices.list({ limit: 100 });
    const price = prices.data.find(p => p.product === productId);
    return price ? price.id : null;
}

getPriceId('prod_ABC123').then(console.log);















we must add our new product creator, here, then we must use our previous build as an example, we have all the necessary code there,





















configure routes and understand their nature, next.js  folders are used to define the route segments that map to URL segments

nested route:: create a folder called blog in the app directory:: in the app directory we currently have our main page that is root page page.js, to create for example a /products page, to create route for /products, create a fikder called products in the app directory, then to mak /products publicly accessible, add a page.js to that folder 





























whenever edit query param is true, then we must initialize our stripeUpload function immediately, if there are no big files to be uploaded

on submit









































we must add the best image carousel from tailwind into our product page that is in the folder structure product/[id]/page.js


this perhaps, different data attributes to listen to event and then trigger the slide event from the carousel component
customize control elements with classes from tailwind

carousel sliding default
compoonent initialized data-carousel static slide data attribute and a unique id attribute to the parent element
initialize
carousel items, make sure to give them data-carousel-item data attribute

data-carousel-item attribute inside of wrapper <data-carousel-wrapper >
example data-carousel-item::

        <!-- Item 2 -->
        <div class="hidden duration-700 ease-in-out" data-carousel-item>
            <img src="/docs/images/carousel/carousel-2.svg" class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="...">
        </div>
        <!-- Item 3 -->
        <div class="hidden duration-700 ease-in-out" data-carousel-item>
            <img src="/docs/images/carousel/carousel-3.svg" class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="...">
        </div>
        <!-- Item 4 -->
        <div class="hidden duration-700 ease-in-out" data-carousel-item>
            <img src="/docs/images/carousel/carousel-4.svg" class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="...">
        </div>
        <!-- Item 5 -->
        <div class="hidden duration-700 ease-in-out" data-carousel-item>
            <img src="/docs/images/carousel/carousel-5.svg" class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" alt="...">
        </div>
    </div>

link::
https://flowbite.com/docs/components/carousel/
https://flowbite.com/docs/components/carousel/









1:: upon uploading our product to stripe (component: postProduct.js ), we must use the id from that product upload in our images file upload to firebase 1.1:: does our component have a return of ID? because we need to send this ID to our child component imageInput, upon ID return our child component must fire, and upon completion of entire promise, we now fire another post request to update the same ID product with the all same id firebase image uploads to match their origin, meanig their same id product












now we have our firebase upload, now after all promises are completed we must add this array to our stripe database, all references into stripe as image values, for our product with certain id
this is the stripe product object, just update its images property after all promises completed firebase:::

The Product object
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


we use promise.all we create fetch, and then resolved response::

Promise.all() will allow us to use componentDidMount() to give us a resolved response for everything that was passed through it.

componentDidMount(){
    Promise.all([fetch('http://localhost:3000/stickers'),                                  fetch('http://localhost:3000/pages')])
The code above is basically saying make a fetch to both of these and in return give me a resolved response.

.then(res => console.log(res))











we must add images to firebase, now we are doing that, we have our post folder, client component, it has a input that creates an array, then we upload to firebase, we upload to firebase by writing image ref, file, into, we await promise.all(uploadPromises)


we create one firebase promise, then we do await promise.all,

we have image ref storage products, we get our products from a url,

we have snapshot that is await uploadbytes, then file, our file is our map parameter










add image to firebase, create input, then take anything from that input and send into firebase
create array from selected files

