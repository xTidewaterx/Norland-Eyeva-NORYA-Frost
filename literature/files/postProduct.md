

most important, for a brand new product, we are following this next.js route endpoint::

C:\Users\Johan\marketplace-test-next\src\app\api\products\route.js



code resource from that api products route.js endpoint::



//this is our upload new product code, on our postProduct new product, this is the code on our next.js post endpoint route

export async function POST(req) {
    try {
        const { name, description, price, images } = await req.json(); // Parse JSON body
        
        if (!name) {
            return NextResponse.json({ error: "Product name is required" }, { status: 400 });
        }

        const product = await stripe.products.create({
            name,
            description: description || "", // Default empty description if none provided
          images: images,
            default_price_data: {
                unit_amount: price,
                currency: 'usd',
        
              },

        });
        console.log("uploaded a new Stripe product:", NextResponse.json(product))

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}




























checking backend endpoint, this is our response when we click and commit to event add product in copmonent postproduct::

uploaded a new Stripe product: Response {
  status: 200,
  statusText: '',
  headers: Headers { 'content-type': 'application/json' },
  body: ReadableStream { locked: false, state: 'readable', supportsBYOB: true },
  bodyUsed: false,
  ok: true,
  redirected: false,
  type: 'default',
  url: ''
}
 POST /api/products 200 in 429ms

IMPORTANT POINT:: we now have post api products::

api products::


//this is our upload new product code, on our postProduct new product, this is the code on our next.js post endpoint route

export async function POST(req) {
    try {
        const { name, description, price, images } = await req.json(); // Parse JSON body
        
        if (!name) {
            return NextResponse.json({ error: "Product name is required" }, { status: 400 });
        }

        const product = await stripe.products.create({
            name,
            description: description || "", // Default empty description if none provided
          images: images,
            default_price_data: {
                unit_amount: price,
                currency: 'usd',
        
              },

        });
        console.log("uploaded a new Stripe product:", NextResponse.json(product))

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}















creating or editing a new product, a product that goes through firebase and stripe



1:: ternary edit or create new product check:: component uses editparam to check if we are editing or creating a new product, then we change endpoint url based on it:: 

   const endpoint =
      editParam === "true" ? "/api/products/updateProduct" : "/api/products";
    console.log("endpoint in postProduct.js:", endpoint);




2  :: upload product directly (but still our function uses the edit endpoint on upload if our eidtParam from our URL is true) (if we have no big files dependant on firebase) or go through firebase first::

we have a useEffect that awaits our uploadedUrls array::
//step 4:: calling uploadFilesToStripe if we have uploaded new images
  useEffect(() => {
    //this might become a problem when we want to update something but we dont update any files, then length will stay zero

    if (uploadedUrlsArray.length > 0) {
      console.log(
        "UploadedUrlsArray length exceeds 0, there are items to upload now"
      );

     
      uploadFilesToStripe();
    }
  }, [uploadedUrlsArray, updateProduct?.images?.length]);










3   ::

we have next.js file endpoint routes that will responds with a json http status code and a json payload indicating success, payload  can include a success field boolean and may also include a data field containgin the requested data or a success message or an id for created resources


this is our post request on the next.js route endpoint that will meet a post request, and it will respond with a return next response.json product, it is our return response from route endpoint file structure url we have endpoint product file:::


export async function POST(req) {
    try {
        const { name, description, price, images } = await req.json(); // Parse JSON body
        
        if (!name) {
            return NextResponse.json({ error: "Product name is required" }, { status: 400 });
        }

        const product = await stripe.products.create({
            name,
            description: description || "", // Default empty description if none provided
          images: images,
            default_price_data: {
                unit_amount: price,
                currency: 'usd',
        
              },

        });
        console.log("uploaded a new Stripe product:", NextResponse.json(product))

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

























we have a process of editing state top truth product object

we must await different changes both in the state and in our firebase database storage cloud storage web bucket before uploading to next.js


update state array, create new array state bject, then update state with the new resolved array::

Updating Arrays in State
Arrays are mutable in JavaScript, but you should treat them as immutable when you store them in state. Just like with objects, when you want to update an array stored in state, you need to create a new one (or make a copy of an existing one), and then set state to use the new array.



## we have now marked our postProduct.js component with 5 steps to edit our create a new product.

we must manage delete functionality and add functionality, between firebase and stripe

first we must complete all files that shall go into the final step 5 that is the complete product object uploaded to stripe, that includes uploading big files to firebase, and doing 


for deletion:
   const results= await Promise.all(deletePromises);

for uploads: 

  const results = await Promise.all(uploadPromises);




after these promises are resolved we then update our top truth state object,
that is when our entire component is alereted to utilise the useEffect dependency listener:::
  const results = await Promise.all(uploadPromises);
  const validResults = results.filter((url) => url); // Remove null entries
//const productImages= product.images((productImages) => productImages)
  // Update state with new images
  setUploadedUrlsArray(validResults);
  //setUpdateProduct({...product, images: validResults})
  setUpdateProduct({ ...product, images: validResults });
  setProduct({...product, images: validResults})
 
 ----when state is suddenly updated we know that our product is completed and ready to go, because our necessary firebase render is complete, then we fire off our dependency listeners, they make the call command to uploadFilesToStripe, so now a completed product is uploaded to Stripe database




completing a product object in relation to firebase cloud storage bucket explained:: 
## explained::

Promise.all()
Baseline Widely available
The Promise.all() static method takes an iterable of promises as input and returns a single Promise. This returned promise fulfills when all of the input's promises fulfill (including when an empty iterable is passed), with an array of the fulfillment values. It rejects when any of the input's promises rejects, with this first rejection reason.


## we have multiple promises, we await them all, for uploads that is:: 

an array that is mapped to upload each file::
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



























postProduct.js 

product setproduct

setProduct


how our component postProduct.js

const arrayParams 


const searchParams



const updateProduct, setUpdateProduct




deletedFiles

deletePromises

deletedFiles.deletedFiles.map(async(file)) => {


}



we must divide our component into three  parts::


1:: uploadToFirebase:: question::: can i await the result of the files.allPromises uploadFirebase functionality if i have that function isolated in a different folder and just import it, can i await an imported function based on its files.allPromises completion

2:: uploadToStripe::


there are 3 important elements to our uploadToStripe function::

important: when we upload to stripe we must have a completed product object,
that is made through adding and removing values.
here is the mechanism to upload a complete product to stripe::

if user has removed/deleted big files from product








we have three ways of doing "uploadFiles to stripe", two useEffects, depending on their being new files to upload or there being deleted files to upload, and a third call

our uploadToStripe function is called when uploadNow is true:
--we also check that there are no deleted files, because if there is, then we are calling our uploadStripe function in regards to that function, meaning we have another useEffect







    useEffect(()=> {

      console.log("postProduct.js uploading non deletedFiles: ",deletedFiles)
      if(deletedFiles?.deletedFiles?.length>0) {
        console.log("deleted files attempt postProduct checking product object before uploadFilesToStripe():", product)
uploadFilesToStripe()

      }



    }, [uploadNow])










extra notes::
 how we are editing the product object and linked arrays in our postProduct.js component::
















we removed deleted this::
because in our step one we are firing off firebaseFunction, and that function awaits completion and resolved before firing of stripe uploadFilesToStripe()


// step 5:: calling uploadFilesToStripe in the event that there was files to delete and that uploadNow is true
    useEffect(()=> {

      console.log("postProduct.js uploading non deletedFiles: ",deletedFiles)
      if(deletedFiles?.deletedFiles?.length>0) {
        console.log("deleted files attempt postProduct checking product object before uploadFilesToStripe():", product)
uploadFilesToStripe()

      }



    }, [uploadNow])










component: src/app/post/postProduct.js


https://docs.stripe.com/checkout/quickstart?canceled=true
https://docs.stripe.com/checkout/quickstart?canceled=true

checkout session: 




understanding this component::

on form submit: it must either: add data to firebase, remove data from firebase, or add data to stripe, or remove data from stripe.
some submit are edits/updates of existing product which gives us an edit param in the URL, or some product are a new product create creation, meaning we have no edit variable, it is null instead of true. When edit is true we send a different HTTP request that if we created a totally original, new product, our http endpoint URL is a variable, it changes based on our edit state, 


what we need to study:: the state management of our product before we upload: we have one product

managing state react::

https://react.dev/learn/managing-state

https://react.dev/learn/managing-state


be careful with duplicate state updates


principles update state, keep it clean and without redundancy::


Principles for structuring state 
When you write a component that holds some state, you’ll have to make choices about how many state variables to use and what the shape of their data should be. While it’s possible to write correct programs even with a suboptimal state structure, there are a few principles that can guide you to make better choices:

Group related state. If you always update two or more state variables at the same time, consider merging them into a single state variable.
Avoid contradictions in state. When the state is structured in a way that several pieces of state may contradict and “disagree” with each other, you leave room for mistakes. Try to avoid this.
Avoid redundant state. If you can calculate some information from the component’s props or its existing state variables during rendering, you should not put that information into that component’s state.
Avoid duplication in state. When the same data is duplicated between multiple state variables, or within nested objects, it is difficult to keep them in sync. Reduce duplication when you can.
Avoid deeply nested state. Deeply hierarchical state is not very convenient to update. When possible, prefer to structure state in a flat way.
The goal behind these principles is to make state easy to update without introducing mistakes. Removing redundant and duplicate data from state helps ensure that all its pieces stay in sync. This is similar to how a database engineer might want to “normalize” the database structure to reduce the chance of bugs. To paraphrase Albert Einstein, “Make your state as simple as it can be—but no simpler.”






























current error:: we must add our image objects to stripe, or no, because then stripe becomes loaded

what should alt text be then for images?


























we must have a flexible postProduct.js component, it needs to both take the creation of new products, and take the role of updating products, this is how we can do it::




1::: default component: we have our component that starts from nothing, but it takes a parameter that is a product, and IF that product parameter is filled with a product, meaning a true value, THEN we are updating an existing product by the product id contained in the filled product parameter


2:: updating technicals:: challenges of updating|an already existing product:: take our files: in firebase we have all of our files, scenario, we want to remove on file from firebase, what happens::

2.1:: removing one file from firebase: 

import { getStorage, ref, deleteObject } from "firebase/storage";

const storage = getStorage();

// Create a reference to the file to delete
const desertRef = ref(storage, 'images/desert.jpg');

// Delete the file
deleteObject(desertRef).then(() => {
  // File deleted successfully
}).catch((error) => {
  // Uh-oh, an error occurred!
});

2.11:: delete by url, firebase file:: 
const storageRef = firebase.storage().refFromURL(imageUrl);
storageRef.delete().then(() => {
  console.log("Image deleted successfully");
}).catch((error) => {
  console.error("Error deleting image:", error);
});

basically, whenever we do things to our firebase files, we must keeps tabs on the files from firebase, and when they get messed with we note that differently than if non-firebase files get messed with, non-firebase files can be deleted easily, also, if someone clicks "upload" and we have the four images files that are already in firebase, what happens then?

we must update in both stripe and firebase

2.2:: updating products in firebase:: upload image file one by one, but do nothing if current image is from firebase

2.3:: updating product stripe, when we have completed all of our promises in regards to firebase
const promises = update firebase map ---- then promises.all((value) => {

    save value
})


then we must update our stripe product in its complete, new form:: 


POST 
/v1/products/:id
Server-side language

Node.js
const stripe = require('stripe')('sk_test_4S68v29DeKcE4RxJcrJnUn5s');
const product = await stripe.products.update(
  'prod_NWjs8kKbJWmuuc',
  {
    metadata: {
      order_id: '6735',
    },
  }
);

Update a product 
Updates the specific product by setting the values of the parameters passed. Any parameters not provided will be left unchanged.

will be unchanged if not provided, we can leave out values that are already in the stripe product


first:: 
we must change a product and get the id of the cyrrent product

now on our postProduct.js where we can edit to make a patch https method, now 
we have our id in the component postProduct object from postPorduct, we have our product and we set that as state 