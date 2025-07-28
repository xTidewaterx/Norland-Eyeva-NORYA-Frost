focus, check steps to any aciton, divide into simple blocks, how to update price, confirm that price is being update in any shape or form, then take that update and go next step, code sequential




just keep focusing on good spacing, fix the product text on small screens, the price is too big in size

fix logo with more movement

and also have produkter text

we are now using a sort of cache method to pre load image
Image caching improves website and app performance by storing frequently accessed images locally, reducing the need to download them repeatedly.

access locally to reduce download

Reducing network requests:
Subsequent visits to the same site or app will then load those images from the local cache instead of fetching them from the server. This reduces the number of network requests, which can significantly speed up loading times, especially for images that are used on multiple pages or within the app. 

less network requests



we are creatingg space and making sure to have the satisfying collection of tiles that apple have divided beautifully into simple
image squares or rectangles, we have equal sizes and beautiful separations like APPLE, breath space and have increadibly appealing nationalism combined with beauty you can own and become everything scandinavian and beautiful heritage and arctic unique















we are using firebase, firebase database, build application by allowing secure access ti the database directly from client-side code

data 

database firebase hosted backend services such as a realtime database, cloud storage, authentication


we now have user list of sellers, we can visit profile and chat sellers are present, and they must show products matching their user id, uid match, a profile is all the cretaions of a sller any uid match, now doucments in firestore, we have documents inside of documents, they belkong together, the chats belong in collections, add profile add updates  firebase updates then get tht when fetching profile, any additions in friebase msut be added to our profile resuce, we have bigg big files firebase has objects json in collections


we have changed rules for our firestore written file path and now rules allow read and write operatgions firestore add documents to a collection, we have particiapnts check for participants in a chat rules they can read write


chats collections, then in the collections we have documents for each chat in that top collection, in each chat we have different particiapnts property json, we can then in our rules check that our chat has the coirrect particiapnts for the mto perform read write operations in firebase firestore
Cloud Firestore is a flexible, scalable NoSQL cloud database offered by Firebase and Google Cloud, designed for mobile, web, and server development. It allows developers to store and sync data for their applications, 


both must have permissions participants database collections documents


collectiions of conversations chats

messages subcollections of conversations collection

messages (subcollection of conversations)
  |_document0
      |_ message (string of actual message)
         senderId (sender user id)
         recipientId (recipient user id)
         status (message sent status)
         timestamp (message time sent)
  |_document1
      |_ message (string of actual message)
         senderId (sender user id)
         recipientId (recipient user id)
         status (message sent status)
         timestamp (message time sent)
    ...





Transactions and batched writes | Firestore - Firebase

Firebase
https://firebase.google.com › Documentation › Firestore
The transaction contains read operations after write operations. Read operations must always come before any write operations. The transaction read a ...


we have insufficient permissions because every user must be added to our firebase and firestore, difference firebase and fiurestore user collection

add every user into firestore to use firestore snapshot and have instant listener updates on auth object



You can listen to a document with the onSnapshot() method. An initial call using the callback you provide creates a document snapshot immediately with the current contents of the single document. Then, each time the contents change, another call updates the document snapshot.







now we add our users to that collection, add all users to that



we have firebase chat collection documents in database, between participants, now log auth.onautstachanged l;listener with param, we have current user, can list chats user particiapte in

https://localhost:3000/profile/biFW28aVVWdGtzt8yldZOzXzJDV2

https://localhost:3000/profile/biFW28aVVWdGtzt8yldZOzXzJDV2



our file page.js in  profile uid page.js


use firebase for messagingg instead,


create a firebase solution use firebase realtime

Database (Realtime Database or Cloud Firestore):
Choose a database:
Firebase Realtime Database: Ideal for simpler chat apps with frequent, small updates due to its low latency. 
Cloud Firestore: Offers more flexibility and scalability for complex features and larger user bases, with a more structured data model.
Data Structure: Design a database structure to st

we must use realtime firebase database, then we must have UI that displays this

and we need authentication



example flow, user auth sign in, then list of their chats:: 


Example Flow:
User signs in (e.g., anonymously or with Google).
The app listens for new messages in the designated chat path in the database.
When a user types a message and clicks send, the message data is written to the database.
The database automatically synchronizes the new message to all connected clients, and the UI updates in real-time.

how to list users chats: 

each chat document in database would contain participants, list based of the user auth being a particiapnt of that doucment chat in the database


Firebase Database Structure:
A common approach is to have a chats collection (or node in Realtime Database) where each document/node represents a chat, and a userChats collection/node that maps users to the chats they are part of.
chats: Each chat document/node would contain details like participants (an array or map of user IDs), lastMessage information, and potentially createdAt and updatedAt timestamps.
userChats: For each user, this would store references to the chats they are involved in, possibly including metadata like lastMessage and unreadCount specific to that user for each chat.






chat database collections documents::



To list a user's chats in a simple Firebase chat application, the following steps are typically involved, assuming a data structure that links users to their conversations:
Firebase Database Structure:
A common approach is to have a chats collection (or node in Realtime Database) where each document/node represents a chat, and a userChats collection/node that maps users to the chats they are part of.
chats: Each chat document/node would contain details like participants (an array or map of user IDs), lastMessage information, and potentially createdAt and updatedAt timestamps.
userChats: For each user, this would store references to the chats they are involved in, possibly including metadata like lastMessage and unreadCount specific to that user for each chat.
Querying User-Specific Chats:
Cloud Firestore: To retrieve a specific user's chats, query the chats collection where the participants array contains the current user's ID. Order the results by lastMessage.timestamp in descending order to show the most recent chats first.
JavaScript

        import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
        import { db } from "./firebaseConfig"; // Your Firebase configuration

        const currentUserUid = "YOUR_CURRENT_USER_UID"; // Get this from Firebase Authentication

        const q = query(collection(db, "chats"), 
                        where("participants", "array-contains", currentUserUid), 
                        orderBy("lastMessage.timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userChats = [];
            snapshot.forEach((doc) => {
                userChats.push({ id: doc.id, ...doc.data() });
            });
            console.log("User Chats:", userChats);
            // Update your UI with userChats
        });
Firebase Realtime Database: Navigate to the userChats node for the current user and then retrieve the associated chat details from the chats node.
JavaScript

        import { ref, onValue } from "firebase/database";
        import { database } from "./firebaseConfig"; // Your Firebase configuration

        const currentUserUid = "YOUR_CURRENT_USER_UID";

        const userChatsRef = ref(database, `userChats/${currentUserUid}`);
        onValue(userChatsRef, (snapshot) => {
            const chatsData = snapshot.val();
            if (chatsData) {
                const chatIds = Object.keys(chatsData);
                // Fetch details for each chatId from the 'chats' node
                chatIds.forEach(chatId => {
                    const chatRef = ref(database, `chats/${chatId}`);
                    onValue(chatRef, (chatSnapshot) => {
                        console.log("Chat Details:", chatSnapshot.val());
                        // Update your UI
                    });
                });
            }
        });
Real-time Updates:
Utilize Firebase's real-time capabilities (e.g., onSnapshot for Firestore, onValue for Realtime Database) to automatically update the list of chats whenever there's a new message or a change in a chat the user is part of.
Displaying Chats:
Render the retrieved chat data in a list format, showing relevant information like the other participant's name (for private chats), the last message, and potentially an unread message count.


























