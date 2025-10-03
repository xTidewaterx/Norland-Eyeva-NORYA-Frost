23:: transfer/merge properties from the user objects in the users collection in the firebase database into another collection, a public users collection, we did use:     await Promise.all(promises);
we awaited all of the transfers to happen, then we had object with a select amount of proeprties copied from our private yusers collection, the orginal users collection

23.1:: we are changing rules for our different collections in firebase, to allow read and write, we are communicating with an endpoint aht allows this touch with the resources
what did we learn, 23::
we created an api folder and a rout.js, in that endpoint we:


in our frontend component we fetched from the endpoint,
no actually, there were si nmany permission boundaries
we jsut did it all on our frontend.
but it is a bit risky
we must do it 
on our backend endpoint instead. 
how could we do it with our endpoint:
well, any code writte on the frontend to fetch from firebase could have bee written
into our backend::
Frontend vs Backend with Firebase

happy upload to database, await:: 
 The await operator is used to wait for a Promise and get its fulfillment value. It can only be used inside an async function or at the top level of a module.
await expression
Parameters
expression
A Promise, a thenable object, or any value to wait for.

we wait for a value, await


Frontend (client SDK)

Any code running here is visible to the user.

Anyone can inspect the network requests or your JS and try to call Firebase directly.

If your Firestore security rules aren’t strict, this can be abused.

Risk: users could write/modify data they shouldn’t if rules aren’t tight.

Backend (server API + Firebase Admin SDK)

Code runs on your server (Next.js API routes, for example).

Admin SDK bypasses Firestore rules because your server is trusted.

Users can’t see or modify your API implementation.

You can implement custom validation before writing to Firestore.

Benefit: much safer; hard for hackers to manipulate.


conclusion::
our backend is harder to reach, not visible to users, on our forntend, anyone can inspect the network requests on your js and try to call firebase directly
there is a risk that users can write / modify data they shouldn't

backend is much safer, server api + firebase admin sdk
code runs on server, users can't see or modify your api implementation::
A program implements an API when it follows the API's rules. In our pizza parlor example, a client that can make requests to the /orders endpoint using the correct headers and data format would be a client that implements the pizza parlor's AP








we ifex so we delete images on both firebase and stripe, even when our only action is deleting one image, meaning we dont need to have an array with new uploads to fire the stripe function, we now have an edit component that   is flexible and responds to the crud operations, both single and multiple


we fixed our problem and made it possible, by understanding
that stripe uploading the newest object available on the click upload event. So we just deleted images and clicked upload, because we know it will rewrite the stripe object::

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


conclusion:: 
we fixed the product preview, and we made it so that when we delete something it actually dissapeared, and we added an image, we did CRUD operations to test the flexibility of it



current problem::
if we only delete, it does not work, perhaps it does not update the product object appropriately

the problem is:: when we delete something., it appears we are not also uploading a new stripe 
object,
we stayed calm, we fixed so that even when no image file uploads are added, and we dont have an array with extra items, we still go thourgh with stripe upload, we must overwrite our stripe object








|1:: problem with previews on productDetail page, we are seeing previews of images deleted from firebase, perhaps stripe product object har URLs for images that are deleted in firebase

we have our previews, for some reason our  blob is adding images that are nowhere to be found

is the problem that we have url in our stripe product, but not in our firebase

log our stripe product


how can we log our stripe product
we have a dynamic route
where is our 

here it is:

