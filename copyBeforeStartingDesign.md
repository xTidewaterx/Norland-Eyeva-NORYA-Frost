copy of app root page.js component before starting design of norland mvp:::



import Image from "next/image";

import { RegisterUser } from "./auth/register";
import AuthStatus from "./auth/authStatus";
import { AuthProvider } from "./auth/authContext";
import { SignInUser } from "./auth/signIn";

import PostProduct from "./post/postProduct";
import GetProducts from "./api/products/components/getProducts";
import { GoogleSignIn } from "./auth/googleSignIn";
import { ImageInput } from "./post/addImages";
import Link from "next/link";
import QRDecoder from "./api/products/components/qrDecoder";
import { CreateQrCode } from "./createQrCode";

export default function Home() {


  
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


















     






import Image from "next/image";

import { RegisterUser } from "./auth/register";
import AuthStatus from "./auth/authStatus";
import { AuthProvider } from "./auth/authContext";
import { SignInUser } from "./auth/signIn";

import PostProduct from "./post/postProduct";
import GetProducts from "./api/products/components/getProducts";
import { GoogleSignIn } from "./auth/googleSignIn";
import { ImageInput } from "./post/addImages";
import Link from "next/link";
import QRDecoder from "./api/products/components/qrDecoder";
import { CreateQrCode } from "./createQrCode";

export default function Home() {


  
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





import Image from "next/image";

import { RegisterUser } from "./auth/register";
import AuthStatus from "./auth/authStatus";
import { AuthProvider } from "./auth/authContext";
import { SignInUser } from "./auth/signIn";

import PostProduct from "./post/postProduct";
import GetProducts from "./api/products/components/getProducts";
import { GoogleSignIn } from "./auth/googleSignIn";
import { ImageInput } from "./post/addImages";
import Link from "next/link";
import QRDecoder from "./api/products/components/qrDecoder";
import { CreateQrCode } from "./createQrCode";

export default function Home() {


  
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
