'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNorya, setShowNorya] = useState(false);

  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (isHomePage) {
      const timer = setTimeout(() => {
        setShowNorya(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isHomePage]);

  return (
    <nav className="text-sky-700 relative z-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo + NORYA */}
<Link href="/" className="group flex items-center h-full m-0 pl-2 pr-2 transition-all hover:bg-yellow-400 hover:rounded-b-md">
  <div className="flex items-center space-x-2 h-full">
    <img
      className="w-8 h-8 transition-all"
      src="/norland-logo.png"
      alt="Norland Logo"
    />
    {isHomePage && showNorya && (
      <span
        id="navbarTextTarget"
        className="text-2xl pl-1 pt-1 font tracking-tight text-sky-700 transition-all duration-500 opacity-0 group-hover:opacity-100"
      >
        NORYA
      </span>
    )}
  </div>
</Link>

          {/* Hamburger Menu (Mobile) */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden z-50 relative focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg
              className="w-6 h-6 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6 h-full m-0">
            {[
              { href: "/sellers", label: "Selgere" },
              { href: "/products", label: "Produkter" },
              { href: "/omoss", label: "Om oss" },
              { href: "#", label: "Favoritter", extra: "pt-2" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`hover:bg-yellow-400 hover:rounded-b-md px-3 py-2 m-0 h-full transition-all ${item.extra || ""}`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/products/cart"
              className="hover:bg-yellow-400 hover:text-white hover:rounded-b-md h-full me-0 pr-4 pl-4 py-2 group transition-all"
            >
              <img
                className="w-5 pt-1 filter hue-rotate-180"
                src="/shoppingCartIcon.png"
                alt="Cart"
              />
            </Link>

            <Link
              href="/profile"
              className="group hover:bg-blue-600 hover:rounded-b-md h-full p-2 pl-2 pr-2 pt-[10px] transition-all"
            >
              <FontAwesomeIcon
                className="group-hover:invert pr-2 pl-2"
                icon={faUser}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out origin-top ${
          isOpen ? "max-h-96 opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"
        } overflow-hidden`}
      >
        <div className="px-4 pb-4 space-y-2">
          {[
            { href: "/sellers", label: "Selgere" },
            { href: "/products", label: "Produkter" },
            { href: "/omoss", label: "Om oss" },
            { href: "#", label: "Favoritter" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block py-2 border-b border-white hover:rounded-b-md transition-all"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/products/cart"
            className="hover:bg-yellow-400 hover:text-white px-3 py-2 rounded-b-md transition-all"
            onClick={() => setIsOpen(false)}
          >
            <img className="w-5 sepia" src="/shoppingCartIcon.png" alt="Cart" />
          </Link>
          <Link
            href="/profile"
            className="block py-2 hover:rounded-b-md transition-all"
            onClick={() => setIsOpen(false)}
          >
            Profil
          </Link>
        </div>
      </div>
    </nav>
  );
}