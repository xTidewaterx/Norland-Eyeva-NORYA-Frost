
# about error: we load the  https://localhost:3000/profile/biFW28aVVWdGtzt8yldZOzXzJDV2 page, it appears, no errors, we have user auth context, then we click start chat, then error appears in console

# currentError info:
our authcontext has a problem, perhaps we are not wrapping our nex code in the authcontext
//appears that we need an id and a collection of chats to jump into a chats, we need a chats collection in our firestore, with participants that are allowed to join.. match id, do we have rules for our document ins collections

our error comes from these two files: 
C:\Users\Johan\marketplace-test-next\src\app\auth\authContext.js

C:\Users\Johan\marketplace-test-next\src\app\profile\[uid]\page.js



# solution:: we are probably not allowed to listen or read the data in the specified path in cloud firestore or realtime database

rules link database collection match some path:: 
https://firebase.google.com/docs/firestore/security/get-started
Every database request from a Cloud Firestore mobile/web client library is evaluated against your security rules before reading or writing any data. If the rules deny access to any of the specified document paths, the entire request fails.

Below are some examples of basic rule sets. While these rules are valid, they are not recommended for production applications:

Auth required
Deny all
Allow all

// Allow read/write access on all documents to any user signed in to the application
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
The {document=**} path used in the examples above matches any document in the entire database. Continue on to the guide for structuring security rules to learn how to match specific data paths and work with hierarchical data.



# check rules in database for to get code permission: 
Review Firebase Security Rules:
Cloud Firestore: Navigate to "Firestore Database" > "Rules" in your Firebase console.
Realtime Database: Navigate to "Realtime Database" > "Rules" in your Firebase console.
Examine the read rule for the specific collection or path you are trying to listen to. Ensure that the rule allows the current user or the desired authentication state to access the data. For example, if you want unauthenticated users to read, your rule might look like allow read: if true; (though this is not recommended for production). If you require authentication, ensure the request.auth != null condition is met for the read rule.
Verify User Authentication State:
Ensure the user is properly authenticated before attempting to attach a snapshot listener to protected data. If your rules require authentication, but the user is signed out or their token has expired, you will encounter a permission denied error.


add to your rules that the document path is allowed by permissions by auth uysers collection document paths add permissions, listen to documentg path

check access ub furestire security rules, have user and have requests in collection and collection ref onsnapshot

AI Overview
In Cloud Firestore, a snapshot represents a specific state of your data at a particular point in time. It's like a picture of the data at that moment, allowing you to access the data as it existed then without needing to refetch it repeatedly. 



# error from source:: src app profile uid page.js
firebase snapshot permissions
possible reason: we are trying to read the documents of another user

attempt from reddit, allow auth users to read all user documents::"

// Users: Allow authenticated users to read all user documents.

match /users/{userId} {

allow read: if true;

allow write: if request.auth != null && request.auth.uid == userId;

}

// Conversa


link:: 
https://www.reddit.com/r/Firebase/comments/1k31vkl/firestore_permissions_issue/
https://www.reddit.com/r/Firebase/comments/1k31vkl/firestore_permissions_issue/


rules for database message if request.auth
// Messages: only participants can read/write

match /conversations/{conversationId}/messages/{messageId} {

allow read, write: if request.auth != null &&

get(/databases/$(database)/documents/conversations/$(conversationId))

.data.participants.hasAny([request.auth.uid]);

}

}

}
we match database collection
mes





FirebaseError: Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore
    at ProfilePage (webpack-internal:///(app-pages-browser)/./src/app/profile/[uid]/page.js:110:102)
    at ClientPageRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/client-page.js:20:50)


we must make sure we have valid chat id and currentUserid, make sure we have the corrrect values to create a chatwindow, we must have multiple particiapants in a chat, they must have unique ids

we have firebase, and collections

we create a firebase project
then config it, initialize it


we have chat id, we return messages using chat and ref database and messages chat id


example database await fetch firestore database, display message in UI

from database, send message function method post body json stringify, then catch (error)


    try {
      const token = await user.getIdToken();

      await fetch(
        "<http://127.0.0.1:5001/react-chat-3ae5d/us-central1/sendMessage>",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: { chatRoomId, message } }),
        }
      );

      setMessage("");
      scroll.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message. Please try again.");
    }
  };
When a user clicks the “Send” button, the sendMessage function is called. The function first checks if the message is not empty, then adds the message to the Firestore database under the chat room’s messages collection. Next, let’s update the ChatRoom.js file to fetch messages from Firestore and display them in the chat room.

