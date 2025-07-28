
1:: DEV SERVER = occupied terminal
when i run npm run dev,  and i run a dev server, the terminal is now occupied by the running server, means i have to open a new terminal to write commands

2::GET HTTPS WITH CERTIFICATE (before HTTPS we got "site can't provide a secure connection)
 add a trusted local certificate for https: by creating your own certificate authority (CA) for your local servers you can run HTTPS sites locally, link:: 
https://sdust.dev/posts/2023-08-18_Next-Localhost-Https.html


3:: INSTALL IN SPECIFIC FOLDER USING POWERSHELL ADMIN: just open powershell as admin and then copy specific folder as text from file explorer, then cd into that exact address on pc, then: choco install mkcert to install mkcert in specific folder


4:: default next.js component is a server component (ran on the server)

every next.js  component is by default a server component, to have a client component for client side interactivity, add: 'use client'; at the absolute top of your component



5::

reminder update state dynamically: create one state object to house multiple values tturned into object properties

have on onChangeHandler, this organises the incoming values dynamically by reading the name of the current onchange input that we must add to our object and update our single state with this single object of multiple properties


state handleinputchange set ((prevstate))  ...prevproduct, now  previous state with our new dynamic name, + dynamic value

6:: promises.all(), takes an iterable of promises, and returns a single promise,
like await variable.map(() => {})

like a map with await inside of it, it returns url if successful::
    const uploadPromises = files.map(async (file) => {
      const imageRef = ref(storage, `products/${uuid()}`);
      const metaData = {
        idValue: productId,
      }
      try {
        const snapshot = await uploadBytes(imageRef, file, metaData);
        const url = await getDownloadURL(snapshot.ref);
        console.log("Uploaded image URL:", url);
        return url; // You can save this URL wherever needed
      } catch (error) {
        console.error("Upload error:", error);
        return null;
      }
    });
    so we have a variable that maps values and reutrns multiple values depending on thye length of the array it iterates, then this variable that returns based on dynamic length can then be added to promise.all(variable)



    7:: patch, put replace an entire resource
    - PATCH is used for partial updates. It allows you to send only the fields that need to be updated, without affecting the rest of the resource

  patch code, enxt js handling https methos and requests::
  Exactly! If your Next.js server code doesn't have a function named PATCH, Next.js won't recognize it as handling PATCH requests. That means when your client sends a PATCH request, the server won't know how to process it, likely resulting in a 404 Not Found or 405 Method Not Allowed error.

- Security & Encryption – Ensure data is encrypted (e.g., HTTPS, SSL/TLS) when transferring between systems.





8:: backend frontend for product uploads (safe to do client - my backend - foreign company server)::

now check, after editing: do you have a valid product object to send into upload territory (before sending to backend you fix firebase file upload on frontend)?

Yes, you can! Firebase Storage is a great option for handling file uploads in a Next.js frontend. 



for stripe product uploads we want to focus on safety, server uploads::
Yes, handling Stripe product uploads on your Next.js backend is generally a good approach! It allows you to securely manage product creation, updates, and pricing while keeping sensitive API keys hidden from the frontend.
Here’s why using the backend is beneficial:
- Security: Your Stripe secret key stays protected, preventing unauthorized access.

--remember that the client creates the product so the inputs of product will be initialized on the client frontend, but then send it to the server 


it is a bout the request being made, we want our server to make the request, our client must only communicate with our backend, then our backend to stripe

about scalability and security::
Yes, exactly! The best practice is to have the client send product details to your backend first, then let your backend securely process and forward the request to Stripe. This ensures:
- Security: Keeps your Stripe secret key hidden and safe.
- Validation: Ensures product data is clean before sending it to Stripe.
- Control: You can enforce business rules and handle errors.
- Scalability: Makes future updates easier and prevents direct exposure to Stripe.




10:: api routes endpoints next.js function functionName(req, res)::

API routes provide a solution to build a public API with Next.js.

Any file inside the folder pages/api is mapped to /api/* and will be treated as an API endpoint instead of a page. They are server-side only bundles and won't increase your client-side bundle size.

For example, the following API route returns a JSON response with a status code of 200:

pages/api/hello.js
JavaScript

JavaScript

export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from Next.js!' })
}


11:: checkout session stripe:: 
we have a form on the html client side that has action: 
create checkout session, we redirect client to a backend endpoint to that stripe gives uf the functionality of a stripe checkout session, stripe api endpoint::
     <form action="/create-checkout-session" method="POST">
        <button type="submit" id="checkout-button">Checkout</button>
      </form>
    </section>
  </body>
</html>

Stripe-hosted page
View the text-based guide
Explore a full, working code sample of an integration with Stripe Checkout where customers click a button on your site and get redirected to a payment page hosted by Stripe. The example includes client- and server-side code, and the payment page is prebuilt.


Download full app
https://docs.stripe.com/checkout/quickstart?client=next
https://docs.stripe.com/checkout/quickstart?client=next

we have a route handler that takes our checkout session route.js, folder is our checkjout session url
a checkout session api takes control of what UX customer has with line items, order amount and currency and acceptable payment pmethods 

stripe hosts this payment page

12::

we must use our folder structure in next.js for routing, we add a folder to our app folder, then in that folder we add a page.js that will be the root page for that folder on the URL, if folder is called products, and we add page.js, then page.js is reached by URL /products, our default page.js in that folder is on the url /products url folder products

Routing
The Pages Router has a file-system based router built on concepts of pages. When a file is added to the pages directory it's automatically available as a route. Learn more about routing in the Pages Router:



13:: settings screen, everything figured out, responsive and everything, just make it update, where do you store profile, in stripe

Update a user's profile
You can update a user's basic profile information—the user's display name and profile photo URL—with the updateProfile method. For example:

Web
Web

import { getAuth, updateProfile } from "firebase/auth";
const auth = getAuth();
updateProfile(auth.currentUser, {
  displayName: "Jane Q. User", photoURL: "https://example.com/jane-q-user/profile.jpg"
}).then(() => {
  // Profile updated!
  // ...
}).catch((error) => {
  // An error occurred
  // ...
});



 <!-- writing note that we must know exactly what each hgtml element does-->

https://firebase.google.com/docs/auth/web/manage-users

https://firebase.google.com/docs/auth/web/manage-users


14:: store current user in next.js with firebase and state context store user in global state:: 

Recommended Approach:
- Use onAuthStateChanged: This method listens for authentication state changes and updates your app accordingly.
- Store the user in state/context: If using React, store the user in a global state (e.g., React Context or Redux) to avoid redundant Firebase calls.


- Use currentUser cautiously: While firebase.auth().currentUser can retrieve the user, it might return null if Firebase hasn’t finished initializing


we must check currentUser only after firebase has initialized

if firebase.auth 
we use firebase.auth()

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user);
  } else {
    console.log("No user is signed in.");
  }
});

Why This Works:
- onAuthStateChanged ensures Firebase is initialized before checking the user.
- Avoids unnecessary API calls by listening for authentication state changes.
- Prevents null issues that happen when checking currentUser too early.


onauthstatechanged, so we await onauthstatechanged then if user when that state changes, then we have current user because we aalways update on user events firebase database


state truth one top truth, avoid duplicates, effecient, prevent duplication, avoid redundancy, keep data on same track::

To avoid duplicating state information, especially in applications like React or state management libraries, it's crucial to maintain a single, consistent source of truth. This can be achieved through various strategies, including using unique identifiers, checking for existing values before adding new data, and ensuring data structures are designed for efficient comparison. 
Strategies for Avoiding State Duplication:
Unique Identifiers:
Assign unique IDs to each state object or item to prevent duplicates when updating or adding to state arrays. 
Data Comparison:
Before adding new data to a state array, check if an identical item already exists based on a unique identifier or other relevant criteria. 
Immutable Operations:
Use immutable operations when modifying state to prevent accidental side effects and ensure a clean, consistent state. 
Data Normalization:

15:: for multiple products in stripe, use a checkout session
Stripe Checkout Sessions and Payment Intents serve distinct purposes within Stripe's payment ecosystem, each designed for different use cases. Payment Intents offer a more granular control over payment flows and are typically used for custom integrations, while Checkout Sessions provide a pre-built, user-friendly payment page for simpler transactions. --- checkout session simpler 

checkout session, what data does it need: 

To complete a payment using a Stripe Checkout Session, you need to provide several key pieces of data:
- Success & Cancel URLs: Redirect URLs for when the payment succeeds or fails.
- Mode: Either "payment" for one-time payments or "subscription" for recurring payments.
- Line Items: Details of the products or services being purchased, including price, currency, and quantity.
- Payment Method Types: Accepted payment methods (e.g., "card", "paypal").
- Customer Information: If applicable, the customer ID or email.
- Automatic Tax Settings: If tax calculations are needed.
- Metadata: Optional custom data for tracking purposes.
Stripe automatically creates a PaymentIntent when a Checkout Session is initiated, so you don’t need to manually link a PaymentIntent. You can find more details in the Stripe API documentation. Let me know if you need help setting it up!


Yes, a Stripe Checkout Session often requires a Price ID, but not always. If you're selling predefined products with set prices in Stripe, you should use a Price ID (e.g., "price_abcdefghi123456789") in the line_items array. This ensures the correct product pricing is applied.
However, if you're handling custom pricing dynamically, you can use price_data instead, where you manually define the currency, product details, and unit amount. This is useful when managing your own inventory outside of Stripe.
Would you like an example of how to structure this in code?



16:: how to process post request on backend:: how to read the data client sent with post request, in node js, on app.post endpoint we can read req.body, or is it request.json ()



17:: completed dynamic checkout session update of line items, now line items are the exact updatge as when we follow the client frontend create checkout session and redirect to checkout stripe url
what we did:: we made sure our original price object request the server endpoint for both the price and price id from the price object, we made our product object carry all the necessary values to our backend, then our client asks for a checkout session, and our backend has the correct object properties for our create checkout session line items property,

we had to request server for price id, and add price id to our original product object, so we have one single resolved complete object truth whenever we need object to tell entire story:

server request using our product object.id property to get our product updates with the property of our pricedata from our other object we awaited in async code, we await the promise resolved from our slow data intensive code, now have have await product on await product f rom stripe config database and then we update with the most important property, our await object pricedata.id::





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
          images: images,
            default_price_data: {
                unit_amount: price,
                currency: 'usd',
        
              },

        });
try {
    // Step 2: Create the price associated with the product
    const priceData = await stripe.prices.create({
        unit_amount: price, // Amount in smallest currency unit (e.g., cents)
        currency: 'usd',
        product: product.id, // Link the price to the product
    });
    console.log('Price created successfully:', priceData);
} catch (error) {
    console.error('Error creating price:', error.message || error);
}


    //step 3::
      // Step 3: Update the product to set the default price
        const updatedProduct = await stripe.products.update(product.id, {
            default_price: priceData.id, // Set default price
      
        });



        console.log(updatedProduct, "price", priceData)


        return NextResponse.json({ product: updatedProduct, price: priceData });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}















we had to create the perfect object for our line items object property:: 
const completedLineItemArray = requestBody.map(({ default_price, quantity}) => ({

  price: default_price,
  quantity: quantity,
}));

   



   16:: auth knowledge, for signing in with firebase:: we now have two ways of signing in using firebase, both with email and password and with google, now, we use a if statement to check our custom context hook for any user object, we deconstructure that object const {user, handelSignOut} = useAuth();
   our custom hook to  listen to the auth object is this::
   we provide a context value, then our custom hook imitates using context to get context that is our authContext, that is our autcontext with provider value user from firebase set state
   ::
   Call useContext at the top level of your component to read and subscribe to context.

import { useContext } from 'react';

function MyComponent() {
  const theme = useContext(ThemeContext);
  // ...
  we can read and subscirbe to our context, now here we do, by calling our useContext with an arrow variable::

  Call useContext at the top level of your component to read and subscribe to context.

import { useContext } from 'react';

function MyComponent() {
  const theme = useContext(ThemeContext);
  // ...
  Example
With Arrow Function:

hello = () => {
  return "Hello World!";
}
useContext activates our return value useContext our authcontext provider value context createContext