async function getProduct(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products?id=${id}`);
  if (!res.ok) return null;
  return res.json();
}

question: how could we find our source of our image and previews, it is our product object
find our product object



question
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





















currently:: fixing payments through my account, iban number






when you upload a product, it should check for adding a creator,
for example the current user












when we load our homepage we have one image that is not loading, why
thoughts::
file too big

not sharable image?
maybe image was uploaded before we changed



note:: when you edit product, have the added image be showing in the preview

add a current image upload to whatever array you are acessing for it

fixed the problem



now check that payments are insanely secure 












we just solved a big problem by changing the fetch url, it goes to the next.js route endpoint::
      const res = await fetch('api/products');
        const json = await res.json();
        if (json.data) {
          setProducts(json.data);

          now we fetch data from our next.js endpoint, it takes our request and it fetches::
This endpoint is your Next.js API route handler for GET requests, and it’s directly fetching product data from Stripe’s API.
Exactly 👍 — what you’ve written is a Next.js API route endpoint.
and that endpoint allows me to request resources through my next server, resrouces from the stripe api?
ChatGPT said:

Yes ✅ exactly — you’ve nailed it.

That endpoint is acting like a proxy layer:

Your frontend (React components) calls your Next.js API endpoint (/api/products).

That API route runs on your Next.js server.

Inside the handler, you call Stripe’s API with your secret key (safe, because it never touches the browser).

The Next.js server takes Stripe’s response, transforms it (e.g. converting cents → dollars, simplifying fields), and sends it back to your frontend.








How Is a Test Structured?
Testing involves checking if your code is functioning as it's supposed to by comparing the expected output with the actual output.










how can we fix this error:
FirebaseError: Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore
    at ProfilePage (webpack-internal:///(app-pages-browser)/./src/app/profile/[uid]/page.js:110:102)
    at ClientPageRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/client-page.js:20:50)






rules_version = '2';
  service cloud.firestore { 
    match /databases/{database}/documents {
    match /{document=**} { 
      allow read, write; 
    } 
  } 
}







rules_version = '2';
  service cloud.firestore { 
    match /databases/{database}/documents {
    match /{document=**} { 
      allow read, write; 
    } 
  } 
}





Function parameters are the names listed in the function definition.

Function arguments are the real values passed to (and received by) the function.
function definition

parameters objects function

parameters default values function

function argument as an array, arguments in a function

arguments given through  a parametger function
WE HAVE A ROUTE IN OUR API API CHECKOUT SESSIONS ROUTE, WE HAVE OUR POST REQ AS PARAMETER, REQ IS TO BE DECIED UPON FUNCTION CALL

then we have our route.js

we have requestbody, then map that array, we have object we have map with parameters, then we use values from our object array given to our map, then we have our object create with database method and mode and payment properties

we have properties in the object that guides our payment database update object


we now added a profile page when you click navbar, we also have edit component and post new productg component, mainly it does this::

it checks if there are new files, and then we must await the upload of these files to firebase, before we update a stripe product with these among other things, here is how we await the upload of all of the firebase images::


we can await all promise.all on our uploadPromises, we await the completion of our entire amap
  // Step 3: Upload the new files from step 2  to Firebase
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
  const validResults = results.filter((url) => url); // Remove null entries
//const productImages= product.images((productImages) => productImages)
  // Update state with new images





map and promise.all ::

Using map to create an array of Promises
The map method is used to iterate over an array and create a new array by applying a function to each element. When dealing with asynchronous tasks, this function can return a promise. This results in a new array containing promises, each representing an asynchronous operation.
JavaScript



const items = [1, 2, 3];
const promises = items.map(item => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(item * 2);
    }, 1000);
  });
});
Using Promise.all to handle the array of Promises
Promise.all takes an array of promises as input and returns a single promise. This returned promise resolves when all the input promises have resolved, and it resolves with an array containing the resolved values of each input promise in the same order. If any of the input promises reject, the promise returned by Promise.all immediately rejects with the rejection reason of the first promise that rejected. 
JavaScript



we await the promises from the array, promise resolved wehen all the input promises have resolved, an array of promises is the input








postProduct is our component we are searching for 






























our postproduct component does this::

1:: it takes our product as a parameter
2:: it check our URL for our edit searchparam, and then if editparam::

if(editParam) {



  const currentStripeProductImages = product?.images.map((productFiles)=> productFiles);


if we are editing our product we might already have images in our product array, these image URLs must be added to our new firebase uploaded URLs, then we guve this to our product object that we then send to stripe to be updated


3:: but what is the final call of our 




4:: updating a product stripe::

const stripe = require('stripe')('sk_test_4S68v29DeKcE4RxJcrJnUn5s');

const product = await stripe.products.update(
  'prod_NWjs8kKbJWmuuc',
  {
    metadata: {
      order_id: '6735',
    },
  }
);


































find the system of the previous create product component with react firebase adn stripe, there weas a disntinction between big files and small files, also, make sure the logic is sound, await a promise, then move on with the next, we can connect to firebase, upload big files, then next upload to stripe when all promises are resolved
where is our productForm, check for tracks, we had a productgform that had both edit mode, nad the productForm would  take into consideration the different uploads, if there was a length to the bigg files array that would be handled in a loop to firebase, each item would w be uploaded  before the next one, each item then weehn all promises resolved then next upload, stripe takes all the references and the rext of the product object


i think i must have uploaded someting online before changing it, where is our original

perhaps just add, check for changes before it all happened

we have our productForm,
our productForm create our product form ux







we have a product upload, it consists of these steps::

we must take inputs, 
we must add to a n object, then upload first some values, then promise all and the rest,,

also we should have current auth as context



current user state react context:: example user state management::

https://www.digitalocean.com/community/tutorials/react-manage-user-login-react-context

react data top to bottom through props, parent to children component

React Context is an alternative solution to sharing data across components, without having to pass props down manually at every level.

react create context mkethod retuirns a context object, comes with two important react components, that allow for subscribing to data, provbider and consumer

react component subscirbed to context object, current c ontextg vlaue 



react object to be used by other component

react.createcontext

then export thisContext






















Exactly! In Next.js with the App Router, a page.js inside src/app is a server component by default—even if it includes multiple client components.
Why?
- Server Components wrap and render Client Components without becoming a client component themselves.
- A Client Component (marked with "use client") can exist inside a Server Component, but the parent stays a server component unless explicitly marked otherwise.





Good question! In Next.js with the src/app structure, it's generally better to keep your components outside of src/app, placing them in src/components instead.
Why?
- The src/app folder is specifically designed for server-side rendering and layouts using the App Router.




any important notes 
to think about in relation to this build, is there anything we would like to mention in particular 

anything that would be important for this build 

is ther anythign in particular that would be important for this build in particular 

anything in particular for this build 


anything for this build in particular that you wuold love to fix


to create norland mvp, 


landing page, like holzweiler

2:: we need create profile page and  we need sign in page

2.1:: we need a profile page 


3::  we need a product artist page

4:: we need a artist list 

5:: we need a checkout page, where you can press to confirm a purchase of that amount that is listed on checkout session with extra costs included, a final pay this page with an actual completed payment possible

6:: have favourite list for a profile, they can toggle favourites
 toggle favourites









we need:,,,


...---..,,øæ--æååp'¨å++\\\\\

[]


anythingg ::

::

anything for anybody 

there is no reason to not like that 



trashnotes our root page.js::

where we have our data before design process::



  return (

   <AuthProvider>

<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>

      <h3>Example Fetch: </h3>
   
   <RegisterUser/>
   <SignInUser/>
   <GoogleSignIn/>
   <AuthStatus/>


     <PostProduct/>

   
     
<GetProducts/>


    </div>


    <Link href="products/cart">Go to Cart</Link>
  <QRDecoder/>

 <CreateQrCode/>

   </AuthProvider> 


  );
}