In the src\\components\\ChatRoom.js file, add a useEffect hook to fetch messages from Firestore:


we have autgh context for state management we have onausthstate change auth user parameters, we have object dchildren

return statge for all values


Step 4: State management with context
Firebase works best with a central state management system. We're using React Context to:

Handle real-time updates from Firebase


Manage current chat state


Control user authentication state


# cometchat v6 uikit

solved error by localising the error by taking away code, checking when error disappears, found the useEffect block, we were trying to use cometchat methods before cometchat was initialized so we got uikitsettings not available
we made sure to do everything in the correct rorder 



we had useEffect connect with cometchat beside the ui, side effects in fgunction components:: 

The useEffect Hook in React is used to perform "side effects" in function components. Side effects are operations that interact with the outside world, beyond the scope of rendering the UI.

we localised the error and our sideEffect had to initialise the comet chat platform so we could integrate it, it provided sdks ui kits and no-code widgets communication features

we localised the error, then there was only a few lines of code it could be, something was missing, we got accsess to everything on the comet chat platform when we initialised it first, we must find our link to accsess the platform we do comethcatuikit.init (uikitsettings) !!!! there is the error, that is the exact thing that was missing, we did an early uikitsettings creation build to initialize our comet chat initialize our comet chat with the correct config intel




Error: uiKitSettings not available
    at onUnhandledRejection (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/errors/use-error-handler.js:125:39)


question:: have we perhaps not installed our uikit properly?
why is it not available, can we find this file , where
solution:: check if it is in your dependencies, in your package.json file,


about package.json::
Your package. json holds important information about the project. It contains human-readable metadata about the project (like the project name and description) as well as functional metadata like the package version number and a list of dependencies required by the application.

check if our uikit is included

"dependencies": {
  "@cometchat/chat-uikit-react": "^6.x.x", // ✅ should be here
  ...
}

yarn add @cometchat/chat-uikit-react





we have a curren user, we must stop requests to create a user if there is wrong confirm password or
if there is an email problem

fix the error and prevent requests when necessary on the sign in and create user components




# other garbage






we are in our product dynamic id  component trying to add a product to our cart,
the product wont be  added to the cart, emppty object trying to add it















hydration failed error: 

we now have a currentError::
when we use our add to cart functionality, it need to double click for anything to happen, when i click once, nothing, happens, but every click, on the second non odd click, then it happens

what is it originating from, we are using:


we import this to:: our page js from prpoducts [id] - dynamic id



in our cart page, we have this::

 const { items, removeItem, updateItemQuantity, emptyCart } = useCart();
 we use react useCart, we currently need a double click to add items to cart







postProduct component must be split into multiple components to keep logic light, postProduct.js edit or create new product explained component:

1:: component fires off logic on submit: for example : uploadToFirebase function, that funcitons ends with 
:    const results = await Promise.all(uploadPromises);
    setUploadedUrlsArray(results.filter((url) => url)); // Remove null entries
     setProduct({ ...product, images: results.filter((url) => url) })

     ---with those setUrls into stripe product
     we can also create random unique id that we create with timestamp and username, that goes between product and files in firebase

     2:: component after firebasee: 

     after our uploadedUrlsArray we must upload entire product to stripe, because know there are big files in firebase and referenfes are sent to stripe::





  useEffect(() => {


    const uploadFilesToFirebase = async( ) => {



  
console.log("postProduct.js product form uploadedUrlsArray: ", uploadedUrlsArray)

   const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    console.log("postProduct upload data return id: ", data.id)
    setProductId(data.id);
    
      }

      if(uploadedUrlsArray.length>0) {

      uploadFilesToFirebase()
      }

  }, [uploadedUrlsArray])



we dp pir await fetch api products, now with a post to create new product, we have our route.js

currently we do firebase first, better to fail early then fail after uploading product to stripe

solution:: we went super slow to find the flow of our component, we first upload to firebase, the files that we add to an array, then we do the promise.all and then we follow up with new state to indicate a stripe product upload can be initiated, we now upload stripe product, with stripe product we have the complete product object with references to big files, make a component have a clear structure, tell a story, on submit we begin uplaoding product, first big files to firebase, then the references are  added to the product object we send up into stripe, now complete object with big file referenfces is uploaded to stripe , we created a new product object stripe api 
stripe.product.create({


})






Create a product 
Creates a new product object.

















  we have a useEffect and it sends of the next wave, it sets of the 



