'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const isCheckout = pathname === '/checkout';

  return (
    <>
      {!isCheckout && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isCheckout && <Footer />}
    </>
  );
}
