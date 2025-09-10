import React from 'react'
import { db } from '../../firebase/firebaseConfig';

import { collection, addDoc, doc } from 'firebase/firestore';
export const saveFavourite = (productID, user) => {

 //step one, check if user is logged in, then get user object
 //get product objecthttps://localhost:3000/products/prod_004



 if (!user) {
        console.log("User not logged in");
        return;
    } else {

 //step 2, if logged in, save productID to user's docuemnt into subcollection favourites in database
   
async function addDataToSubcollection() {

    const data = {productID: productID};
 //2.1 Get a reference to the parent collection and document
    const parentDocRef = doc(db, 'users', user.uid);

  // 2. Get a reference to the subcollection within the parent document
    const subcollectionRef = collection(parentDocRef, 'favourites');

       const newDocRef = await addDoc(subcollectionRef, data);
    console.log("Document added to subcollection with ID: ", newDocRef.id);

        console.log("User is logged in, userID: ", user);
    }

    addDataToSubcollection()

    }



console.log("favourite product clicked, productID: ", productID, 'userId:', user.uid);

//

}