we are fighting the postProduct component, perhaps we should add more individual components to it, to keep the logic simpler, currently we are dealing with the nuances of editing and creating a new product, 
when creating a new product we start with nothing, when editing we must do a patch http request and also we must both keep some values and only add some value, still:: when editing we must only keep track of values to remove and values to add, values that remain the same we can ignore, we must add new values by doing a patch,

perhaps, we should add meta tag id between firebase and stripe 


we have a component that must check if their is a current product, from the param id URL

if there is, then we must








current error answer:: we must probably replace the postProduct file and all the server files and routes again for our application, are our server components in our src/app folder? we have our route.js we must create a post endpoint that takes our client body which must include the data like the file images array
we have our backend server file  in src/appm we must perhaps fix our next.config.mjs
data is in github latest update






might have deleted a bunch of .next server files when doing stuff with the next config file root file next.config.mjs, perhaps deleted a bunch of stuff,

solution:
get file again from github, most recent update, then 
go int postProduct.js and look for the array that is returned from 




this is the code with uploadPromises loop, which we later await with promise.all(uploadPromises)

then code uploadBytes with references to files, then 
we can call update stripe whenever we return our allPromises, using .then((parameter) => {


})


we must update stripe when we have our value from our firebase upload promise.all

remember to add original stripe product unique id to each file upload associated with it, in firebase

