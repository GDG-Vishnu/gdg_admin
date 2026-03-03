import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">GDG Community</h3>
          <p className="text-muted-foreground max-w-xs">
            Connecting developers and tech enthusiasts to learn, share, and grow together.
          </p>
        </div>
        <div className="flex gap-8">
          <Link href="/events" className="text-muted-foreground hover:text-primary transition">Events</Link>
          <Link href="/about" className="text-muted-foreground hover:text-primary transition">About</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-primary transition">Contact</Link>
        </div>
        <div className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} GDG. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
