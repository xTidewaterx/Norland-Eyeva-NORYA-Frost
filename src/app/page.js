'use client';


import { AuthProvider } from './auth/authContext';

import MainBanner from './components/homePage/banner/MainBanner';
import GetProducts from './components/homePage/get/GetProducts';

import HeroBanner from './components/homePage/banner/SecondBanner'
import Footer from './components/Footer'
import UserRow2 from './components/UserRow2'
export default function Home() {

  return (
    <AuthProvider>
      {/* Optional navigation bar */}
      {/* <Navbar /> */}

      <MainBanner />
      <GetProducts />
  

      {/* Placeholder for your future chat system */}
      {/* You can conditionally render chat components here based on user state */}
 <HeroBanner/>
<UserRow2/>

<Footer/>
    </AuthProvider>
  );
}



