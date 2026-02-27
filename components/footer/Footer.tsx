import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">GDG Community</h3>
          <p className="text-gray-600 max-w-xs">
            Connecting developers and tech enthusiasts to learn, share, and grow together.
          </p>
        </div>
        <div className="flex gap-8">
          <Link href="/events" className="text-gray-600 hover:text-blue-600 transition">Events</Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-600 transition">About</Link>
          <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition">Contact</Link>
        </div>
        <div className="text-gray-500 text-sm">
          © {new Date().getFullYear()} GDG. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
