
24:: fix users so there is a public collection of users, and a private one. things to do: make profile pic, user tag and username public, :: make sure this is added at the right locations, so uploading new public intel, must update both private and public collection with correct documents
24.1:: when we create users this must happen::
24,2 we also fixed the upload product component to accept the no data starting point when adding new products contrary to when you are editing an existing producti n stripe and firebase
24:: conclusion:: we now have a user tag created, we have two user collections in our firebase database. we have fixed both the create product component in post postproduct.js and the register component in auth register.js  .. :: we now have a creation of two collections on user creation. we have an endpoint that: is a post endpoint that recieves a request, and
then it takes the request, it does await admin.auth and creatuser

then it teakes userdata and upload to both collections the correct data::
![alt text](image-1.png)

    // Save in both collections
    await db.collection("users").doc(userRecord.uid).set(userData);
    await db.collection("publicUsers").doc(userRecord.uid).set(userData);

    return NextResponse.json({ success: true, uid: userRecord.uid, userTag });
  } catch (err) {




23:: How to create a users collection that is safe to share with the public:

Create a separate collection in Firebase called publicUsers. This collection should only store non-sensitive information about each user (for example: username, avatarUrl, bio, or a unique tag).

By keeping only safe fields in this collection, we can fetch data from it in our UserRow component and use it in our Next.js routes. This allows our backend endpoint to return non-sensitive user information securely.

We can also use the unique tag stored in each publicUsers document to look up specific users (e.g. a seller profile) and then connect this with our chats collection to enable conversations between users.




how to keep url query parameter safe when visiting user profile, so we have unique tag to eestablish chat with sellers in their subcollection: 

So your flow would be:

User picks a username for display (not unique).

System generates or requires a unique tag (enforced in Firestore) — this is what goes in the URL.

/profile/@johan92


Your Next.js route takes the tag from the URL, fetches the corresponding uid from publicUsers, and uses that internally to:

Show profile info

Create chats (participants: [buyerUid, sellerUid])

This way, the URL is human-friendly and safe, and you avoid collisions that would happen if you used the plain username.

If you want, I can outline how to enforce unique tags and generate them when users sign up.


23.1:: establish a firebase  subcollection in the database of only one chat between different user pairs::
so then we can use that unique tag to establish a subcollection that saves chats between that user and other users
ChatGPT said:

Exactly ✅ — that’s a safe and clean way to structure it. Let me break it down clearly:

1. Use the unique tag to find the user

URL: /profile/@johan92

Next.js backend or API route reads @johan92 → looks up publicUsers → gets the uid

2. Create a chat between users

Use the uid internally (never the tag) for Firestore writes.

Example chats collection structure:

/chats/{chatId}
   participants: [buyerUid, sellerUid]
   createdAt: timestamp

   /messages/{messageId}
      text: "Hello"
      senderUid: buyerUid
      createdAt: timestamp


chatId can be auto-generated or deterministic (like hashing buyerUid + sellerUid) if you want only one chat per pair.



























22:: 1. thrusday: we made it so the placeholder cards before the real firebase cards match what is incoming, 2: we made it so when you click to submit form with form submit function event we now navigate to the product url without the query parameter called edit, we have a url that hints to our code what should happen with our state, we can get a global state with our usecontext hook 
Yes ✅

useContext is a React hook.
3: important lesson: our PostProduct component is in t he post folder, in src folder inside app folder, conclusion::
we have many functions, they all respond to each other, like callbacks, we can await the result of a promise, and then we fire the next function
Yes ✅ — a function can await a response from an endpoint even if that endpoint is the result of a successful database create (POST) request.

we can await a response from an endpoint that should upload something to our database for us












we learned today::
we use promise, that we await a result, we await all on the map methodm so we have upload files to firebaase and await the URLs, we then have avalidresults array that we then set for our state wehn it is copmlete. we await promise.all(uploadPormises)


    const uploadPromises = files.map(async (file) => {
      const imageRef = ref(storage, `products/${uuid()}`);
      try {
        const snapshot = await uploadBytes(imageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return url;
      } catch (error) {
        console.error("Upload error:", error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);


    await all

    The map() method of Array instances creates a new array populated with the results of calling a provided function on every element in the calling array.



what is happening, we click to check out a singular product, with image URLs and details in the product object, but we cannot previe our edit product object, we have a rpoblem with firebase





 our current problem:
 firebase permissions and upstream problem::

 quota has been exceeded, we have exceeed qota::
 conclusion::
 ask AI to fix this::
 make it so that when we deleted images they are certainly gone, and no previews of deleted images, dleted them from all arrays
 ALSO::
 make sure that Firebase URLs and newly added file upload file URLs are dispalyed equally
 ::mAKE SURE THAT You have a preview of the product object as it will be uploaded, with the newly added images in the preview together with the files that were there before clicking edit event







i have now checked current user, i have added so that ican log the important values, i now have creator id and creator name

Yes ✅

If you’ve wrapped a component tree in a Context Provider, then any child component inside that tree can use the context with useContext (or in your case useAuth()).

For example:

// authContext.js
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();



we have context wrapped other ocmponents, then tree context provider contgext tree,
then we have so that our edit component has values, it checks for current values otherwise empty because then empty

product setstate
i added current context value, we have a custom hook, we wrapt our component in context

2:: sjekk at produkter lastes opp, muligens legg til noen felt, make sure current user context value is the value added to the product, can we do it through metadata
what to do: check fodler post, postProduct
1:: are we logging current user value when we click edit product? check our PostProduct component  (extra:: started deleting a bunch of unesessary code, like cometchat, a different chat provider, we can just use firebase with subcollections)

extra:: problems finding productDetail page code, sort it better

sort it better


products detail apge is in  src app  products id page.js, there we have our:
import postproduct, we do our postproduct when we do our editing








 current task, 1:: fixing stripe account so it can recieve payments, adding vat and iban number, organisasjonsnummer og iban nummer



























question:: does our product object include everything necessary for the stripe product object, so the object can be uysed for a chec kout session and be payed for
https://docs.stripe.com/api/checkout/sessions/object
https://docs.stripe.com/api/checkout/sessions/object

https://docs.stripe.com/api/checkout/sessions/object#checkout_session_object-line_items


To create a Stripe Product object, the most crucial and required attribute is the name. You must also include a price object for the product, either by adding it to the Dashboard or defining default_price_data when using the API. Other optional but highly recommended fields include a description, images, a tax code, and metadata. 
Required Attributes
Name: A string representing the name of your product, which will be displayed to customers. 
Price: When creating a product, it must have at least one associated price. You can create a price in the Dashboard or define default_price_data when creating the product via the API. 
Recommended Optional Attributes
Description: A description of the product that appears to customers on the checkout page, in quotes, and in the customer portal. 

stripe object price and name 

conclusion to the product object neccessities question:: we must have price and name.

make a simple product that can be sold, then add on later, we dont want to create a mess to get out of, we get knowledge, for now, have it simple and functional



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

