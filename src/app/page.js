'use client';

import { useState } from 'react';
import { AuthProvider } from './auth/authContext';
import Navbar from './components/Navbar';
import MainBanner from './helpers/mainBanner';
import GetProducts from './get/getProducts';
import UserRow from './components/UserRow'
import HeroBanner from './components/HeroBanner'
import Footer from './components/Footer'
export default function Home() {
  const [user, setUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  return (
    <AuthProvider>
      {/* Optional navigation bar */}
      {/* <Navbar /> */}

      <MainBanner />
      <GetProducts />
  

      {/* Placeholder for your future chat system */}
      {/* You can conditionally render chat components here based on user state */}
 <HeroBanner/>
<UserRow/>

<Footer/>
    </AuthProvider>
  );
}