Yeah, CometChat definitely caters more to startups or companies with a bigger budget. $2,868 a year is no small potatoes—especially if you’re just starting out or experimenting solo.
💡 If you’re looking for a chat solution on a budget, I can help you explore free or low-cost alternatives. There are platforms like:
- Sendbird – has a limited free tier and scalable pricing
- Pusher Chatkit – was popular before retiring, but its alternatives may still be helpful
- Stream Chat – offers competitive plans and sometimes startup credits
- Firebase – not a full chat SDK but can be customized for real-time messaging
Want me to help you compare options based on what you're building? Whether it's a hobby app or something more serious, we can find something that won’t break the bank



problem with valid user selection, isolate where this must originate form, where are we providing users, we must do it before render, it happens when we write, it checks for defined users

we have sending message, understand the process of sending a message with cometchat, we have cometchatmessagecomposer suspect for sending cometchatemessageComposer

  return (
    <div className="chat-container">
      <div className="chat-header-row">
        <button className="chat-back-button" onClick={onBack}>
          ⬅️ Back
        </button>
      </div>

      <CometChatMessageHeader item={item} type={type} />
      <CometChatMessageList item={item} type={type} />
      <CometChatMessageComposer item={item} type={type} />
    </div>
  );
};

export default CometChatMessages;


AI-oversikt
To send a message using CometChat, you'll typically use the sendTextMessage() or sendMediaMessage() methods, depending on whether you're sending text or media. You'll need to specify the receiver (user or group) and the content of the message. CometChat also supports custom messages for more complex scenarios. 




error is that we must check all our uikit settings

we must find out why we are not importing it properly, is it simply not finding our installed dependencies? it is listed in our package.json under dependencies

  "dependencies": {
    "@cometchat-pro/chat": "^3.0.10",
    "@cometchat/calls-sdk-javascript": "^4.1.0",
    "@cometchat/chat-sdk-javascript": "^4.0.13",
    "@cometchat/chat-uikit-react": "^6.1.1",
    "@fortawesome/fontawesome-free": "^6.7.2",
    "@fortawesome/fontawesome-svg-core": "^6.7.2",
    "@fortawesome/free-solid-svg-icons": "^6.7.2",




we must implement all necessary files to render our comet chat ui kits, have auth uid, and render our ui kit components, have the files in the correct folders, import and render ui kits components jsx, html dom


problem that our window is not defined, windows are on the borwser client side, perhaps avoid server side rendering

we have our code for our cometchat ui kit


https://www.cometchat.com/docs/ui-kit/react/next-conversation

https://www.cometchat.com/docs/ui-kit/react/next-conversation


we reutrn cometchat converrsations active item conversations cometchatconversations, here is what we want cometchat conversations:: 

   useEffect(() => {
        // Retrieve the logged-in user from CometChat's login listener
        let loggedInUser = CometChatUIKitLoginListener.getLoggedInUser();
        setLoggedInUser(loggedInUser);
    }, [CometChatUIKitLoginListener?.getLoggedInUser()]); // Dependency array to trigger effect when user changes

    return (
        <>
            {/* Render CometChatConversations only if a user is logged in */}
            {loggedInUser && (
                <>
                    <CometChatConversations
                        activeConversation={activeItem instanceof CometChat.Conversation ? activeItem : undefined}
                        onItemClick={(e) => {
                            setActiveItem(e); // Update the selected item state
                            onSelectorItemClicked(e, "updateSelectedItem"); // Trigger callback with selected item
                        }}
                    />
                </>
            )}
        </>
    );
}; 









basically we just want to render our chatlist


# 1:: we need to initialize cometchat
CometChatUIKit.init(UIKitSettings)!
  .then(() => {
    console.log("CometChat UI Kit initialized successfully.");
    // You can now call login function to authenticate users
  })
  .catch((error) => {
    console.error("CometChat UI Kit initialization failed:", error); // Log errors if initialization fails
  });



# 2:we need to only render if we have this user id:
Use pre-generated test users:
cometchat-uid-1
cometchat-uid-2
cometchat-uid-3

import { CometChatUIKit } from "@cometchat/chat-uikit-react";

const UID = "UID"; // Replace with your actual UID

CometChatUIKit.getLoggedinUser().then((user) => {
  if (!user) {
    // If no user is logged in, proceed with login
    CometChatUIKit.login(UID)
      .then((user) => {
        console.log("Login Successful:", { user });
        // Mount your app
      })
      .catch(console.log);
  } else {
    // If user is already logged in, mount your app
  }
});

now we mount our APP with integrated conversation list = message!!!

# 3::







doing the integration with cometchat builder next js

we have a problem installing our dependencies form cmoet chat, this command gives us an error, and no the folder we want so we can import form it in our src app folder ::


npm install @cometchat/chat-uikit-react@6.0.7 @cometchat/calls-sdk-javascript


crucial steps for cometchhat::

1:: initialize cometchat with config intel from cometchat dashboard

2::authenticate

3:: render cometchat component, and turn off ssr server side rendering::

  return (
    /* The CometChatApp component requires a parent element with an explicit height and width
   to render properly. Ensure the container has defined dimensions, and adjust them as needed  
   based on your layout requirements. */
    <div style={{ width: "100vw", height: "100dvh" }}>
      <CometChatProvider>
        {(selectedUser || selectedGroup) && (
          <CometChatApp user={selectedUser} group={selectedGroup} />
        )}
      </CometChatProvider>
    </div>
  );
};

export default CometChatNoSSR;

no rendering our cometchat app, and we have div stlye defined, we have component that is linked with current user intel id, get user id then parameter, we have our return data by combining function of database cometchat.getuser, we have our cometchap app, we have our cometchat app, import installed code to create somethign linked database, we have app id region and auth key from env folder we import process.env

import React, { useEffect, useState } from "react";
import {
  CometChatUIKit,
  UIKitSettingsBuilder,
} from "@cometchat/chat-uikit-react";
import CometChatApp from "../CometChat/CometChatApp";







what have i learned, find good methods plan ahead, and make sure to divide different tasks, make it clear where things break, have single top truth, 


backend 

have backend endpoints




API routes provide a solution to build a public API with Next.js.