with our parameter from our promises completed resolved value we can now update 
stripe:::



    const uploadPromises = files.map(async (file) => {
      const imageRef = ref(storage, `products/${uuid()}`);
      const metaData = {
        productId: productId,
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

    //is this the array with all of the file firebase URLs we have to update our stripe product with?
    await Promise.all(uploadPromises)
  .then((results) => {

    console.log("All uploaded URLs:", results);
    setUploadedUrlsArray(results)

const updateStripeProduct = async ( ) => {
  //error:: this is creating an error, must move functionality to server
  await stripe.products.update(
  productId,
  {
    images: results,
    metadata: {
      order_id: '6735',
    },
  }
);



updateStripeProduct()


}




























we need to create a backend 









we have a current problem, we have a button that fires of a submit event in our post folder file postProduct.js
we have a product upload file, our upload file is in a folder, and it goes like this:: 

it has multiple input all using onchange, we also change multiple states



reminder update state dynamically: create one state object to house multiple values tturned into object properties

have on onChangeHandler, this organises the incoming values dynamically by reading the name of the current onchange input that we must add to our object and update our single state with this single object of multiple properties
















check page.js in api folder, i added usecart there, it is a hook, it taps into functionality easily, like arrow functino variable const variable = function reference

Yes, React hooks can reference functions! Hooks are essentially JavaScript functions that allow functional components to manage state and side effects. 


we have useCart()

we deconstruct wee have items from object 




we have to add cart f unctinoality, this is how, we use hooks to add, we do processes refer tto them arrow functionality expression:: 


import { CartProvider, useCart } from "react-use-cart";

function Page() {
  const { addItem } = useCart();

  const products = [
    {
      id: 1,
      name: "Malm",
      price: 9900,
      quantity: 1
    },
    {
      id: 2,
      name: "Nordli",
      price: 16500,
      quantity: 5
    },
    {
      id: 3,
      name: "Kullen",
      price: 4500,
      quantity: 1
    },
  ];

  return (
    <div>
      {products.map((p) => (
        <div key={p.id}>
          <button onClick={() => addItem(p)}>Add to cart</button>
        </div>
      ))}
    </div>
  );
}



we must add, we have oproduct that we add, we wrapped product app with functinoality





we got a problem with our state, how can we have a signUp component that use an onChange function and dynamically takes multiple states, changing only the state matching the current input


example::
https://www.youtube.com/watch?v=TTiSXMkh28E


basically: handle multiple react state, update all
bascially:: check current active state, last used input, then only change state that matches last modified state state

about onchange react, we want code to run on the event handler trigger::

React onChange is an event handler that triggers when there is any change in the input field.

This event captures the changes in an Input Field and executes the handler function. It is fired when the input field is modified and loses focus. It is one of the form events that updates when the input field is modified.

It is similar to the HTML DOM onchange event but uses the camelCase convention in React.

Syntax:
<input onChange={handleChange} >
Parameter:
handleChange: It is a function call that includes the code to be executed when an event triggers
Return Type:
event: It is an event object containing information about the event like target element and values





we need to run https sites locally::
how to: go to next.js docs, then write https locally:
https during development
, next generate self-signed certificate with next dev ugin the --experimental-https flag:
in terminal write::
next dev --experimental-https

With the generated certificate, the Next.js development server will exist at https://localhost:3000. The default port 3000 is used unless a port is specified with -p, --port, or PORT.  ----be able to use next dev  ------ i installed next like this:: npm -g install next

link:: self-signed certificate::

https://nextjs.org/docs/app/api-reference/cli/next#using-https-during-development




























why https: 
it is encrypted in order to increase security of data transfer::

HTTPS is encrypted in order to increase security of data transfer. This is particularly important when users transmit sensitive data, such as by logging into a bank account, email service, or health insurance provider. Any website, especially those that require login credentials, should use HTTPS.


when we do localhost on our  next.js project, what happens: 
Localhost is a hostname referring to the specific local machine or computer on which the program is currently running. It lets you connect with the services on the local machine's network without accessing an outer network.
so with npm run dev on our next.js project we have a program running on our local machine's network, we want https , it is about device and browser, server and browser, localhost is is program currenlt running machine, outer network, program local, then ecnryption https protocol transfer data via client server, web browser -web server, https ecnrytps all data that passed between the browser and the server, we want secure data transfer, and then we need certificates, certificates  have the public key and intel about specific certificate, domain name certificate was issued for localhost



from their docs::
https://nextjs.org/docs/app/api-reference/cli/next#using-https-during-development

https://nextjs.org/docs/app/api-reference/cli/next#using-https-during-development

we generate a self-signed certificate, https for secure enviroment, 


can also do certificate and key 


about certificate for safe https connection::

SSL certificates are what enable websites to use HTTPS, which is more secure than HTTP. An SSL certificate is a data file hosted in a website's origin server. SSL certificates make SSL/TLS encryption possible, and they contain the website's public key and the website's identity, along with related information.

ssl certificate details::

To view an SSL certificate's details, you can click on the padlock symbol located within the browser bar. Details typically included within SSL certificates include:

The domain name that the certificate was issued for
Which person, organization, or device it was issued to
Which Certificate Authority issued it
The Certificate Authority's digital signature
Associated subdomains
Issue date of the certificate
The expiry date of the certificate
The public key (the private key is not revealed)
















1::search for::
https local development::
https://web.dev/articles/how-to-use-local-https


2:: to use https with local development, we need a certificate signed by a trusted entity (certificate authority), browser check development server's certificate before creating https connection

3:: we can use mkcert to create and sign certificates, we do mkcert -install, and the terminal tells us: the local CA is already installed in the system trust store


4:: custom server next.js, on custom server we can use our .pem files with certificates and keys to 
PEM is a container file format often used to store cryptographic keys. It's used for many different things, as it simply defines the structure and encoding type of the file used to store a bit of data.
we have certificates for safe connections https:: 

What is an SSL certificate?
An SSL certificate is a digital certificate that authenticates a website's identity and enables an encrypted connection. SSL stands for Secure Sockets Layer, a security protocol that creates an encrypted link between a web server and a web browser.






What have we done?::
we have used mkcert to create certificates:: 

about mkcert::
mkcert can be installed on Linux, MacOS, Windows & WSL (See notes below for WSL). After installing run the following command to create a new Local CA:


mkcert -install




currentErrorPlan::
problem is we should do next dev --experimental-https, problem is this stops at :: next is not recognised as



undertand https next.js::



How to set up a custom server in Next.js
Next.js includes its own server with next start by default. If you have an existing backend, you can still use it with Next.js (this is not a custom server). A custom Next.js server allows you to programmatically start a server for custom patterns. The majority of the time, you will not need this approach. However, it's available if you need to eject.

use next.js own server by default,












we must use the recommeded way of establishing a https connection with next.js, from their docs::

next.js says do not use a custom server::
Good to know:

Before deciding to use a custom server, keep in mind that it should only be used when the integrated router of Next.js can't meet your app requirements. A custom server will remove important performance optimizations, like Automatic Static Optimization.
When using standalone output mode, it does not trace custom server files. This mode outputs a separate minimal server.js file, instead. These cannot be used together.

we must have a server

Why do we need to use HTTPS?
HTTPS uses the SSL/TLS protocol to encrypt communications so that attackers can't steal data. SSL/TLS also confirms that a website server is who it says it is, preventing impersonations. This stops multiple kinds of cyber attacks (just like food safety prevents illness).

server is: 
What is a Localhost Server? A local host server refers to server software or a setup that uses localhost or 127.0. 0.1 as the access point to run on your machine

server:: a computer or computer program which manages access to a centralized resource or service in a network.