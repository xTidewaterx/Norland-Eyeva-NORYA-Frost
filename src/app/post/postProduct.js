"use client";

import { useState, useEffect } from "react";
import { storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from "firebase/storage";

import { app } from "../firebaseConfig";

import { v4 as uuid } from "uuid";
require("dotenv").config();
import { useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";

export default function PostProduct(productValue) {
  const paramsId = useParams().id;

  console.log("Product ID from query params in postProduct.js:", paramsId);

  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");

  const arrayForParams = [
    { log: "Product ID from query params in postProduct.js:", paramsId },
    {
      log: "Product edit status frp, query params in postProduct.js:",
      editParam,
    },
  ];




  console.table(arrayForParams);

  console.log("PostProduct create/edit product url param::", editParam);

  //console.log("PostProduct create/edit product url param::",  productIdFromQuery)

  // Determine edit mode based on query parameter

  //console.log(logAsyncSearchParams)  // Determine edit mode based on query parameter

  // State for product details
  const [product, setProduct] = useState({
    name: productValue ? productValue?.currentProduct?.name : "",
    description: productValue ? productValue?.currentProduct?.description : "",
    price: productValue ? productValue?.currentProduct?.price : "",
    images: productValue ? productValue?.currentProduct?.images : [],
    id: "",
  });

  const [updateProduct, setUpdateProduct] = useState({
    name: productValue ? productValue?.currentProduct?.name : "",
    description: productValue ? productValue?.currentProduct?.description : "",
    price: productValue ? productValue?.currentProduct?.price : "",
    images: [],
    id: "",
  });

  const[deletedProduct, setDeletedProduct] = useState({});

  useEffect(() => {
    setProduct({ ...product, id: paramsId });
  }, [paramsId]);

  useEffect(() => {
    setUpdateProduct({ ...updateProduct, id: paramsId });
    console.log("postProduct.js updating postProduct.js: id", paramsId);
  }, [paramsId]);

  const [uploadedUrlsArray, setUploadedUrlsArray] = useState([]);
  const [productId, setProductId] = useState([]);
  const [files, setFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
    const [uploadNow, setUploadNow] = useState(false);

  useEffect(() => {

console.log("postProduct.js, current deleted files from product object:", deletedFiles)
  },[deletedFiles])


  //error:: this is being submitted when it is not supposed to
  //here we have our stripe upload function that only fires when we have completed our items in our uploadedUrlsArray from firebase
  
  //step 5:: complete product object uploaded to stripe including files from firebase are now uploaded to stripe or deleted if requested by client::
  const uploadFilesToStripe = async () => {

    
    setUpdateProduct({ ...updateProduct, name: product.name });

    //careful here 500::
    //if we have not added any new files on this product form session, do not submit any image files to stripe
    if (files?.length == 0) {
   //   setProduct({ ...product, images: null });
      console.log("jaguar");
    }

    console.log(
      "postProduct.js product form uploadedUrlsArray: ",
      uploadedUrlsArray
    );





    console.log(
      "postproduct editParam right before possible edit:",
      editParam,
      "then check if true, triple equals:",
      editParam === "true"
    );
    const endpoint =
      editParam === "true" ? "/api/products/updateProduct" : "/api/products";
    console.log("endpoint in postProduct.js:", endpoint);


      console.log("checking updateProduct image array right before upload postProduct.js: ",updateProduct.images)

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    console.log("postProduct upload data return id: ", data.id);
    setProductId(data.id);
  }







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















  useEffect(() => {
    if (productValue?.currentProduct && uploadedUrlsArray.length > 0) {
      console.log(
        "postProduct.js setting product:",
        productValue?.currentProduct
      );

      setProduct(productValue?.currentProduct);
      
      //not the culprit of the 0 image product upload:
    //  setProduct({ ...product, images: uploadedUrlsArray });
    }
  }, [uploadedUrlsArray]);

  useEffect(() => {
    console.log(
      "postProduct.js form upload/edit product, log product:",
      product
    );
  }, [product]);



  //step 2:: firebase function:: figuring out which files must be uploaded to firebase:
const uploadFilesToFirebase = async () => {
  console.log("postProduct.js uploading files to  firebase now, files:", files)
 // if (files.length === 0) return;
 const deleteFiles =async ( ) => {

//we have a problem, when we call this function we have deletedFiles.deletedFiles, but when we then arrive here our deletedFiles are non existent

console.log("inside of postProduct uploadFilestoFirebase function deleteFiles orange: ",deletedFiles)
 console.log("deletedFiles.deleteedFiles postproduct.js orange: ",deletedFiles.deletedFiles)

  // Step 2.1: Delete Images from Firebase (If They Exist)
  if (deletedFiles?.deletedFiles?.length > 0) {
    const deletePromises = deletedFiles.deletedFiles.map(async (file) => {
      try {
             console.log("logging firebase image path in postproduct.js", file.image)
        const imagePath = getStoragePathFromUrl(file.image); // Extract storage path
   
        if (!imagePath) throw new Error("Invalid Firebase image URL");

        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
        console.log(`Deleted: ${file.image}`);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    });

   const results= await Promise.all(deletePromises);

   const filteredArray = product.images.filter(value => !deletedFiles.deletedFiles.includes(value));



   console.log("filteredarray, deleted values removed from product array, new array without deletions:", filteredArray)
  // const newImages = product.images(())
  


  const validResults = results.filter((url) => url); // Remove null entries
 setUploadNow(true)
      // Update state with new images
  setUploadedUrlsArray(...product.images, filteredArray);
  console.log("postProduct valid results, settings state product image after deletion in firebase, this is the value we are setting as images:", filteredArrays)
  setUpdateProduct({ ...product, images: filteredArray});
  setUpdateProduct({ ...product, name: product.name});
  setProduct({product, images: filteredArray})

  setDeletedProduct({...product, images:filteredArray})
  //setProduct({ ...product, images: validResults });

  }



   }

   if(deletedFiles.deletedFiles?.length>0) {

  //console.log("postProduct deleteFiles in uploadStripe function, kicking off backend hopefully, with these files/ images: ", validResults)
   deleteFiles()
 }


   console.log("deletedFiles.deletedFiles postproduct.js:", deletedFiles.deletedFiles)
 

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
  setUploadedUrlsArray(validResults);
  //setUpdateProduct({...product, images: validResults})
  setUpdateProduct({ ...product, images: validResults });
  setProduct({...product, images: validResults})
 

  

if(editParam) {



  const currentStripeProductImages = product?.images.map((productFiles)=> productFiles);

  console.log("currentStripeproductimages, current product files before new uploads: ",currentStripeProductImages)

  const newStripeProductImages = validResults.map((productFiles) => productFiles)
console.log("newStripeproduct images: from uploads to firebase:",newStripeProductImages)


  console.log("attempt at combined images array postProduct.js right before upload:", {images: [...currentStripeProductImages,...newStripeProductImages ]})

   setProduct({ ...product, images: [...currentStripeProductImages,...newStripeProductImages ] });


}

};

// Helper function to extract storage path from Firebase URL
const getStoragePathFromUrl = (url) => {
  const baseUrl = "https://firebasestorage.googleapis.com/v0/b/norland-a7730.appspot.com/o/";
  if (url.includes(baseUrl)) {
    return decodeURIComponent(url.split(baseUrl)[1].split("?")[0]);
  }
  return null; // Invalid Firebase URL
};

  //console.log(files, "files length in postProduct.js:",  files?.length)


  useEffect(()=> {

  //when we submit we want these deleted files to be removed from firebase, and in effect, stripe also
  //so on submit, also request an endpoint to delete firebase files
    console.log("postProduct.js deleted files: ", deletedFiles)

//do file deletion on frontend



  }, [deletedFiles.length]);



  //important!!
  //step 1: checking what databases APIs we must request
  // here we fire off our uploadFilesToFireBase function if (there are files in the (new)files array or if there are deleted files in the deleted files array)
  // else we do this: (if firebase is not needed for big file changes) this function will upload product directly to STripe
   //OR:: it will 
  const handleSubmit = async (e) => {
    e.preventDefault();

       console.log(files, "files length for deleted files in postProduct.js:", deletedFiles.deletedFiles?.length);


    if (files?.length != 0  || deletedFiles?.deletedFiles?.length>0) {
      console.log(files, "files length for new files in postProduct.js:", files?.length);
           console.log(files, "files length for deleted Files in postProduct.js:", deletedFiles.deletedFiles?.length);


      await uploadFilesToFirebase();
    } else {
      console.log("directly uploading to stripe, because there are no big file edits requiring firebase:");

      uploadFilesToStripe();
    }
  };

  const onChange = (e) => {
    if (e.target.files) {
      console.log("postProduct files added:", e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files)]);
    }
  };
 
 
 
  //step 1: this function stop stop stop




  // Remove an image from the product's images array
  const removeImage = ({image,index}) => {




  setDeletedFiles((prevFiles) => {
    // Ensure prevFiles exists and `deletedFiles` is an array
    const deletedFilesArray = prevFiles?.deletedFiles ?? [];

    console.log("postProduct deleted files array:",deletedFilesArray)

    return {
      ...prevFiles,
      deletedFiles: [...deletedFilesArray, { image }],
    };
  });






  
  console.log(deletedFiles)
    setProduct((prevProduct) => ({
      ...prevProduct,
      images: prevProduct.images.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    console.log(
      "component postProduct.js, product state object was just edited: ",
      product
    );
  }, [product]);



  return (
    <form onSubmit={handleSubmit} className=" w-96 mx-auto">
      <h2 className="text-lg font-bold">Add New Product</h2>

      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
        className="block w-full mt-2 p-2 border rounded"
      />

      <input
        type="text"
        name="description"
        placeholder="Description"
        value={product.description}
        onChange={(e) =>
          setProduct({ ...product, description: e.target.value })
        }
        className="block w-full mt-2 p-2 border rounded"
      />

      <input
        type="text"
        name="price"
        placeholder="Price"
        value={product.price}
        onChange={(e) => setProduct({ ...product, price: e.target.value })}
        className="block w-full mt-2 p-2 border rounded"
      />

      <input
        className="block w-full mt-2 p-2 border rounded"
        type="file"
        name="image"
        onChange={onChange}
        multiple
      />

      <div className="mt-4">
        <h3 className="font-semibold">Product Images:</h3>

        {/* Fixed height container to prevent movement */}
        <div className="flex flex-col gap-4 mt-2 w-full h-[300px] overflow-y-auto border border-gray-300 rounded">
          {product?.images?.map((image, index) => (
            <div key={index} className="relative w-86">
              <img
                src={image}
                alt={`Product ${index}`}
                className="w-86 h-auto object-cover rounded"
              />
              <button
              type="button"
                onClick={(event) => {   
                  event.stopPropagation();
                   removeImage({image,index})}}
                className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded"
              >



                ✖
              </button>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded">
        {productValue?.currentProduct ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}