Any file inside the folder pages/api is mapped to /api/* and will be treated as an API endpoint instead of a page. They are server-side only bundles and won't increase your client-side bundle size.

we have clear distinctions between and backend api endpoint response, ahndler on a certain api route iwth name file, then res.status(200).json({message: ''})









https://www.cometchat.com/docs/ui-kit/react/v5/integration/next-js


https://www.cometchat.com/docs/ui-kit/react/v6/integration/next-js





how to






Function Parameters and Arguments
Earlier in this tutorial, you learned that functions can have parameters:

function functionName(parameter1, parameter2, parameter3) {
  // code to be executed
}
Function parameters are the names listed in the function definition.

Function arguments are the real values passed to (and received by) the function.





Yes, Next.js API routes are implemented using serverless functions. These functions are designed to handle HTTP requests and are deployed and executed on demand. They are particularly useful for building RESTful APIs, handling form submissions, authentication, and other server-side logic within a Next.js application. 


// pages/api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from Next.js API!' });
}
This code creates an API endpoint at /api/hello that responds with a JSON message. 

parameter,  function parameters, names listed function definnition function functionName(parameters) {

  code to be launched
}






























copy code, what code, we must initialize our code, link it to database fair profile, then get data upgrades form them 

we want conversation component, meanign we must


reutnr cometchatocnversations f user true in same component we do cometchat ui kit init uikit settings







we must render conversations, easy::
src / page folder, initialize cometchat ui kit, login a user, with our uid

then cometchatuikit login,


server side rendering manipulate




to install comet chat, install dependencies::

Add Dependency
This developer kit is an add-on feature to CometChat Javascript SDK, so installing it will also install the core Chat SDK.

npm install @cometchat/chat-uikit-react@5.x





initialize cometchat, have a cometchat-init.js file in the src folder
with env secret intel, 








we must download the correct files for our cometchat, then we can create a chat compononent that has the correct design and the correct imports, we can then use our config file to reference our right to a profile on the comet chat platform with our design files, we have 

initialize comet chat and use their code to utilize it



we must integreate our comet chat  integrate comet chat 

integrated into any app, api for in-app messaging
fix cometchat login use cometchat ui, implement cometchat
integrate cometchat into any app

we must add our config and then our UI, we must feetch our comet key from our backend, await response.json

getg our authKey from our config files

we have a profile unique identifier in database



always add current task here before closing project
currentTask::

fix landing page::











today we changed error handling, we added if else statements, we had object with await firebase d atabase, await promise resolve, then we set state and used the statge object in the next request, we hadm ultiple objects that we combined, we requested the server with const await, url resource spcific url

specific url resource error handling
http endpoint allows applicattions to communicate and exchange data via URL pathways

HTTP endpoints are straightforward in structure, consisting of a few basic elements:

link applications use resource specific URL

endpoint address guiding data, http domain, http endpoints

connecting data transfer, endpoint address, gudiing data from a particular location, server send and recieve datga, software that can connect endpoint specific url on a server


URL: The URL is the endpoint’s address, guiding data to or from a particular location. It consists of the protocol (HTTP or HTTPS), the domain (e.g., www.example.com), and, often, a path (e.g., /api/data) to a specific resource.

HTTP Endpoints
HTTP endpoints are essential in today’s software systems, acting as the pathways that allow different applications to communicate and exchange data seamlessly. Whether connecting to services within the same organization or across the globe, HTTP endpoints enable smooth data transfer in diverse and complex systems. This guide explores what HTTP endpoints are, their core components, and some everyday scenarios in which they play a crucial role.

http



make it so that we dont have the sign in if we are already signed in, in the signIn.js, perhaps just deliver it so that we either deliver that, or we deliver something else
we must cgheck our authContext, if true currentUser, then in our page.js profile folder, we to a ternary







question::


add so that when you click the profile nav icon, you can sign in
and then add that you can click the profile icon and get current user 

we now have done that, we have current user,
we have it because we ask a custom context hook to give it to us,
we just ask the context like this:

  const { user, handleSignOut } = useAuth();



our auth context, does a createContext, then it does useEffect sessionstorage.get item, useEffect probably because it needs to await the results from the auth database
then it does a onauthstatechanged where it attempts to listen to the auth object, we create an auth object with our auth getauth(app) from our config

we tghen have our authcointext, it has a user, we set our current user from our listening to the onauthstatechanged auth object, then we provide that in the authcontext.provider, and then to use this context we ghave creatged, we just reference our authContext function, useAtuh equals get the return of our authcontext, our return is the provider value, we have children, it gives the value to the children


useContext returns the context value for the context you passed. To determine the context value, React searches the component tree and finds the closest context provider above for that particular context.

To pass context to a Button, wrap it or one of its parent components into the corresponding context provider:

function MyPage() {
  return (
    <ThemeContext value="dark">
      <Form />
    </ThemeContext>
  );
}

function Form() {
  // ... renders buttons inside ...
}







we have a handlechange event, we have our signinsuser , we also set our authobject, with our new name and value when event fires, our signinuserfunction is fired when event asks, we have state, and then state ready on  creation method database















 how do you add products to our create cart session, we must add 
products to the create checkout session array

here it is, we are getting our id from the url, this code::
    const { searchParams } = new URL(req.url);
    const priceId = searchParams.get('price');
    //we need to get all price ids

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_


question:: now, can we make it into a post endpoint, 
and then recieve the array of paymentintent











our checkout session currently functions like this:
we can click on a product, go to products page, add that product to cart, go to cart and then have a checkout session url, problem is our cart is not exactly matched in our checkout session payment UX menu






endpoints data resources  we make requests, we respond to events, resources on different file folder endpoints url







http method redirect url resources, merge objects {..., ...object}

request data merge objects react to events, preload data next js

1. Faster Initial Load: By fetching data before a component renders, the application avoids delays, making the initial page load faster. This is achieved by pre-rendering pages with the necessary data already available.
pre-rendering pages, content is made ready, then avoid doing it for every request, initial effort then incredible performance



fixing landing page heading on different screens


copy create checkout session::



const createCheckoutSession = async () => {


const url= "https://localhost:3000/api/checkout_sessions";


  const response = await fetch(url, {


       method: 'POST',
          headers: {
              'Content-Type': 'application/json' // Or 'text/plain', 'application/x-www-form-urlencoded'
          },
          body: JSON.stringify(postData) // Convert data to JSON string
      
  });


  console.log(response.url)



  const data = await response.json();

console.log(response)

console.log(data)


if (data.url) {
  window.location.href = data.url;
}




}






























we have now created a link with our stripe api, we can redirect to a database
provided we have sufficient data intel sent between our client and server route next.js file folder endpoint, 

we now have an api url endpoint connection, now post method client request body, paramteres, values to be decided, to acknowledge that our values are to be given to our functions result production value

now 
payment possible link products and price from product price object default price properties product database, now server pre download server control, less cache less repetition

not valid json, folks saying it is about json and html, trying to parse json as html for example, we are possibly returning a html page










okay, current error is due to link between backend route and frontend client request, 
problem is the request to the endpoint must carry the correct object for us to get the priceId, do a consle.log













problem with checkout session
    const session = await stripe.checkout.sessions.create({

solution::
our route.js in checkout sessions needs to know what products we have in our cart, and from that, it needs all of our products combined with their respective price object,

so we have our request body, this should be read by route.js 
:: how to read request::

Check if the request method is POST using req.method === 'POST'
Extract the data from the request body with:
const data = await request.json(); (for JSON data)
const formData = await request.formData(); (for form data)

2 solution::
we must read client request on create checkout session, our next.js route should then read a request that contains our cart products, and our cart now has products that include price id, default price and those properties that our cart needs to create a checkout session with json data,json data ojbect with properties, we get our price id from our product id like this: 

const price = await stripe.prices.retrieve(product.default_price);

i guess it read from the api endpoint id query param


we need to make it so that our 

because our cart product now has a defefult price and a price property::


created
: 
1750105677
default_price
: 
"price_1RajdJJr4Lyco16ujZLJH2LF"
description
: 
"Norland 845 Norland 85 Norland 85"
id
: 
"prod_SVl9r7Lia8Ugmx"
images
: 
(3) ['https://firebasestorage.googleapis.com/v0/b/norlan…=media&token=5dc4b6e0-3d05-4851-b262-826c15ebf2a1', 'https://firebasestorage.googleapis.com/v0/b/norlan…=media&token=87b82ee0-6d33-4bc4-80f2-14d8908b73a7', 'https://firebasestorage.googleapis.com/v0/b/norlan…=media&token=6c603663-c66f-43ae-8c4e-83e82645d9bd']
itemTotal
: 
4292925
livemode
: 
false
marketing_features
: 
[]
metadata
: 
{}
name
: 
"Norland 85"
object
: 
"product"
package_dimensions
: 
null
price
: 
858585
quantity
: 
5
shippable
: 
null
statement_descriptor
: 
null
tax_code
: 
null
type
: 
"service"
unit_label
: 
null
updated
: 
1750105678
url
: 
null
[[Prototype]]
: 
Object
length
: 
1
[[Prototype]]
: 
Array(0)


so we get our price and we use price id from our product default price, there we have price id,

just use installed stripe. await stripe.prices and await stripe.products


created
: 
1750105677
default_price
: 
"price_1RajdJJr4Lyco16ujZLJH2LF"
description
: 
"Norland 845 Norland 85 Norland 85"
id
: 
"prod_SVl9r7Lia8Ugmx"
images
: 
(3) ['https://firebasestorage.googleapis.com/v0/b/norlan…=media&token=5dc4b6e0-3d05-4851-b262-826c15ebf2a1', 'https://firebasestorage.googleapis.com/v0/b/norlan…=media&token=87b82ee0-6d33-4bc4-80f2-14d8908b73a7', 'https://firebasestorage.googleapis.com/v0/b/norlan…=media&token=6c603663-c66f-43ae-8c4e-83e82645d9bd']
itemTotal
: 
4292925
livemode
: 
false
marketing_features
: 
[]
metadata
: 
{}
name
: 
"Norland 85"
object
: 
"product"
package_dimensions
: 
null
price
: 
858585
quantity
: 
5
shippable
: 
null
statement_descriptor
: 
null
tax_code
: 
null
type
: 
"service"
unit_label
: 
null
updated
: 
1750105678
url
: 
null
[[Prototype]]
: 
Object
length
: 
1
[[Prototype]]
: 
Array(0)




we have properties object, we await data endpoint url resource, we await stripe.products




unexpected end of json input, perhaps log json input then


just add the default price to our product, 
if you have current product id


we added to our object by doing await fetch on an endpoint and then combining two objects using the properties from one object and adding to another object, then our complete object was sent to our cart, that adds product objects and needs the price porperty


An object is a collection of properties, and a property is an association between a name (or key) and a value. 

we combined two objects, we have await in an async function, we await, other processes can move along while we await for certain code lines, we await the copmletion, a resolved value from our await stripe.prices stripe is our stgripe download in our project, we have json package lock it says stripe


we await un async function, now we have the properties we need, just combine objects when they are meant to be solidified, we can combine any object


merge objects {add objectts with ...}






Approaches for Merging Objects
1. The Spread Operator ( ... )
The spread operator (...) is a common approach to merge objects in JavaScript. It has the form {...object1, ...object2}. When properties with the same keys exist in the source objects, the spread operator overwrites the values in the target object with the latest source object’s values.

const defaults = { color: 'red', size: 'medium' };
const userSettings = { color: 'blue' };

const combinedSettings = { ...defaults, ...userSettings };
console.log(combinedSettings);
// Output: { color: 'blue', size: 'medium' }

we have objects and we do a const combinedObject = {...object, ...object}





  let productWithPrice = await getProductPrice(product.id);
  const price = await stripe.prices.retrieve(product.default_price);

  productWithPrice.description = product.description;
  productWithPrice.images = product.images;
    productWithPrice.price= 555555;


    const completeProduct = {...product, price: price.unit_amount}



now add items to our cart with price id, how to add to cart, entire product object



we must access our cart items 

  const { items, removeItem, updateItemQuantity, emptyCart } = useCart();

from our component page.js in our file folder checkout







































now we can create a checkout session with price id 


now we are returning product object with correct objects, we have await on and endpoint url, we await 


In Node.js, await is a keyword used within async functions to pause the execution of the function until a Promise is resolved (either fulfilled or rejected). It allows for writing asynchronous code that looks and behaves more like synchronous code, improving readability and maintainability. 


most important knowledge from today, build code and intel, we just added the price object to our product object, now it carries the neccessary data, the price id is now included in our price object, now we have our updatedProduct await stripe products update, product.id


now we just create a price object, then update our product with the product.id then add 

we have default price, then we take our pricedata price object and add it to our product 
top object, now product object has our pricedata.id

here is how we update our product, unique identifier, node await stripe.products.updatep roduct.id 



To update a product in the Stripe API, you need to make a POST request to the /v1/products/{product_id} endpoint, where {product_id} is the ID of the product you want to update. The request body should include the parameters you want to modify, and any parameters not provided will remain unchanged. 


    //step 3::
      // Step 3: Update the product to set the default price
        const updatedProduct = await stripe.products.update(product.id, {
            default_price: priceData.id, // Set default price
        });


parameters default_price



The Price object 
Attributes

id
string
Unique identifier for the object.


active
boolean
Whether the price can be used for new purchases.


currency
enum
Three-letter ISO currency code, in lowercase. Must be a supported currency.


metadata
object
Set of key-value pairs that you can attach to an object. This can be useful for storing additional information about the object in a structured format.


nickname
nullable string
A brief description of the price, hidden from customers.


product
string
Expandable
The ID of the product this price is associated with.

Create a product 
Creates a new product object.

Parameters

name
string
Required
The product’s name, meant to be displayable to the customer.


active
boolean
Whether the product is currently available for purchase. Defaults to true.


description
string
The product’s description, meant to be displayable to the customer. Use this field to optionally store a long form explanation of the product being sold for your own rendering purposes.


id
string
An identifier will be randomly generated by Stripe. You can optionally override this ID, but the ID must be unique across all products in your Stripe account.


metadata
object
Set of key-value pairs that you can attach to an object. This can be useful for storing additional information about the object in a structured format. Individual keys can be unset by posting an empty value to them. All keys can be unset by posting an empty value to metadata.


parameters in our product objectg, new product object parmaeter, paramter default price data, price object




parameter product object::



    //step 3::
      // Step 3: Update the product to set the default price
        const updatedProduct = await stripe.products.update(product.id, {
            default_price: priceData.id, // Set default price
        });



we can just add values with parameter into object, 


post stripe api endpoint post v1 products api products we have endpouint endpoint then await stripe product.create({

  parameter
})

in the end we figured that we had to link two objects to each other, we though there was an automatic system, but basically the two objects have to reference each other, the price object should be added to the product object, we can create a product object, endpoints is v1/pricces 

The Price object 
Attributes

id
string
Unique identifier for the object.

we have a unique identifier object ofr the product 


now our product object has a default price that is a price id::


{
  id: 'prod_SVl9r7Lia8Ugmx',
  object: 'product',
  active: true,
  attributes: [],
  created: 1750105677,
  default_price: 'price_1RajdJJr4Lyco16ujZLJH2LF',



  we combined products, we can update our product object, we just do 
  a variable, 

  const updatedProductg in node.s

The fetch function takes two arguments: the URL to fetch and an options object. The options object is the Request object that you can use to customize the request. The function returns a Promises that resolves to a Response object.





product objectg with price objectg::

default_price_data
object
Data used to generate a new Price object. This Price will be set as the default price for this product.

Show child parameters



HomeGet startedAbout the APIsProducts and prices
How products and prices work

stripe::

products and prices, 




















add a price to a product in stripe::



You can now create a product and the associated price(s) at the same time in your Dashboard. Below is a demo of the latest Product Editor, but you can also create product & prices directly when creating or updating subscriptions or invoices via the Dashboard or API.

create a product and the associated 













noting in the backend route.js in product what is actually the code for creating a product 

 creating a product stripe api 








fix price id addition on product objects










now add price id




this is how 




























firstly 


gotta figure out how add product is made, also, our code


we create an extra file for addding the important functionality of our component that adds products, via friebase and stripe, uses a promise.all

we added literature file for product handling

create product stripe::

const stripe = require('stripe')('sk_test_4S68v29DeKcE4RxJcrJnUn5s');
const product = await stripe.products.create({
  name: 'Gold Plan',
});


we have to add our add product component, and then we have to add our, edit product component,  study the good code 





Once payment is successful, the Checkout Session will contain a reference to the Customer, and either the successful PaymentIntent or an active Subscription.

complete payment with checkout session, checkout session objects has attributes like ::

line_items
nullable object
Expandable
The line items purchased by the customer.

also it has id and status::


{
  "id": "cs_test_a11YYufWQzNY63zpQ6QSNRQhkUpVph4WRmzW0zWJO2znZKdVujZ0N0S22u",
  "object": "checkout.session",
  "after_expiration": null,
  "allow_promotion_codes": null,
  "amount_subtotal": 2198,
  "amount_total": 2198,
  "automatic_tax": {
    "enabled": false,
    "liability": null,
    "status": null
  },


  api routes endpoint jsonm response res.status 200.json {message:}


  create checkout session on your server, then client can request a certain checkout session endpoint on your server, send data server client, server endpoint 

  You can create a Checkout Session on your server and redirect to its URL to begin Checkout.

Related guide: Checkout quickstart


You can create a Checkout Session on your server and redirect to its URL to begin Checkout.

check currentTask, also, we do await stripe.list then we  list all of our products for exmaple, just begin with stripe for stripe request, initialize the stripe variable with stripe intel secret key code
cryptic

payment, for many products use checkout sessions, you have endpoints on stripe api, use checkout session on server, create checkout session on server, this can be the resrouce on your endpoint http method, request reqsource on server route entire operation, meaning 

An endpoint is a remote physical or virtual device that connects to a network, creating an entry or exit point for data communication.




we create a checkout session on our server, then we send data to client, we can have successful payment, include products, include product id, price id, include line items, and URL for different redirectrs 




Routing: Defining Routes | Next.js
Next. js uses a file-system based router where folders are used to define routes. Each folder represents a route segment that maps to a URL segment. 


in next.js you can have folders used to define route, file system based router, on URLs you can have resources that od soemthing and return something 


about stripe things::

https://mohasin-dev.medium.com/differentiate-between-stripe-charge-payment-intent-and-stripe-session-f3e6a3235bec

https://mohasin-dev.medium.com/differentiate-between-stripe-charge-payment-intent-and-stripe-session-f3e6a3235bec

have a stripe checkout session on your server, redirect the client on the frontend::


Stripe Session:
A Stripe Session is a mechanism provided by Stripe Checkout to create a user-friendly and secure checkout experience for customers.
It simplifies the integration process for accepting payments by handling various aspects of the payment flow.
Sessions are used to create hosted checkout pages, reducing the PCI DSS compliance requirements for businesses.
Stripe Sessions typically involve the use of client-side Stripe.js library for front-end integration and server-side code for creating and managing the checkout session on the server.





what we need to do, add price id to product, and then we can pay for products with a checkout sessions or paymentintent when we can reference the price id 


re-enter create productg component, just in the right place

we gotta check where do we create a product, and how can we add price id to that product
Yes, adding a price ID to your product object in Stripe is generally a good practice. Stripe requires each product to have at least one associated price, and the price ID helps link the product to its pricing details.



we want to have a checkout session or a paymentintent, something on stripe api, that allows us to complete a payment

1 --   create a next.js api route

2 -- connect to stripe, use stripe api, give server backend all products that are in cart
3  --- server has created a checkout session, with correct id you can now go from this server next endpoint  to stripe checkout page, where client can give payment information


about checkout sessions, it has attributes like custgomer email, id and currency, and 

{
  "id": "cs_test_a11YYufWQzNY63zpQ6QSNRQhkUpVph4WRmzW0zWJO2znZKdVujZ0N0S22u",
  "object": "checkout.session",
  "after_expiration": null,
  "allow_promotion_codes": null,
  "amount_subtotal": 2198,
  "amount_total": 2198,
  "automatic_tax": {


link:: https://docs.stripe.com/api/checkout/sessions https://docs.stripe.com/api/checkout/sessions
checkout session payment purchase checkout session attribute id currency account tax custom fields allow promotion object id enabled local payment status unpaid
a checkout session from stripe can have a successful payment::

Checkout Sessions 
A Checkout Session represents your customer’s session as they pay for one-time purchases or subscriptions through Checkout or Payment Links. We recommend creating a new Session each time your customer attempts to pay.

Once payment is successful, the Checkout Session will contain a reference to the Customer, and either the successful PaymentIntent or an active Subscription.



## sipmlest instruciton, how to accept payment stripe::

with the payment methods api, combine a paymentmethod with a paymentintent api to accept a payment


## sipmlest instruciton, how to accept payment stripe stop stop stop


explanation 
## payment intents api:: 










## checkout session::
















complete payment
payment method api







to accept payment, we can use a paymentintent to accept a payment
payment methods api, combine a payment method





we must ocmplete payment 

complete payment 
create checkout session
get id from checkout session

go to stripe page for payment



payment methods api

payment method 





we now have our next.js ednpoint route in our app/api to create a checkout session, our client requests this endpoint like this::

  return (
    <form action="/api/checkout_sessions" method="POST">
      <section>
        <button type="submit" role="link">
          Checkout
        </button>
      </section>
    </form>
  )
}


we submit a post request on an endpoint that is api checkoutgsession, both are inside the app folder, route next.js http method, folders
our backend route in app/api is requested its resrouce by our client, route explained gives us resources::

An API route is the definition of paths and methods (like GET, POST, PUT, DELETE) in an API. It’s a broader concept that includes the path, the method, and often the logic that gets executed when that path and method are used.






for our url searchparams property,, we use that in our checkout button page, it checks if we have canceled our done our success::

The searchParams read-only property of the URL interface returns a URLSearchParams object allowing access to the GET decoded query arguments contained in the URL.











i need to create a place for client to be able to initiate a paymentintent, to create a paymentintent. do this:: 


Create a PaymentIntent 
Creates a PaymentIntent object.

After the PaymentIntent is created, attach a payment method and confirm to continue the payment. Learn more about the available payment flows with the Payment Intents API.

When you use confirm=true during creation, it’s equivalent to creating and confirming the PaymentIntent in the same call. You can use any parameters available in the confirm API when you supply confirm=true.

const stripe = require('stripe')('sk_test_4S68v29DeKcE4RxJcrJnUn5s');

const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
  automatic_payment_methods: {
    enabled: true,
  },
});


we create a payment intent with our stripe and secret key initialization, then we attacgh payment method, we have amount currenct  curtly bawe have stripe api


stripe api uses object, payment intent created, different statuses, we have post method on endpoint payment intents

then response from server object with payment mmethod and confirmation method automatic payemnt amount and create, collect amount by paymentintent parameter amount payment intetn object

paymentintent has parameters, it is an object

we await stripe initialization and we do paymentintents.create on top of our stripe initialization



After the page has been loaded for the first time, navigating to other pages on the same website is typically faster, as only necessary data needs to be fetched, 

When the application is first loaded, the user may notice a slight delay before they can see the full page, this is because the page isn't fully rendered until all the JavaScript is downloaded, parsed, and executed.

we download all the javascript, we make it ready, following page visits are no much faster 



Server-Side Rendering (SSR) in Next.js involves generating HTML on the server in response to each request. 




we do not need to double click, that was in the strange simulating a different device menu, double click was necessary, does it happen to other click events, other than cart as well?

well we can do everything up until our carft, create a checkout cart, with a total amount of editable items.



server load

Server-side rendering bridges the gap between traditional web rendering and modern JavaScript frameworks by generating HTML on the server and sending it to the browser. This method gives you major advantages: faster initial loads, better SEO, and a smoother user experience across devices.


server side rendering,a server that has already made content ready, meaning, faster innitial loads, and better seo, smoother user experience

Yes, cached and preloaded can often be used interchangeably, particularly in the context of data or resources being stored for faster access.

server can save content, and have it ready


server side rendering, render on the server, instantly ready for the client::

Yes, server-side rendering (SSR) can involve prefetching or preparing content that the client hasn't explicitly requested yet. This is often done to improve performance and user experience by reducing load times when navigating between pages.


client, can get instant accsess from server rather than the database 

Yes, the client still needs to retrieve the content from the server, but prefetching and caching make the process faster by reducing the time spent on fetching and processing data.
Why is it faster?
- Reduced Latency
- When the server has already downloaded and prepared the content, it can serve it instantly instead of making a fresh request to an external database or API.


Client-side Rendering (CSR)
In Client-Side Rendering (CSR) with React, the browser downloads a minimal HTML page and the JavaScript needed for the page. The JavaScript is then used to update the DOM and render the page. When the application is first loaded, the user may notice a slight delay before they can see the full page, this is because the page isn't fully rendered until all the JavaScript is downloaded, parsed, and executed.

After the page has been loaded for the first time, navigating to other pages on the same website is typically faster, as only necessary data needs to be fetched, and JavaScript can re-render parts of the page without requiring a full page refresh.

first pages, re/render parts of the page without requiring a full page refresh












we can now add an itme toi our cart, only problem ius the double click 


with hydration error, one thing we can ask is ::

What is Server-Side Rendering? Definition and FAQs

HEAVY.AI
https://www.heavy.ai › technical-glossary › server-side-...
Server-side rendering (SSR) is an application's ability to convert HTML files on the server into a fully rendered HTML page for the client.



Next.js offers server-side rendering (SSR) as a way to pre-render pages on the server for each request. This contrasts with client-side rendering (CSR), where the browser loads a minimal HTML file and fetches the content using JavaScript. 




do this:: 

we want to make sure that we can buy a product,
where does our journey stop? click a product, add to cart, ggo to cart checkout, click buy 




we








i have added a navbar in all of my next.js pages

i have made bannmer more similar to the height of the holzweiler page on medium big screens, it is more square rather than so very wide and rectangular 


added minimum height to mainbanner, based on screen height min-height-30vh
min-h-[<value>]
fix::


we are fixing the sellers page, now updated headline, and our boxes have round images and are 2 in the ghorizontal width on big screens, we separate them well, we have uimported fonts from google, using next font google :: 


import { Merriweather } from 'next/font/google';
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'], // Specify multiple weights
});

we know which weight of font we are using because this gives us a bolder font:: 

.font-strong {
  font-weight: 900;
}

code from our globals.css

we made a double seller element in the width by using flex on the correct containers for the sellers elements, like this ::



    <li  key={product.id} className="p-4 bg-gray-200 rounded flex relative">
          <Link href={`/products/${product.id}`} className="block">
            <div className="flex items-center space-x-4 ">
          <img alt="hhh" src={product.images[2]} className="w-12 flex rounded rounded-full aspect-square object-cover" />
              <p className="text-sm text-gray-600 bg-gray-400">{product.name}</p>
                     
            </div>
         
          </Link>
        </li>


make it so that on pc, sellers are double width








i fixed part of the selgere page, by using a flex container and adding content so that the content would be side by side 


With flexbox, we can use a more intuitive way of aligning our two div elements.

we also found our folder structure, and we used our folder app, then added folder products, rechable by url /products



the sellers page 




breakthrough suddeenly, have page.js in next.js folder that equals url 
each folder represents a route segmens, a route segment segments itself in a URL path


by reading these docs>> 
https://nextjs.org/docs/app/getting-started/project-structure
i was able to remind myself of how the next js folder structure page.js works 

route structure defined through folders

]in ym app folder, i added a products folder with a page.js, there is a root quality to the page.js

it is the root, default default default value of any url address that uses the folder name of that page.js, next.js routing

https://nextjs.org/docs/app/getting-started/project-structure
https://nextjs.org/docs/app/getting-started/project-structure


Colocation
In the app directory, nested folders define route structure. Each folder represents a route segment that is mapped to a corresponding segment in a URL path.

However, even though route structure is defined through folders, a route is not publicly accessible until a page.js or route.js file is added to a route segment.

A diagram showing how a route is not publicly accessible until a page.js or route.js file is added to a route segment.
And, even when a route is made publicly accessible, only the content returned by page.js or route.js is sent to the client.





there is a problem, we have so many files perhaps we do not need,

we must be sure that we are using what we need, currently, we are not being able to use our routes, it shuold be as simple as this::
in our app directory, add a folder with a page.js, that folder is the URL addition, so /products folder with a page.js file, means we can visit localhost/products and get the elements from its hosted page.js

is it so that our pages folder goes in the same level ass our app folder?
https://nextjs.org/docs/app/getting-started/project-structure
https://nextjs.org/docs/app/getting-started/project-structure

routing next.js::

i want to create a navbar where i can clickto go to for example the products page
localhost/products


Example: If you create pages/about.js that exports a React component like below, it will be accessible at /about.


export default function About() {
  return <div>About</div>
}


https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts
https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts

it says that if each page is associated wutgh a route based on its file name

okay, so i create a folder called pages, but where is my pages folder supposed to be 





we need a very simple design with very clear recognisable design elements

any addition will be striking and self explanatory 
every element is striking





what do i need now? ?

i need to create a new world ::

we are doing holzweiler



![alt text](image.png)













how to import files from firebase::

always simple::

we want somethign from a database, we must connect with the correct intel, create config file,

then just write command that references config file, we hit the exact database with our precise request for a database resrouce from that exact database 







































currently we are checking our postProudct.js component, the summary is::
we can create a brand new product,with multiple big files, we have done that, then we can edit the product post, we can remove a big file and click update, that is successful 
also:: it is successful when we remove an image and change title, and click update product, event completes successfully 








we now have complete combination of server and client requests, we have our firebase updates on the client, then when promise.all is resolved we have our async function where we now await code resolved and we now do our stripe update with our new product ojbect that rewrites the previous stripe product object, now we update, on client side always with the correct product object when we request stripe, the complete resolved product object on client side, we have top state control









error is here:


our problem is that our state  product object is being reset somehow:
when we delete an image
product state reset before upload error notes::

1:: right as we click "x" to delete an image we are successful, our product
is correct with the images array diminishing correctly. but when we then click submit to uploadToFirebase and stripe, our product images files are suddenly zero, i believe it could be because of our stripe upload new files, that it is setting images to zero since we are not uploading any new files?







we have an object, whenever we go to sned it off ot our stripe backend, it lacks some of the values we put into it

there is one array that decides what goes into our product images, and that is the array ::


theory: i believe that our product is getting fed with only the firebaseUpload urls and not also the ucrrent product images




we are updating, but it is taking only the new upload image, we must give it our previous one as well




when we are adding an image to our update, problem is::
our product object only adds the newly added image, the old ones are gone for no reason



















whenever we upload and send something to our backend, our product seems to reset right before sending request to backend api










now all we need is to call stripe normal update with this image array that will overwrite the previous one

i did something that might be bad, find it in postProduct with this line:  //careful here 500::







   if(deletedFiles.deletedFiles.length>0) {

  console.log("postProduct deleteFiles in uploadStripe function, kicking off backend hopefully, with these files/ images: ", validResults)
   deleteFiles()
 }

we have undefined deletedFiles upon calling them, despite the premise of calling it from the handleSubmit function is that deletedFiles is not undefined




current error in postProduct.js:: we call our function uploadFilesToFirebase(), we do that because we have 
a length on our deletedFiles that exceeds 0, meaning we have files we want deleted, problem is that inside of this function it logs these deleted files upon being called, but inside the function these files to be deleted are only logged as "undefined", then how can we delete them?



//we have a problem, when we call this function we have deletedFiles.deletedFiles, but when we then arrive here our deletedFiles are non existent























current error is that our backend is not being called when we have only deleted images, but we have the image array and it would be easy to just overwrite stripe array with our new correct array,
that can be done after we have done both delete and add, we have one true array, top level single truth, it all gathers at one point, we only deal with the one point top truth in its completed form




error: we are not triggering our   uploadFilesToStripe(); when we have deleted images






current problem is that we are triggering a change in our product, and that triggers a lot of sideEffects probably



our problem is we are actually firing of our stripe update request, we are firing of an update 







make sure to log every deleted item from files array















we can currently add whatever we want on stripe product edit, only problem is::
when we edit we dont have to add any new images, so our if condition that demands a return of firebase references can be changed when edit boolean is true via query param url


we are currently adding new images when we update a stripe object












































AI would never actually do exactly what i am doing, in my city, for my family















important point:: our new input files from an array in postProduct.js are added to our final product object before being sent to our next.js backend endpoint, that means we should get an entire product object to our next.js endpoint


when we call our create product function, but instead we have an update, it can still work, because::: when updating the only thing we need for our server endpoint are the changes, we do not need what is already uploaded, at least for adding, so when we want to add images, we just do everything the same, we save new images from input files, then we send it to a different next.js backend endpoint::

send it to endpoint: api/products/updateProduct.js

extra intel folder and API endpoint in next.js::

API routes provide a solution to build a public API with Next.js.

Any file inside the folder pages/api is mapped to /api/* and will be treated as an API endpoint instead of a page. They are server-side only bundles and won't increase your client-side bundle size.




okay question for our now do something task:
what is actually happening on our submit of the postproduct form?::



this is our submit and it happens on the dependency that our  firebase function is complete and we therefore have a "uploadedUrlsArray" with items in it::

can we just add an if that does a different post request if we have our query param edit is true


perhaps we can add an "edit"

perhaps simplest thing we can do is just change our
endpoint

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





































now do something simple for the postProduct component::

when editing, upload an image to firebase when you submit, to differnetiate this process, after fireabse upload the urls should be given to the stripe function, but the stripe function should now seek to update,
okay first:

when url  holds this:: parameter ?edit=true have firebase upload one image and return the URL to our stripe http client to endpoint request function in postProduct.js

Yes, ?edit=true is a query parameter often used in URLs to indicate that an "edit" mode should be enabled.
















FOR OUR EDIT/CREATE new product compoment::: we have our editstate, either true or null, we have our productId, from our url query params

now we either edit our create a new prodcut, now WE MUst make it so that when we edit we request the correct edit http method via our backend endpoint that must handle stripe product update, we laready handle stripe product upload on backend of our next.js server, safer backend to foreign server, now make sure product upload standard stays functional while you add edit functionality, clearly separate all edit functionality by one simple solution ONE BIG IF statement, meaning only do this IF edit is on edit is true




we are now logging if our queryparams edit is true or null, like this::
in postProduct.js we do this 

  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");


  so now we can request differently if we know it is an edit::
  then we must check our file input array , here::


    const onChange = (e) => {

    if (e.target.files) {
          console.log("postProduct files added:", e.target.files)
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files)]);
    }
  };

so we must perhaps create an array that if queryParams edit is true, we make sure to upload these image files to firebase on complete form submit, and then we proceed with stripe update product by id, we have product.id, also get param id from query parameter url
https://localhost:3000/products/prod_SKXteq36jDs6Dp

there is an id:: 
https://localhost:3000/products/prod_SKXteq36jDs6Dp







ProductPage({ params }: { params: { productId: string } })


























now check, after editing: do you have a valid product object to send into upload territory (before sending to backend you fix firebase file upload on frontend)?


for our queryParams we have searchParamsValue::

  const isEditing = searchParamsValue?.edit === "true";
  that is how we get our url with edit intel


editParams is either true or it does not exist in our create product, so use strict equal operator

queryParams === true, will be false if it is null









basically, if we are editing and we click:: the button type submit, now we must check



we must check our 
  const isEditing = searchParamsValue?.edit === "true";

  how can we transfer our isediting value, just check params in the component 




here we got our instructions for context, sharing state between component::

https://react.dev/learn/passing-data-deeply-with-context

jsut create the context then wrap children in the context and use the context 


basically import useContext from the component that does createContext :: 
import { LevelContext } from './LevelContext.js';

levelContext.js is basically this::
import { createContext } from 'react';

export const LevelContext = createContext(1);












currently:: we log every text input perfectly, we have all updates instantly logged to postproduct 135, problem is::

we must also log images that are updated, perhaps outside of main array sinc these images are different and require different treatment, they must go to firebase upload, and then url from successful upload to stripe product images array, basically: now make sure to log new image uploads from file input in psotProduct.,js

now we are logging new files added from our file input in postProduct.js like this:


  const onChange = (e) => {

    if (e.target.files) {
          console.log("postProduct files added:", e.target.files)
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files)]);
    }
  };


onchange we do onchange function in relation to file input in postproduct.js

      <input className="block w-full mt-2 p-2 border rounded" type="file" name="image" onChange={onChange} multiple />



----NOW, we have a different place for new files added, all these files must IF they exist be added through the firebase upload system, and then sent to their stripe product parent, we must do this so it rhymes with a normal product creation, check if you can initiate the same process from a different place in the code of postProduct.js. The scenario we must fix here is:: we are editing meaning this value is true "isEditing", then another things is true:: we have images logged in our file input, these are new images, that we want to upload to firebase and then reference url value to stripe::

in postproduct.js line 120 we are logging the current array like this::

postProduct files added: FileList {0: File, length: 1}0: File {name: 'qr johan e kule, mmm o.png', lastModified: 1747134968786, lastModifiedDate: Tue May 13 2025 13:16:08 GMT+0200 (Central European Summer Time), webkitRelativePath: '', size: 21394, …}length: 1[[Prototype]]: FileList
hot-reloader-client.js:197 [Fast Refresh] rebuilding

it can take multiple objects, it is an array, we have full control of current array input file in postProduct.js, this array must now be treated when are have true "isEditing", then it must be valued processed refined..

how to separate editing processed and create new product processes?
whenever true "isEditing we must treat everything differently
























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







now about our component page.js on dynamic id and postProduct.js, we know when we are editing,
we are editing when::

our boolean is true, here "isEditing": 


   {isEditing ? (
            <PostProduct currentProduct={productWithPrice} />
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">{productWithPrice.name}</h1>
              <p className="mt-2 text-gray-600 text-lg">{prod

              that means that whenever we are editing:::
              we do an update of stripe, question:: 



basccially we need to send a request to a different endpoint when we update versus when we create new, perhaps have same endpoint but 



update a product in stripe 

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























is my 




































jsut think;:: okay we have url, now we must add the urls to our stripe product



we want our postProudct.js component to upload files to firebase, then upload stripe product, then get stripe id, then upload firebase url images with matching metadata stripe id in firebase to stripe product mathcing id image array file array

our current problem is the preview of our images, we must make it so that if there is no image array then we must preview url from our local files 

and if there are urls from our firebase we will prioritize this


we need to upload to firebase
we are uploading files














fix image files files input in postProduct.js, get a log after inputting files::








we want to add 















i want to fix our postProduct form component so that whenever it has a currentProduct as the param, then we must send a patch request on event, we want to different buttons, tie it to the button text, when that boolean swaps we swap onclick functionality
















remember for our edit of product, using postProduct.js and page.js from folders products [id]
we must utilize our URL query, our parameters, IF our URL is edit 
https://localhost:3000/products/prod_SI7hhS3IFofhEI?edit=false
if it is edit true, then we must do a patch with our product object, we have our product object in postPorduct.js, we can then do a stripe update with that,

for new files and the removal of files, note that firebase must be kicked in

if removal only, then we do delete those images files from firebase, just do id of those, have metadata that connects any firebase file linked to a product with uniuqe stripe id product in firebase connected file metadata. NOW ::: check 

A query string is a set of characters tacked onto the end of a URL. The query string begins after the question mark (?) and can include one or more parameters. Each parameter is represented by a unique key-value pair or a set of two linked data items. An equals sign (=) separates each key and value.

query string for edit in URL; make sure that if edit  we do stripe patch to update product
we must update product when author matches for admission authorization product update stripe product object state postProduct.js









we need to create a component that either renders the product form or the product detail component, the url query we can get from our current product detail url anyways


the product form component is: 

postProduct.js


the details component is::

api product id page.js

page.js

-----


cna you write 
honestly it makes sens to use url for the product id, because we are on the product route when we edit, we are editing a specific product anyways


solution::go to api/products/[id]/page.js
there you add to the page.js component
:: add boolean:: if edit is active then we do the productForm component,
but the productForm component needs certain values whenever it is used on an already made product, we want to edit product, not create new product
































now: how to add our qrCode, we have code form our React, now our question is:
how can we add the "write and qr code is generated?



we must import our QrDecoder.jsx, it is an all in one compoent, it takes action whenever there is a file present, and then it presents the decoded text

qrDecoder is a stand-alone component












we have our world of imagination
we have our product detail, that is the component:
in the folder structure: products/[id]/page.js ---so we create  a page on the specific path that is the product id page
so the url is:: https://localhost:3000/products/prod_SI7hhS3IFofhEI










we must know our postProduct.js
we are trying to update a stripe product, but we must move that code to the server side, rather than the client side

what we must keep: 

what is it that we must remove?
















our current problem is that upon product Upload, nothing happens to our imageInput, it does not auto upload
i need a clear sign on the exact moment that we have uploaded our product


we now have our component addimages.js, it is uploading all of our added input file images to firebase, one by one, in one big promise, so when all files from upload array have been upload we return one array with all the evidence, the URLs of the upload in one new array, that array must then be uploaded to our stripe with matching ID to that stripe product and the files extra id property in firebase





to understand, you must find the source, example::

i had to add a property value to an object
example data object property: 
Syntax
Return the data property:

objObject.data, from w3 schools

so we had to find a solution for adding a data property in firebase,
we went to the docs, start simplest block:: principles nature smallest: it is a file, we upload the file to firebase: we search firebase file upload, then we find that we can specify extra details for that file, it is called metadata

Add File Metadata
When uploading a file, you can also specify metadata for that file. This metadata contains typical file metadata properties such as name, size, and contentType (commonly referred to as MIME type).

metadata file, properties to file upload object

link solution add properties to file upload firebase::

https://firebase.google.com/docs/storage/web/upload-files
https://firebase.google.com/docs/storage/web/upload-files

simples go to provider and search file upload, we have metadata properties, often properties like::
size, name, contentType
const metaData = {

  contentType: 'image/jpeg',
}

we import to our component, import {uploadBytes} from "firebase/storage"; 
then upload file uploadBytes(storageRef, file, metaData)






now:: we must understand the difference between client and server

we have client and server components





next.js uses server and client component, client refers to the browser on a user's device
request to server

rever refers to the computer in a data center that sstores your application code, capabilites server code on files application code 



Using Client Components
As you learned in the last chapter, Next.js uses Server Components by default - this is to improve your application's performance and means you don't have to take additional steps to adopt them.

Looking back at the error in your browser, Next.js is warning you that you're trying to useState inside a Server Component. You can fix this by moving the interactive "Like" button to a Client Component.



https://nextjs.org/learn/react-foundations/server-and-client-components

we use server components to improve application's performance application performance, write code on server data center that stores application code, 

with oru client code hook useCart we must wrap all of our components to have them use that functionality we have our different items in our cart, we have cart state, usecart hook exposes getters and setter for our cart state , we now have cartwrapper, it takes children components as parameters and then deploys that inbetween itself to return every component that it wraps, it deploys, we have our cartprovider it wraps our cartprovider now wraps any component because we create an artificaial enviroment for that 

artificial 

we now have state we can hook into that, with hook we expose functionality 


we now have sign in we have current signed in we listen to auth 







 have your products share a link when you click on them 









































arrow functions shorter syntax::

arrow function::

functionName = ( ) => {
  return "function value"
}

can also do this:
return a value automatically:
arrow function returns value by default::

functionName = () => "function value";













listen to auth object firebase, current user::

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

        my auth is import getAuth from firebase/auth combined with my app from firebaseconfig with config key value pairs properties object::

          const auth = getAuth(app); we have different sign in methods firebase email password

          firebase users are addedd in firebase project with our createuserWithemailandpassword method authentication firebase console

          observer auth object intermediate stat


          auth object states











const AdvancedFunction = () => {

    bunch of advancedCode
}



function react::

Example
With Arrow Function:

hello = () => {
  return "Hello World!";
}


we are basically easily calling our function with new value by our variable

statement arrow functions return value by default

then customHook = const useAdvancedFunction = () => AdvancedFunction(newParameterValue)


useHooks

invoke a function::

Exactly! You’re defining a custom hook that acts as a shortcut to invoke useContext. Instead of manually calling useContext(AuthContext) everywhere, simply calling useAuth() instantly retrieves the authentication state and functions.









hooks explained react:
Hooks let you use different React features from your components. 
state allows a component to remember information like user input
Context Hooks 
Context lets a component receive information from distant parents without passing it as props.
useContext reads and subscribes to a context.
function Button() {
  const theme = useContext(ThemeContext);
  // ...

  so we have useContext(ThemeContext)


  Hooks should be immutable and not be mutated. Instead of mutating a Hook dynamically, create a static version of the Hook with the desired functionality.

function ChatInput() {
  const data = useDataWithLogging(); // ✅ Good: Create a new version of the Hook
}

function useDataWithLogging() {
  // ... Create a new version of the Hook and inline the logic here
}

----when we want to add vakyes to our hook, we create a new hook, we dont have our only source of the hook be where it changes


so we have a variable that calls a set of functions, and via that hook we instantly get a value quite simply?



Exactly! When you define `useAuth`, you're creating a **custom hook** that acts as a shortcut to access values from `AuthContext`. 

### **How It Works**
- `AuthContext.Provider` holds values like `user` and `handleSignOut`.
- `useAuth()` retrieves those values instantly **without needing to manually call `useContext(AuthContext)` everywhere**.
- Since `useContext(AuthContext)` provides direct access to the context, **calling `useAuth()` instantly gives you `user` and authentication functions**.

### **Key Benefits**
✅ **Encapsulates logic** – You can extend `useAuth` later to include login/signup without modifying components.  
✅ **Makes code cleaner** – Instead of `useContext(AuthContext)`, components just call `useAuth()` for easy access.  
✅ **Instant retrieval** – Since React preserves state, `user` is instantly available across the app.

Would you like to extend the hook to include authentication functions like login and registration? 🚀




we must install chocolatey so we can install mkcert, mkcert will create a certificate so we can run https locally, encrypted and safe connection
, 

installed chocolatey, had to make sure our folder for default installation was not populated,
in admin powershell i could delete folders from certain paths, to make sure i could install in that address 




context:: we create a context, then a custom hook to use the context, we useAuth, then useContext is immediately invoked