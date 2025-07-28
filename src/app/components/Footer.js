'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#001f3f] text-white py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="mb-4 md:mb-0 flex items-center space-x-2 group">
          <img
            src="/norland-logo.png"
            alt="Norland Logo"
            className="w-10 h-10 group-hover:invert"
          />
          <span className="text-lg font-semibold text-yellow-400 group-hover:text-yellow-300 transition-colors">
            Norland
          </span>
        </Link>

        {/* Footer Nav */}
        <div className="flex space-x-6 text-sm font-light text-gray-300">
          <Link href="/about" className="hover:text-yellow-400 transition-colors">Om Oss</Link>
          <Link href="/contact" className="hover:text-yellow-400 transition-colors">Kontakt</Link>
          <Link href="/privacy" className="hover:text-yellow-400 transition-colors">Personvern</Link>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="mt-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Norland. All rights reserved.
      </div>
    </footer>
  );
}